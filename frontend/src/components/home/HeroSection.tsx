import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Star, Users, Award } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-secondary/30 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-40 right-20 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-40 right-40 w-16 h-16 bg-mathsy-pink/20 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 text-primary-foreground text-sm">
              <Star className="w-4 h-4 fill-secondary text-secondary" />
              <span>Trusted by 5000+ Students</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight">
              Master <span className="text-secondary">Maths</span> with{" "}
              <span className="text-secondary">Mathsy</span>
            </h1>
            
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-xl mx-auto lg:mx-0">
              Expert coaching for Class 8-12 students. Join our live classes, access recorded lectures, and achieve academic excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/courses">
                <Button variant="hero" size="xl">
                  Enroll Now
                </Button>
              </Link>
              <Button variant="hero-outline" size="xl" className="gap-2">
                <Play className="w-5 h-5 fill-current" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-primary-foreground/20">
              {[
                { icon: Users, value: "5000+", label: "Students" },
                { icon: Award, value: "98%", label: "Success Rate" },
                { icon: Star, value: "4.9", label: "Rating" },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <stat.icon className="w-6 h-6 text-secondary mx-auto lg:mx-0 mb-2" />
                  <div className="text-2xl font-bold text-primary-foreground">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image/Visual */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-secondary/20 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="relative bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/20">
                <div className="grid grid-cols-2 gap-4">
                  {["÷", "×", "+", "∫"].map((symbol, i) => (
                    <div
                      key={i}
                      className="w-24 h-24 bg-primary-foreground/10 rounded-2xl flex items-center justify-center text-4xl font-bold text-secondary animate-float"
                      style={{ animationDelay: `${i * 0.5}s` }}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center text-primary-foreground font-display font-bold text-xl">
                  Learn. Practice. Excel.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
