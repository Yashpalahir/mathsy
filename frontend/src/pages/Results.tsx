import { Layout } from "@/components/layout/Layout";
import { Trophy, Star, TrendingUp } from "lucide-react";
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
};

const toppers = [
  { name: "Priya Sharma", score: "98%", class: "Class 10 Board", year: "2024", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { name: "Rahul Verma", score: "96%", class: "Class 10 Board", year: "2024", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
  { name: "Ananya Gupta", score: "95%", class: "Class 10 Board", year: "2024", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
  { name: "Arjun Singh", score: "94%", class: "Class 12 Board", year: "2024", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
  { name: "Sneha Patel", score: "93%", class: "Class 12 Board", year: "2024", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" },
  { name: "Vikram Reddy", score: "92%", class: "JEE Mains", year: "2024", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" },
];

const stats = [
  { number: "500+", label: "Board Toppers", icon: Trophy },
  { number: "98%", label: "Success Rate", icon: TrendingUp },
  { number: "4.9", label: "Average Rating", icon: Star },
];

const Results = () => {
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
              Our <span className="text-secondary">Results</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Celebrating the success of our students. See how Mathsy has helped thousands achieve their academic goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-card -mt-10 relative z-10 container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-lg p-8">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-12 h-12 text-secondary mx-auto mb-4" />
                <div className="font-display text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Toppers */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our <span className="text-primary">Star Performers</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Meet some of our top-performing students who achieved exceptional results.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {toppers.map((topper, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all text-center group"
              >
                <div className="relative inline-block mb-4">
                  <img
                    src={topper.image}
                    alt={topper.name}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-secondary/30 group-hover:ring-secondary transition-all"
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-secondary-foreground" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-1">{topper.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{topper.class} • {topper.year}</p>
                <div className="inline-block bg-primary/10 text-primary font-bold text-2xl px-4 py-2 rounded-xl">
                  {topper.score}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Batch Performance */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Batch Performance <span className="text-primary">2024</span>
            </h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { class: "Class 10", students: 200, above90: "75%", above80: "95%" },
              { class: "Class 12", students: 150, above90: "70%", above80: "92%" },
              { class: "JEE Foundation", students: 100, above90: "65%", above80: "88%" },
            ].map((batch, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-card rounded-2xl p-8 shadow-card"
              >
                <h3 className="font-display font-bold text-xl text-foreground mb-6 text-center">{batch.class}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Students</span>
                    <span className="font-bold text-foreground">{batch.students}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Above 90%</span>
                    <span className="font-bold text-accent">{batch.above90}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Above 80%</span>
                    <span className="font-bold text-primary">{batch.above80}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Results;
