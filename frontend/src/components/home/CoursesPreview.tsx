import { Link } from "react-router-dom";
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
}

export const CoursesPreview = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block bg-secondary/20 text-secondary-foreground font-semibold px-4 py-2 rounded-full text-sm mb-4">
            Our Courses
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Courses for <span className="text-primary">Class 8-12</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Structured curriculum designed for academic excellence and competitive exam success
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
                key={course._id}
              className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              {course.popular && (
                <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full z-10">
                  Popular
                </div>
              )}
              
              <div className={`h-32 bg-gradient-to-br ${course.color || 'from-mathsy-blue to-primary'} p-6 flex items-end`}>
                <h3 className="font-display font-bold text-xl text-primary-foreground">
                  {course.title}
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-muted-foreground text-sm">{course.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <Users className="w-4 h-4" />
                    <span>{course.studentsCount || 0}+ enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.chapters || 0} chapters</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-2xl text-primary">₹{course.price.toLocaleString()}</span>
                    <Button asChild size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground">
                      <Link to="/courses">View <ArrowRight className="w-4 h-4 ml-1" /></Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
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
