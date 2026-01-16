import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/button";
import { Clock, Users, BookOpen, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

interface Course {
  _id: string;
  title: string;
  description: string;
  duration?: string;
  studentsCount?: number;
  chapters?: number;
  price: number;
  color?: string;
  popular?: boolean;
  onlineTag?: boolean;
  bannerImage?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  teacherGroupImage?: string;
  yellowTagText?: string;
  courseDuration?: {
    startDate?: string;
    endDate?: string;
  };
  languageBadge?: string;
  audienceText?: string;
  promoBannerText?: string;
  oldPrice?: number;
  discountPercent?: number;
}

export const CoursesPreview = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiClient.getCourses();
      if (response.success && response.data) {
        // Show only first 4 courses
        setCourses(response.data.slice(0, 4));
      }
    } catch (error) {
      // Failed to load courses (logged)
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <section className="py-10 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-secondary/20 text-secondary-foreground font-semibold px-4 py-2 rounded-full text-sm mb-4">
            Our Courses
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Courses for <span className="text-primary">Class 8-12</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Structured curriculum designed for academic excellence and competitive exam success
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                title={course.title}
                subtitle={course.description.substring(0, 80) + '...'}
                bannerImage={course.bannerImage}
                bannerTitle={course.bannerTitle}
                bannerSubtitle={course.bannerSubtitle}
                teacherGroupImage={course.teacherGroupImage}
                yellowTagText={course.yellowTagText}
                startDate={course.courseDuration?.startDate}
                endDate={course.courseDuration?.endDate}
                price={course.price}
                oldPrice={course.oldPrice}
                language={course.languageBadge}
                promoText={course.promoBannerText}
                discount={course.discountPercent}
                onlineTag={course.onlineTag}
                audienceText={course.audienceText}
                onExplore={() => { window.location.href = '/courses'; }}
                onBuy={() => { window.location.href = `/courses?buy=${course._id}`; }}
              />
            ))}
          </motion.div>
        )}

        <div className="text-center mt-12">
          <Button asChild variant="hero" size="lg">
            <Link to="/courses">View All Courses<ArrowRight className="w-5 h-5 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
