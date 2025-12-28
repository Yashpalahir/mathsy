import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Video, Calendar, Clock, Units, ExternalLink, Play } from "lucide-react";
import { useState } from "react";
import { motion, Variants } from "framer-motion";

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

const schedule = [
  { day: "Monday", class: "Class 10", topic: "Quadratic Equations", time: "6:00 PM - 7:30 PM", teacher: "Mr. Sharma" },
  { day: "Tuesday", class: "Class 9", topic: "Polynomials", time: "5:00 PM - 6:30 PM", teacher: "Ms. Gupta" },
  { day: "Wednesday", class: "Class 8", topic: "Linear Equations", time: "4:00 PM - 5:30 PM", teacher: "Mr. Sharma" },
  { day: "Thursday", class: "Class 12", topic: "Calculus - Integration", time: "7:00 PM - 8:30 PM", teacher: "Mr. Verma" },
  { day: "Friday", class: "Class 10", topic: "Trigonometry", time: "6:00 PM - 7:30 PM", teacher: "Mr. Sharma" },
  { day: "Saturday", class: "All Classes", topic: "Doubt Clearing Session", time: "4:00 PM - 6:00 PM", teacher: "All Teachers" },
];

const LiveClasses = () => {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinType, setJoinType] = useState<"zoom" | "meet" | null>(null);
  const [joinInput, setJoinInput] = useState("");
  const [joinError, setJoinError] = useState("");

  const openJoinModal = (type: "zoom" | "meet") => {
    setJoinType(type);
    setJoinInput("");
    setJoinError("");
    setJoinModalOpen(true);
  };

  const submitJoin = () => {
    const raw = joinInput.trim();
    if (!raw) {
      setJoinError("Please enter a meeting code or URL");
      return;
    }
    // If full URL provided, open directly
    if (/^https?:\/\//i.test(raw)) {
      window.open(raw, "_blank");
      setJoinModalOpen(false);
      return;
    }

    if (joinType === "zoom") {
      const meetingId = raw.replace(/[^0-9]/g, "");
      if (!meetingId) {
        setJoinError("Invalid Zoom meeting ID");
        return;
      }
      const url = `https://zoom.us/j/${meetingId}`;
      window.open(url, "_blank");
      setJoinModalOpen(false);
      return;
    }

    if (joinType === "meet") {
      // Fixed: Removed unnecessary escape for hyphen
      const code = raw.replace(/[^a-zA-Z0-9-]/g, "");
      if (!code) {
        setJoinError("Invalid Meet code");
        return;
      }
      const url = `https://meet.google.com/${code}`;
      window.open(url, "_blank");
      setJoinModalOpen(false);
      return;
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
              Live <span className="text-secondary">Classes</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Join interactive live sessions via Zoom or Google Meet. Real-time doubt solving with expert teachers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Join Class Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl shadow-lg p-8 max-w-2xl mx-auto text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Join Today's Class</h2>
            <p className="text-muted-foreground mb-6">
              Click the button below to join your scheduled live class. Make sure you're logged in with your student account.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" onClick={() => openJoinModal("zoom")} aria-label="Join via Zoom">
                <Video className="w-5 h-5 mr-2" />
                Join via Zoom
              </Button>
              <Button variant="outline" size="lg" onClick={() => openJoinModal("meet")} aria-label="Join via Google Meet">
                <ExternalLink className="w-5 h-5 mr-2" />
                Join via Google Meet
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Note: You need to login to access class links
            </p>
          </motion.div>
        </div>
      </section>

      {/* Join Modal */}
      <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{joinType === "zoom" ? "Join via Zoom" : "Join via Google Meet"}</DialogTitle>
            <DialogDescription>
              {joinType === "zoom"
                ? "Enter the Zoom meeting ID or paste the full join URL."
                : "Enter the Google Meet code (e.g. abc-defg-hij) or paste the full meeting URL."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={joinInput}
              onChange={(e) => { setJoinInput((e.target as HTMLInputElement).value); setJoinError(""); }}
              placeholder={joinType === "zoom" ? "Zoom meeting ID or URL" : "Meet code or URL"}
              aria-label={joinType === "zoom" ? "Zoom meeting id" : "Meet code"}
              autoFocus
            />
            {joinError && <div className="text-destructive text-sm mt-2">{joinError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinModalOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={submitJoin}>Join</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl shadow-card overflow-hidden"
          >
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
          </motion.div>
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

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[1, 2, 3].map((_, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-card rounded-2xl overflow-hidden shadow-card"
              >
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
              </motion.div>
            ))}
          </motion.div>

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
