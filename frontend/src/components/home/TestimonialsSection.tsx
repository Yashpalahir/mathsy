import { Star, Quote, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Fallback testimonials
const defaultTestimonials = [
  {
    _id: "1",
    name: "Priya Sharma",
    role: "Class 10 Student",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    content: "Mathsy helped me score 98% in my board exams! The teaching style is amazing and concepts become so clear.",
    rating: 5,
  },
  {
    _id: "2",
    name: "Rajesh Kumar",
    role: "Parent of Class 9 Student",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    content: "My son's confidence in mathematics has improved dramatically. The regular updates and progress tracking are very helpful.",
    rating: 5,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export const TestimonialsSection = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviews = async (currentPage: number, silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const response = await apiClient.getReviews(currentPage, 5);

      if (response.success && Array.isArray(response.data)) {
        setReviews(response.data);
        setTotalPages(response.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      if (reviews.length === 0) setReviews(defaultTestimonials);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const handleAddReviewClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsModalOpen(true);
  };

  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    // Reduced py-16 to py-8
    <section className="py-8 bg-muted overflow-hidden">
      <div className="container mx-auto px-4">

        {/* Header - Reduced mb-12 to mb-6 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <span className="inline-block bg-accent/20 text-accent font-semibold px-4 py-1.5 rounded-full text-xs mb-2">
            Testimonials
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            What Our <span className="text-primary">Students Say</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Join thousands of satisfied students and parents who trust Mathsy
          </p>
        </motion.div>

        {/* Pagination Arrows - Reduced mb-6 to mb-3 */}
        <div className="flex justify-end gap-2 mb-3">
          <button
            onClick={prevPage}
            disabled={page === 1 || isLoading}
            className="p-1.5 rounded-full bg-background shadow-sm disabled:opacity-30 transition-all hover:bg-primary/10 border"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextPage}
            disabled={page >= totalPages || isLoading}
            className="p-1.5 rounded-full bg-background shadow-sm disabled:opacity-30 transition-all hover:bg-primary/10 border"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Reviews Grid - Reduced min-h and gap */}
        <div className="min-h-[360px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <motion.div
              key={page}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              {reviews.map((testimonial) => (
                <motion.div
                  key={testimonial._id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  // Reduced padding to p-6 to match the tighter section
                  className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative border flex flex-col min-h-[350px]"
                >
                  <Quote className="absolute top-4 right-4 w-6 h-6 text-primary/5" />

                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={testimonial.image || `https://ui-avatars.com/api/?name=${testimonial.name}&background=random`}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/5"
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-xs truncate text-foreground">{testimonial.name}</h4>
                      <p className="text-[9px] text-muted-foreground truncate uppercase tracking-widest font-medium">
                        {testimonial.role || "Student"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < testimonial.rating ? "fill-secondary text-secondary" : "text-muted-foreground/20"}`}
                      />
                    ))}
                  </div>

                  <p className="text-foreground/80 text-xs leading-relaxed italic line-clamp-8 flex-grow">
                    "{testimonial.content}"
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Review Action - Reduced mt-16/12 to mt-6 */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleAddReviewClick}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2.5 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 text-sm"
          >
            Review Us
          </button>
        </div>

        <AddReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newReview) => {
            setReviews((prev) => [newReview, ...prev].slice(0, 5));
            setPage(1);
            fetchReviews(1, true);
          }}
        />
      </div>
    </section>
  );
};

const AddReviewModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: (review: any) => void }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please provide review content");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiClient.createReview({ content: content.trim(), rating });

      if (response.success) {
        toast.success("Thank you for your review!");
        onSuccess(response.data);
        setContent("");
        setRating(5);
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10 border">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold mb-1">Share Your Experience</h3>
            <p className="text-muted-foreground text-xs mb-4">Your feedback helps us improve.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="transition-transform active:scale-90">
                      <Star className={`w-6 h-6 ${star <= rating ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Your Review</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell us what you liked..."
                  className="w-full bg-muted rounded-xl p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none border border-foreground/5"
                  maxLength={500}
                />
                <div className="text-right text-[9px] text-muted-foreground mt-1">{content.length}/500</div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-md hover:shadow-primary/20 transition-all disabled:opacity-50 text-sm"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};