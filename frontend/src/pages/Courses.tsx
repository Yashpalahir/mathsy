import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Clock, Users, BookOpen, CheckCircle, Calendar, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, Variants } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";
import { toast } from "react-toastify";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
};

interface Course {
  _id: string;
  title: string;
  description: string;
  duration?: string;
  timing?: string;
  studentsCount?: number;
  chapters?: number;
  price: number;
  syllabus?: string[];
  color?: string;
  popular?: boolean;
  batchAbout?: string;
  courseDuration?: {
    startDate?: string;
    endDate?: string;
  };
  validity?: string;
  examGuidance?: string;
  counselingSupport?: string;
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleEnrollClick = (course: Course) => {
    if (!isAuthenticated) {
      // redirect to login, preserve intended return path
      navigate('/login', { state: { intended: `/courses` } });
      return;
    }

    // Check if already enrolled
    if (enrolledCourseIds.has(course._id)) {
      // Navigate to video player
      navigate(`/course/${course._id}/watch`);
      return;
    }

    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchCourses();
    if (isAuthenticated) {
      fetchEnrollments();
    }
  }, [isAuthenticated]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      // If user is authenticated, fetch courses filtered by their class
      const response = isAuthenticated
        ? await apiClient.getCoursesForUser()
        : await apiClient.getCourses();

      if (response.success) {
        const data = (response as any).data || response;
        if (Array.isArray(data)) {
          setCourses(data);
        }
      }
    } catch (error) {
      toast.error("Failed to load courses");
      // Error details omitted from console in production
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await apiClient.getEnrollments();
      if (response.success) {
        const data = (response as any).data || response;
        if (Array.isArray(data)) {
          const enrolledIds = new Set<string>(data.map((e: any) => e.course._id || e.course));
          setEnrolledCourseIds(enrolledIds);
        }
      }
    } catch (error) {
      // Silently fail - enrollments are not critical for page load
    }
  };

  // Load external Razorpay script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = "razorpay-sdk";
      if (document.getElementById(id)) return resolve(true);
      const script = document.createElement("script");
      script.id = id;
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleStartPayment = async (course: Course) => {
    try {
      console.log('[Payment] Starting payment flow for course:', course._id, course.title);
      setPaymentLoading(true);

      console.log('[Payment] Loading Razorpay script...');
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        console.error('[Payment] Failed to load Razorpay script');
        toast.error("Failed to load payment gateway. Try again later.");
        return;
      }
      console.log('[Payment] Razorpay script loaded successfully');

      // Get key from backend
      console.log('[Payment] Fetching payment key from backend...');
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('VITE_API_URL is not configured');
      }
      const keyRes = await fetch(`${apiUrl}/payments/key`);
      if (!keyRes.ok) {
        console.error('[Payment] Failed to fetch payment key, status:', keyRes.status);
        throw new Error('Unable to fetch payment key');
      }
      const keyJson = await keyRes.json();
      const key = keyJson.key;
      console.log('[Payment] Payment key received successfully');

      // Create order on server
      console.log('[Payment] Creating payment order with amount:', course.price);
      const orderRes = await fetch(`${apiUrl}/payments/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: course.price })
      });

      if (!orderRes.ok) {
        const body = await orderRes.json().catch(() => null);
        console.error('[Payment] Order creation failed:', body);
        throw new Error(body?.message || 'Unable to create payment order');
      }

      const order = await orderRes.json();
      console.log('[Payment] Order created successfully:', order.id);

      // Truncate description to meet Razorpay's 255 character limit
      const truncatedDescription = course.description.substring(0, 255);
      console.log('[Payment] Description length:', course.description.length, '-> truncated to:', truncatedDescription.length);

      const options = {
        key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: course.title,
        description: truncatedDescription,
        order_id: order.id,
        handler: async function (response: any) {
          console.log('[Payment] Payment successful, received response:', response);
          // Verify payment on backend
          try {
            console.log('[Payment] Verifying payment with backend...');
            const verifyRes = await fetch(`${apiUrl}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const verifyJson = await verifyRes.json();
            console.log('[Payment] Verification response:', verifyJson);
            
            if (verifyRes.ok && verifyJson.status === 'success') {
              console.log('[Payment] Payment verified successfully');
              // Create enrollment with active status
              try {
                console.log('[Payment] Creating enrollment for course:', course._id);
                await apiClient.createEnrollment(course._id);
                // Update enrolled courses list
                setEnrolledCourseIds(prev => new Set([...prev, course._id]));
                console.log('[Payment] Enrollment created successfully');
                toast.success('Payment successful! You are now enrolled.');
              } catch (e) {
                console.error('[Payment] Enrollment creation failed:', e);
                toast.error('Payment successful but enrollment failed. Contact support.');
              }
            } else {
              console.error('[Payment] Payment verification failed:', verifyJson);
              toast.error(verifyJson?.message || 'Payment verification failed');
            }
          } catch (err) {
            console.error('[Payment] Payment verification error:', err);
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: function() {
            console.log('[Payment] Payment modal dismissed by user');
            console.log('[Payment] User closed the payment window without completing payment');
            toast.error('Payment cancelled. Please try again when ready.');
          }
        },
        prefill: {
          // Prefill can be added if user info available
        },
        theme: { color: '#3399cc' },
      };

      console.log('[Payment] Opening Razorpay checkout...');
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      
      // Add error handler for payment failures
      rzp.on('payment.failed', function (response: any) {
        console.error('[Payment] Payment failed');
        console.error('[Payment] Error code:', response.error.code);
        console.error('[Payment] Error description:', response.error.description);
        console.error('[Payment] Error source:', response.error.source);
        console.error('[Payment] Error step:', response.error.step);
        console.error('[Payment] Error reason:', response.error.reason);
        console.error('[Payment] Full error object:', response.error);
        console.error('[Payment] Order ID:', response.error.metadata?.order_id);
        console.error('[Payment] Payment ID:', response.error.metadata?.payment_id);
        
        // Show user-friendly error message
        const errorMessage = response.error.description || 'Payment failed. Please try again.';
        toast.error(`Payment failed: ${errorMessage}`);
        
        // If it's a card issue, provide helpful guidance
        if (response.error.description && response.error.description.includes('International')) {
          console.warn('[Payment] Tip: Use Indian test cards for test mode');
          console.warn('[Payment] Suggested test card: 4111 1111 1111 1111');
          toast.error('For test mode, please use Indian test cards. Card: 4111 1111 1111 1111, CVV: any 3 digits, Expiry: any future date');
        }
      });
      
      rzp.open();
      setIsDialogOpen(false);
      console.log('[Payment] Razorpay checkout opened successfully');
    } catch (err) {
      console.error('[Payment] Payment flow error:', err);
      toast.error((err as Error).message || 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-hero-gradient overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Our <span className="text-secondary">Courses</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Structured curriculum designed for Class 8-12 students. Choose the course that fits your academic goals.
            </p>
          </motion.div>
        </div>
      </section>
      {/* Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              {selectedCourse ? (
                <>
                  You are about to pay <strong>₹{selectedCourse.price.toLocaleString()}</strong> for <strong>{selectedCourse.title}</strong>.
                </>
              ) : (
                'Preparing payment...'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="pt-4">
            <div className="text-sm text-muted-foreground mb-4">Payment is powered by Razorpay. You will be redirected to a secure checkout.</div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={paymentLoading}>Cancel</Button>
            <Button
              variant="hero"
              onClick={() => selectedCourse && handleStartPayment(selectedCourse)}
              disabled={!selectedCourse || paymentLoading}
            >
              {paymentLoading ? 'Processing...' : `Pay ₹${selectedCourse?.price.toLocaleString()}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={(open) => setIsDetailsOpen(open)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourse ? selectedCourse.title : 'Course Details'}</DialogTitle>
            <DialogDescription>
              {selectedCourse ? selectedCourse.description : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6 py-4">
              {/* About the Batch */}
              {selectedCourse.batchAbout && (
                <div>
                  <h4 className="font-semibold text-lg mb-2">About the Batch</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedCourse.batchAbout}</p>
                </div>
              )}

              {/* Course Duration */}
              {selectedCourse.courseDuration && (selectedCourse.courseDuration.startDate || selectedCourse.courseDuration.endDate) && (
                <div>
                  <h4 className="font-semibold mb-2">Course Duration</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCourse.courseDuration.startDate && new Date(selectedCourse.courseDuration.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {selectedCourse.courseDuration.startDate && selectedCourse.courseDuration.endDate && ' - '}
                    {selectedCourse.courseDuration.endDate && new Date(selectedCourse.courseDuration.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}

              {/* Validity */}
              {selectedCourse.validity && (
                <div>
                  <h4 className="font-semibold mb-2">Validity</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCourse.validity).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}

              {/* Exam Guidance */}
              {selectedCourse.examGuidance && (
                <div>
                  <h4 className="font-semibold mb-2">Exam Guidance</h4>
                  <p className="text-sm text-muted-foreground">{selectedCourse.examGuidance}</p>
                </div>
              )}

              {/* Counseling Support */}
              {selectedCourse.counselingSupport && (
                <div>
                  <h4 className="font-semibold mb-2">Emotional Well-being Support</h4>
                  <p className="text-sm text-muted-foreground">{selectedCourse.counselingSupport}</p>
                </div>
              )}

              {/* Syllabus */}
              {selectedCourse.syllabus && selectedCourse.syllabus.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Syllabus</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {selectedCourse.syllabus.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <div className="text-muted-foreground">Price</div>
                  <div className="font-display text-2xl font-bold">₹{selectedCourse.price.toLocaleString()}</div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                  <Button variant="hero" onClick={() => { if (selectedCourse) { setIsDetailsOpen(false); handleEnrollClick(selectedCourse); } }}>
                    Enroll Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Courses Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No courses available at the moment.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {courses.map((course) => (
                <motion.div
                  key={course._id}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden"
                >
                  <div className="grid lg:grid-cols-3">
                    {/* Header */}
                    <div className={`bg-gradient-to-br ${course.color || 'from-mathsy-blue to-primary'} p-8 text-primary-foreground relative`}>
                      {course.popular && (
                        <motion.span
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full"
                        >
                          Most Popular
                        </motion.span>
                      )}
                      <h2 className="font-display text-2xl font-bold mb-4">{course.title}</h2>
                      <p className="text-primary-foreground/80 mb-6">{course.description}</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5" />
                          <span>{course.timing}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5" />
                          <span>{course.studentsCount || 0}+ enrolled</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5" />
                          <span>{course.chapters} chapters</span>
                        </div>
                      </div>
                    </div>

                    {/* Syllabus */}
                    <div className="p-8 lg:col-span-2">
                      <h3 className="font-display font-bold text-lg text-foreground mb-4">Course Syllabus Highlights</h3>
                      {course.syllabus && course.syllabus.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-3 mb-8">
                          {course.syllabus.map((topic, i) => (
                            <div key={i} className="flex items-center gap-2 text-foreground/80">
                              <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                              <span>{topic}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground mb-8">Syllabus details coming soon...</p>
                      )}

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-border">
                        <div>
                          <span className="text-muted-foreground">Course Fee</span>
                          <div className="font-display text-3xl font-bold text-primary">₹{course.price.toLocaleString()}</div>
                          <span className="text-sm text-muted-foreground">per year • EMI available</span>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => { setSelectedCourse(course); setIsDetailsOpen(true); }}>View Details</Button>
                          <Button
                            variant="hero"
                            onClick={() => handleEnrollClick(course)}
                          >
                            {enrolledCourseIds.has(course._id) ? 'Show Course' : 'Enroll Now'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Have Questions?</h2>
          <p className="text-muted-foreground mb-8">
            Contact us for course details, batch timings, or <a href="https://wa.me/919375919696?text=hyy%20i%20am%20interested%20i%20mathsy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">book a free demo class</a>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Courses;
