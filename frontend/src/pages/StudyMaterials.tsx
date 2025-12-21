import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FileText, Download, BookOpen, ClipboardList, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SecurePDFViewer } from "@/components/SecurePDFViewer";

interface StudyMaterial {
  _id: string;
  title: string;
  description?: string;
  category: string;
  grade: string;
  pdfUrl: string;
  pages: number;
  questions: number;
  year?: string;
}

const categoryIcons = {
  "Notes": BookOpen,
  "Practice Sheets": ClipboardList,
  "Previous Year Questions": FileText,
};

const StudyMaterials = () => {
  const { isAuthenticated } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, [isAuthenticated]);

  const fetchMaterials = async () => {
    try {
      // If user is authenticated, fetch materials filtered by their class
      const response = isAuthenticated
        ? await apiClient.getStudyMaterialsForUser()
        : await apiClient.getStudyMaterials();

      setMaterials(response.data || []);
    } catch (error) {
      // Error fetching study materials (handled)
    } finally {
      setLoading(false);
    }
  };

  const groupedMaterials = materials.reduce((acc, material) => {
    if (!acc[material.category]) {
      acc[material.category] = [];
    }
    acc[material.category].push(material);
    return acc;
  }, {} as Record<string, StudyMaterial[]>);

  const handleViewPdf = (pdfUrl: string) => {
    setSelectedPdf(pdfUrl);
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20 flex justify-center">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

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
            {Object.entries(groupedMaterials).map(([category, categoryMaterials]) => {
              const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || FileText;
              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">{category}</h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoryMaterials.map((item) => (
                      <div
                        key={item._id}
                        className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <FileText className="w-8 h-8 text-primary" />
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {item.grade}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {item.pages > 0 && `${item.pages} pages`}
                          {item.questions > 0 && `${item.questions} questions`}
                          {item.year && `Year: ${item.year}`}
                        </p>
                        {isAuthenticated ? (
                          <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewPdf(item.pdfUrl)}>
                            <Download className="w-4 h-4 mr-2" />
                            View PDF
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="w-full" disabled>
                            <Lock className="w-4 h-4 mr-2" />
                            Login to View
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PDF Viewer Dialog */}
      <Dialog open={!!selectedPdf} onOpenChange={() => setSelectedPdf(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Study Material</DialogTitle>
            <DialogDescription>
              View the PDF material below.
            </DialogDescription>
          </DialogHeader>
          {selectedPdf && (
            <div className="w-full h-full overflow-hidden">
              <SecurePDFViewer url={selectedPdf} />
            </div>
          )}
        </DialogContent>
      </Dialog>

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
