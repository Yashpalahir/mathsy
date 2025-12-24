import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  FileText,
  BookOpen,
  ClipboardList,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ================= TYPES ================= */
export interface StudyMaterial {
  _id: string;
  title: string;
  description?: string;
  category: string;
  grade: string;
  pages: number;
  questions: number;
  year?: string;
}

/* ================= ICON MAP ================= */
const categoryIcons = {
  Notes: BookOpen,
  "Practice Sheets": ClipboardList,
  "Previous Year Questions": FileText,
};

/* ================= COMPONENT ================= */
const StudyMaterials = () => {
  const { isAuthenticated } = useAuth();

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  /* ================= FETCH LIST ================= */
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      console.log("📡 Fetching study materials...");
      const response = await apiClient.getStudyMaterials();
      console.log("✅ Materials response:", response);

      if (response.success && response.data) {
        setMaterials(response.data);
      }
    } catch (error) {
      console.error("❌ Error fetching study materials:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= GROUP BY CATEGORY ================= */
  const groupedMaterials = materials.reduce<Record<string, StudyMaterial[]>>(
    (acc, material) => {
      if (!acc[material.category]) acc[material.category] = [];
      acc[material.category].push(material);
      return acc;
    },
    {}
  );

  /* ================= FETCH SINGLE & VIEW PDF ================= */
  const handleViewPdf = async (id: string) => {
    console.log("📌 Clicked material ID:", id);

    try {
      const response = await apiClient.getStudyMaterialPdf(id);
      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);

      console.log("📄 PDF blob URL created:", pdfUrl);
      setSelectedPdf(pdfUrl);
    } catch (error) {
      console.error("❌ Failed to load PDF:", error);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Layout>
        <div className="py-20 flex justify-center">
          Loading...
        </div>
      </Layout>
    );
  }

  /* ================= UI ================= */
  return (
    <Layout>
      {/* HERO */}
      <section className="py-20 bg-hero-gradient text-center">
        <h1 className="text-4xl font-bold text-primary-foreground">
          Study <span className="text-secondary">Materials</span>
        </h1>
        <p className="text-primary-foreground/80 mt-4">
          Notes, practice sheets & previous year questions
        </p>
      </section>

      {/* MATERIALS */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 space-y-16">
          {Object.entries(groupedMaterials).map(
            ([category, items]) => {
              const Icon =
                categoryIcons[category as keyof typeof categoryIcons] ||
                FileText;

              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-8">
                    <Icon className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">
                      {category}
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="bg-card p-6 rounded-xl shadow"
                      >
                        <h3 className="font-semibold mb-2">
                          {item.title}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-4">
                          {item.pages > 0 && `${item.pages} pages `}
                          {item.questions > 0 &&
                            `• ${item.questions} questions `}
                          {item.year && `• ${item.year}`}
                        </p>

                        {isAuthenticated ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              handleViewPdf(item._id)
                            }
                          >
                            View PDF
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Login to View
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* PDF VIEWER */}
      <Dialog
        open={!!selectedPdf}
        onOpenChange={() => setSelectedPdf(null)}
      >
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Study Material</DialogTitle>
            <DialogDescription>
              PDF preview
            </DialogDescription>
          </DialogHeader>

          {selectedPdf && (
            <object
              data={selectedPdf}
              type="application/pdf"
              className="w-full h-full"
              onLoad={() =>
                console.log("✅ PDF loaded successfully")
              }
              onError={(e) =>
                console.error("❌ PDF failed to load", e)
              }
            >
              <div className="flex flex-col items-center justify-center h-full">
                <p className="mb-4 text-muted-foreground">
                  PDF preview not supported in this browser.
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(selectedPdf, "_blank")
                  }
                >
                  Open PDF in new tab
                </Button>
              </div>
            </object>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StudyMaterials;
