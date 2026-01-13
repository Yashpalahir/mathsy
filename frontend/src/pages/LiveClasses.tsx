import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Video, ExternalLink } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

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
              <Button variant="hero" size="lg" onClick={() => openJoinModal("zoom")}>
                <Video className="w-5 h-5 mr-2" />
                Join via Zoom
              </Button>
              <Button variant="outline" size="lg" onClick={() => openJoinModal("meet")}>
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
              onChange={(e) => {
                setJoinInput(e.target.value);
                setJoinError("");
              }}
              placeholder={joinType === "zoom" ? "Zoom meeting ID or URL" : "Meet code or URL"}
            />
            {joinError && <div className="text-destructive text-sm mt-2">{joinError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinModalOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={submitJoin}>Join</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default LiveClasses;
