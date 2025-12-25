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
      const response = await apiClient.getStudyMaterials() as any;
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
        onOpenChange={() => {
          console.log('🚪 [PDF VIEWER] Closing dialog');
          if (selectedPdf) {
            URL.revokeObjectURL(selectedPdf); // Clean up blob URL
          }
          setSelectedPdf(null);
        }}
      >
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Study Material PDF</DialogTitle>
            <DialogDescription>
              Use Ctrl/Cmd + Scroll to zoom. Right-click to download.
            </DialogDescription>
          </DialogHeader>

          {selectedPdf && (
            <div className="w-full h-full overflow-hidden rounded-md border">
              <iframe
                src={selectedPdf}
                className="w-full h-full"
                title="PDF Viewer"
                onLoad={() => {
                  console.log('✅ [PDF VIEWER] PDF loaded successfully in iframe');
                }}
                onError={(e) => {
                  console.error('❌ [PDF VIEWER] PDF failed to load in iframe:', e);
                }}
              />
            </div>
          )}

          {/* Fallback message */}
          <div className="text-center text-sm text-muted-foreground mt-2">
            <p>
              Can't see the PDF?{' '}
              <button
                className="text-primary underline hover:no-underline"
                onClick={() => {
                  console.log('📥 [PDF VIEWER] Opening PDF in new tab');
                  if (selectedPdf) window.open(selectedPdf, '_blank');
                }}
              >
                Open in new tab
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StudyMaterials;
