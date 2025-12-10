import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FileText, Download, BookOpen, ClipboardList, Lock } from "lucide-react";

const materials = [
  {
    category: "Notes",
    icon: BookOpen,
    items: [
      { title: "Quadratic Equations - Complete Notes", class: "Class 10", pages: 25 },
      { title: "Trigonometry Formulas & Examples", class: "Class 10", pages: 18 },
      { title: "Linear Equations Simplified", class: "Class 9", pages: 15 },
      { title: "Number System - Foundation", class: "Class 8", pages: 20 },
    ],
  },
  {
    category: "Practice Sheets",
    icon: ClipboardList,
    items: [
      { title: "Algebra Practice Set 1", class: "Class 10", questions: 50 },
      { title: "Geometry Practice Problems", class: "Class 9", questions: 40 },
      { title: "Arithmetic Progression Worksheet", class: "Class 10", questions: 35 },
      { title: "Mensuration Practice", class: "Class 8", questions: 30 },
    ],
  },
  {
    category: "Previous Year Questions",
    icon: FileText,
    items: [
      { title: "CBSE 2023 Solved Paper", class: "Class 10", year: "2023" },
      { title: "CBSE 2022 Solved Paper", class: "Class 10", year: "2022" },
      { title: "CBSE 2023 Board Paper", class: "Class 12", year: "2023" },
      { title: "JEE Mains 2023 Paper", class: "Class 12", year: "2023" },
    ],
  },
];

const StudyMaterials = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Study <span className="text-secondary">Materials</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Access comprehensive study materials, notes, practice sheets, and previous year questions.
            </p>
          </div>
        </div>
      </section>

      {/* Materials Sections */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {materials.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">{section.category}</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <FileText className="w-8 h-8 text-primary" />
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {item.class}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {"pages" in item && `${item.pages} pages`}
                        {"questions" in item && `${item.questions} questions`}
                        {"year" in item && `Year: ${item.year}`}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Lock className="w-4 h-4 mr-2" />
                        Login to Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Get Full Access to All Materials
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Enroll in any of our courses to get unlimited access to all study materials, notes, and practice sheets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">
              Explore Courses
            </Button>
            <Button variant="outline" size="lg">
              Login
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default StudyMaterials;
