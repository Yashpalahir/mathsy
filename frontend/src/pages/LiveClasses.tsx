import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, Users, ExternalLink, Play } from "lucide-react";

const schedule = [
  { day: "Monday", class: "Class 10", topic: "Quadratic Equations", time: "6:00 PM - 7:30 PM", teacher: "Mr. Sharma" },
  { day: "Tuesday", class: "Class 9", topic: "Polynomials", time: "5:00 PM - 6:30 PM", teacher: "Ms. Gupta" },
  { day: "Wednesday", class: "Class 8", topic: "Linear Equations", time: "4:00 PM - 5:30 PM", teacher: "Mr. Sharma" },
  { day: "Thursday", class: "Class 12", topic: "Calculus - Integration", time: "7:00 PM - 8:30 PM", teacher: "Mr. Verma" },
  { day: "Friday", class: "Class 10", topic: "Trigonometry", time: "6:00 PM - 7:30 PM", teacher: "Mr. Sharma" },
  { day: "Saturday", class: "All Classes", topic: "Doubt Clearing Session", time: "4:00 PM - 6:00 PM", teacher: "All Teachers" },
];

const LiveClasses = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Live <span className="text-secondary">Classes</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Join interactive live sessions via Zoom or Google Meet. Real-time doubt solving with expert teachers.
            </p>
          </div>
        </div>
      </section>

      {/* Join Class Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-2xl shadow-lg p-8 max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Join Today's Class</h2>
            <p className="text-muted-foreground mb-6">
              Click the button below to join your scheduled live class. Make sure you're logged in with your student account.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg">
                <Video className="w-5 h-5 mr-2" />
                Join via Zoom
              </Button>
              <Button variant="outline" size="lg">
                <ExternalLink className="w-5 h-5 mr-2" />
                Join via Google Meet
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Note: You need to login to access class links
            </p>
          </div>
        </div>
      </section>

      {/* Weekly Schedule */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Weekly <span className="text-primary">Schedule</span>
            </h2>
            <p className="text-muted-foreground">
              Plan your week with our regular class schedule
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="px-6 py-4 text-left font-semibold">Day</th>
                    <th className="px-6 py-4 text-left font-semibold">Class</th>
                    <th className="px-6 py-4 text-left font-semibold">Topic</th>
                    <th className="px-6 py-4 text-left font-semibold">Time</th>
                    <th className="px-6 py-4 text-left font-semibold">Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{item.day}</td>
                      <td className="px-6 py-4">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                          {item.class}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground">{item.topic}</td>
                      <td className="px-6 py-4 text-muted-foreground">{item.time}</td>
                      <td className="px-6 py-4 text-muted-foreground">{item.teacher}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Recordings */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Missed a Class? <span className="text-primary">Watch Recordings</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All live classes are recorded and available for enrolled students. Login to access your class recordings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-card">
                <div className="aspect-video bg-muted relative group">
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary-foreground ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <span className="text-xs text-muted-foreground">Class 10 • Dec {i + 1}, 2024</span>
                  <h3 className="font-semibold text-foreground mt-1">Recording {i + 1}</h3>
                  <p className="text-sm text-muted-foreground">Login to watch</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg">
              Login to Access All Recordings
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LiveClasses;
