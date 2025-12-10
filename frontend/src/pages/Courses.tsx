import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Clock, Users, BookOpen, CheckCircle, Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (error) {
      toast.error("Failed to load courses");
      console.error(error);
    } finally {
      setIsLoading(false);
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
                        <Button variant="outline">View Details</Button>
                        <Button variant="hero">Enroll Now</Button>
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
          <Button variant="hero" size="lg">
            Contact Us
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Courses;
