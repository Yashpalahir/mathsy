import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  FileText,
  BookOpen,
  ClipboardList,
  Lock,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Document, Page, pdfjs } from "react-pdf";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

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
  course?: {
    _id: string;
    title: string;
    class: string;
  };
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

  // PDF state
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [searchText, setSearchText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

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

  /* ================= PREVENT PRINT/SAVE SHORTCUTS ================= */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPdf) return;

      // Prevent Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        console.warn("🚫 Print restricted");
      }
      // Prevent Ctrl+S / Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        console.warn("🚫 Save restricted");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPdf]);

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
                          {item.grade} • {item.course?.title || "General"}
                          {item.pages > 0 && ` • ${item.pages} pages `}
                          {item.questions > 0 &&
                            ` • ${item.questions} questions `}
                          {item.year && ` • ${item.year}`}
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
        onOpenChange={(open) => {
          if (!open) {
            console.log('🚪 [PDF VIEWER] Closing dialog');
            if (selectedPdf) {
              URL.revokeObjectURL(selectedPdf); // Clean up blob URL
            }
            setSelectedPdf(null);
            setNumPages(null);
            setPageNumber(1);
            setScale(1.0);
          }
        }}
      >
        <DialogContent
          className="max-w-[100vw] w-screen h-screen p-0 m-0 border-none rounded-none gap-0 flex flex-col"
          onContextMenu={(e) => e.preventDefault()} // Disable right-click
        >
          {/* TOP BAR */}
          <div className="bg-background border-b px-4 py-2 flex items-center justify-between shrink-0 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div>
                <DialogTitle className="text-sm font-semibold truncate max-w-[200px]">Study Material PDF</DialogTitle>
                <DialogDescription className="text-xs">
                  Restricted View
                </DialogDescription>
              </div>

              {/* PAGE CONTROLS */}
              <div className="flex items-center gap-2 border-l pl-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 text-sm whitespace-nowrap">
                  <Input
                    type="number"
                    value={pageNumber}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > 0 && numPages && val <= numPages) setPageNumber(val);
                    }}
                    className="h-8 w-14 text-center p-1"
                  />
                  <span>/ {numPages || '--'}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!!numPages && pageNumber >= numPages}
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || prev))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* ZOOM CONTROLS */}
              <div className="flex items-center gap-2 border-l pl-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setScale(prev => Math.min(prev + 0.1, 3.0))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => {
                    const container = containerRef.current;
                    if (container) {
                      const width = container.clientWidth - 40; // padding
                      const scale = width / 600; // assume 600px base width
                      setScale(scale);
                    }
                  }}
                >
                  Fit Width
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* SEARCH */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search text..."
                  className="pl-8 h-8 w-[200px]"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <Button
                variant="hero"
                size="sm"
                onClick={() => {
                  if (selectedPdf) URL.revokeObjectURL(selectedPdf);
                  setSelectedPdf(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>

          {/* PDF CONTENT */}
          <div className="flex-1 w-full bg-slate-800 overflow-auto relative p-4 flex justify-center scrollbar-thin overflow-x-hidden select-none" ref={containerRef}>
            {selectedPdf && (
              <div className="shadow-2xl h-fit">
                <Document
                  file={selectedPdf}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={<div className="text-white p-20">Loading document...</div>}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderAnnotationLayer={true}
                    renderTextLayer={true}
                  />
                </Document>
              </div>
            )}
            {/* Overlay to prevent interactions except for text layer */}
            <div
              className="absolute inset-0 bg-transparent pointer-events-none"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StudyMaterials;
