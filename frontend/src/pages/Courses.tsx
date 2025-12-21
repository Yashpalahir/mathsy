import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Clock, Users, BookOpen, CheckCircle, Calendar, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { toast } from "sonner";

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
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleEnrollClick = (course: Course) => {
    if (!isAuthenticated) {
      // redirect to login, preserve intended return path
      navigate('/login', { state: { intended: `/courses` } });
      return;
    }
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchCourses();
  }, [isAuthenticated]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      // If user is authenticated, fetch courses filtered by their class
      const response = isAuthenticated
        ? await apiClient.getCoursesForUser()
        : await apiClient.getCourses();

      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (error) {
      toast.error("Failed to load courses");
      // Error details omitted from console in production
    } finally {
      setIsLoading(false);
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
      setPaymentLoading(true);

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Try again later.");
        return;
      }

      // Get key from backend
      const keyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/payments/key`);
      if (!keyRes.ok) throw new Error('Unable to fetch payment key');
      const keyJson = await keyRes.json();
      const key = keyJson.key;

      // Create order on server
      const orderRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/payments/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: course.price })
      });

      if (!orderRes.ok) {
        const body = await orderRes.json().catch(() => null);
        throw new Error(body?.message || 'Unable to create payment order');
      }

      const order = await orderRes.json();

      const options = {
        key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: course.title,
        description: course.description,
        order_id: order.id,
        handler: async function (response: any) {
          // Verify payment on backend
          try {
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const verifyJson = await verifyRes.json();
            if (verifyRes.ok && verifyJson.status === 'success') {
              toast.success('Payment successful. Enrollment complete.');
              // Optionally create enrollment record
              try { await apiClient.createEnrollment(course._id); } catch (e) { /* ignore */ }
            } else {
              toast.error(verifyJson?.message || 'Payment verification failed');
            }
          } catch (err) {
            // Payment verification error (logged)
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          // Prefill can be added if user info available
        },
        theme: { color: '#3399cc' },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
      setIsDialogOpen(false);
    } catch (err) {
      // Payment flow error (logged)
      toast.error((err as Error).message || 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Our <span className="text-secondary">Courses</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Structured curriculum designed for Class 8-12 students. Choose the course that fits your academic goals.
            </p>
          </div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCourse ? selectedCourse.title : 'Course Details'}</DialogTitle>
            <DialogDescription>
              {selectedCourse ? selectedCourse.description : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-semibold">Syllabus</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {selectedCourse.syllabus?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between">
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
            <div className="space-y-8">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden"
                >
                  <div className="grid lg:grid-cols-3">
                    {/* Header */}
                    <div className={`bg-gradient-to-br ${course.color || 'from-mathsy-blue to-primary'} p-8 text-primary-foreground relative`}>
                      {course.popular && (
                        <span className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                          Most Popular
                        </span>
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
                            Enroll Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Have Questions?</h2>
          <p className="text-muted-foreground mb-8">
            Contact us for course details, batch timings, or book a free demo class.
          </p>
          <Button asChild variant="hero" size="lg">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Courses;
