import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Maximize, Minimize } from "lucide-react";

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface SecurePDFViewerProps {
    url: string;
}

export const SecurePDFViewer = ({ url }: SecurePDFViewerProps) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Disable right click
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    // Toggle fullscreen
    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
        }
    };

    // Block keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block Ctrl+P (Print)
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                e.stopPropagation();
            }
            // Block Ctrl+S (Save)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
        };
    }, []);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setIsLoading(false);
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden select-none"
            onContextMenu={handleContextMenu}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 bg-white border-b shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                        disabled={pageNumber <= 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[3ch] text-center">
                        {pageNumber} / {numPages || '-'}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                        disabled={pageNumber >= numPages || isLoading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
                        disabled={isLoading}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium w-12 text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setScale(prev => Math.min(prev + 0.2, 2.0))}
                        disabled={isLoading}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        disabled={isLoading}
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* PDF Container */}
            <div className="flex-1 overflow-auto flex justify-center p-4 relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => console.error("Error loading PDF:", error)}
                    loading={null}
                    className="max-w-none"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-lg"
                    />
                </Document>

                {/* Watermark Overlay (Harder to screenshot cleanly) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-30 overflow-hidden">
                    <div className="rotate-[-45deg] text-6xl font-bold whitespace-nowrap select-none">
                        PREVIEW ONLY • DO NOT DISTRIBUTE • PREVIEW ONLY
                    </div>
                </div>
            </div>
        </div>
    );
};
