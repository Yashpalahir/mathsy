import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, QrCode, Camera, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { QrReader } from "react-qr-reader";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const EducatorWelcome = () => {
    const { user, logout } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleScan = async (data: string | null) => {
        if (data && !isProcessing) {
            setIsProcessing(true);
            try {
                const response = await apiClient.scanAttendanceQR(data);
                if (response.success) {
                    setScanResult({ success: true, message: response.message || "Attendance marked successfully" });
                    toast.success(response.message || "Attendance marked successfully");
                    // Automatically close scanner on success after 2 seconds
                    setTimeout(() => {
                        setIsScanning(false);
                        setScanResult(null);
                    }, 3000);
                }
            } catch (error: any) {
                setScanResult({ success: false, message: error.message || "Invalid or expired QR code" });
                toast.error(error.message || "Failed to mark attendance");
                // Allow rescanning after 3 seconds
                setTimeout(() => setScanResult(null), 3000);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <Layout>
            <section className="min-h-[80vh] flex items-center justify-center py-20 px-4 bg-muted/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl w-full bg-card rounded-3xl shadow-xl p-10 text-center border border-border"
                >
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">👋</span>
                    </div>

                    <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                        Welcome, Educator!
                    </h1>

                    <p className="text-xl text-muted-foreground mb-8">
                        Logged in as: <span className="font-medium text-foreground">{user?.email}</span>
                    </p>

                    <div className="grid gap-6 mb-10">
                        {/* Attendance Scanner Button */}
                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
                                <QrCode className="w-5 h-5 text-primary" />
                                Attendance System
                            </h3>
                            
                            {!isScanning ? (
                                <Button 
                                    onClick={() => setIsScanning(true)}
                                    variant="hero" 
                                    className="w-full flex items-center gap-2"
                                >
                                    <Camera className="w-4 h-4" />
                                    Scan Attendance QR
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative aspect-square max-w-sm mx-auto overflow-hidden rounded-xl border-4 border-primary/20 bg-black">
                                        <QrReader
                                            onResult={(result, error) => {
                                                if (result) {
                                                    handleScan(result.getText());
                                                }
                                            }}
                                            constraints={{ facingMode: 'environment' }}
                                            className="w-full h-full"
                                        />
                                        
                                        {/* Scanning Overlay */}
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                            <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 animate-scan shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div>
                                            </div>
                                        </div>

                                        {/* Result Overlay */}
                                        <AnimatePresence>
                                            {scanResult && (
                                                <motion.div 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className={`absolute inset-0 flex flex-col items-center justify-center p-4 text-white z-10 ${
                                                        scanResult.success ? 'bg-green-600/90' : 'bg-red-600/90'
                                                    }`}
                                                >
                                                    {scanResult.success ? (
                                                        <CheckCircle2 className="w-16 h-16 mb-2" />
                                                    ) : (
                                                        <XCircle className="w-16 h-16 mb-2" />
                                                    )}
                                                    <p className="font-bold text-center">{scanResult.message}</p>
                                                </motion.div>
                                            )}
                                            {isProcessing && !scanResult && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <Button 
                                        onClick={() => setIsScanning(false)}
                                        variant="outline" 
                                        className="w-full"
                                    >
                                        Cancel Scanning
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-muted rounded-2xl border border-border">
                            <p className="text-muted-foreground">
                                Further educator features will be available soon!
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => logout()}
                        variant="outline"
                        className="flex items-center gap-2 mx-auto"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </motion.div>
            </section>
        </Layout>
    );
};

export default EducatorWelcome;
