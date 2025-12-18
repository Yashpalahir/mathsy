import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award, Users, BookOpen, Target, CheckCircle, GraduationCap } from "lucide-react";

const achievements = [
  { number: "10+", label: "Years Experience" },
  { number: "5000+", label: "Students Taught" },
  { number: "98%", label: "Success Rate" },
  { number: "500+", label: "Board Toppers" },
];

const values = [
  {
    icon: Target,
    title: "Mission",
    description: "To make quality mathematics education accessible to every student, helping them build confidence and achieve academic excellence.",
  },
  {
    icon: GraduationCap,
    title: "Vision",
    description: "To become India's most trusted math coaching platform, known for transforming students' relationship with mathematics.",
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              About <span className="text-secondary">Mathsy</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Empowering students to master mathematics through expert guidance, interactive learning, and proven teaching methodologies.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-card -mt-10 relative z-10 container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((item, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-4xl md:text-5xl font-bold text-primary mb-2">
                  {item.number}
                </div>
                <div className="text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm mb-4">
                Our Story
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                A Passion for Teaching <span className="text-primary">Mathematics</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Mathsy was founded with a simple yet powerful mission: to transform how students perceive and learn mathematics. What started as a small tutoring initiative has grown into a comprehensive online learning platform.
                </p>
                <p>
                  Our founder, with over 10 years of teaching experience, recognized that many students struggle with maths not because of ability, but due to unclear concepts and fear. Mathsy addresses this through patient, concept-focused teaching.
                </p>
                <p>
                  Today, we're proud to have helped thousands of students not just pass their exams, but truly understand and enjoy mathematics.
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-2xl p-8 space-y-6">
              {values.map((value, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shrink-0">
                    <value.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Teaching Approach */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Teaching <span className="text-primary">Approach</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Concept First", desc: "Focus on understanding fundamentals before problem-solving" },
              { icon: Users, title: "Interactive Learning", desc: "Live classes with real-time doubt clearing sessions" },
              { icon: Award, title: "Regular Assessment", desc: "Weekly tests and quizzes to track progress" },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-2xl p-8 text-center shadow-card">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join Mathsy today and experience the difference in math education.
          </p>
          <Button asChild variant="hero" size="lg">
            <Link to="/courses">Explore Courses</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default About;
