import { BookOpen, Video, FileText, Users, Clock, Award, CheckCircle, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Video,
    title: "Live Interactive Classes",
    description: "Real-time doubt solving with expert teachers via Zoom/Google Meet",
    color: "bg-mathsy-blue",
  },
  {
    icon: BookOpen,
    title: "Recorded Lectures",
    description: "Access chapter-wise video lectures anytime, anywhere",
    color: "bg-mathsy-green",
  },
  {
    icon: FileText,
    title: "Study Materials",
    description: "PDFs, notes, practice sheets, and previous year questions",
    color: "bg-mathsy-orange",
  },
  {
    icon: Users,
    title: "Small Batch Size",
    description: "Personal attention with limited students per batch",
    color: "bg-mathsy-pink",
  },
  {
    icon: Clock,
    title: "Flexible Timings",
    description: "Multiple batch options to suit your schedule",
    color: "bg-primary",
  },
  {
    icon: Award,
    title: "Regular Tests",
    description: "Weekly tests and MCQ quizzes with instant results",
    color: "bg-secondary",
  },
  {
    icon: CheckCircle,
    title: "Progress Tracking",
    description: "Student and parent dashboards for performance monitoring",
    color: "bg-accent",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "WhatsApp support for doubt clearing anytime",
    color: "bg-mathsy-blue-dark",
  },
];

export const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-20 bg-muted overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm mb-4">
            Why Choose Us
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose <span className="text-primary">Mathsy</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the best-in-class math education with proven teaching methods and comprehensive support
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

