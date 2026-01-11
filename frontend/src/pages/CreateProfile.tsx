import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Loader2,
    User,
    MapPin,
    School,
    Camera,
    Phone,
    Send,
    CheckCircle2,
    Navigation,
    Edit2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { z } from "zod";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

/* ---------------- ZOD SCHEMA ---------------- */

const profileSchema = z.object({
    username: z.string().trim().min(3, "Username must be at least 3 characters").max(30),
    studentClass: z.string().trim().min(1, "Class is required"),
    address: z.string().trim().min(1, "Address is required"),
    phone: z.string().trim().min(10, "Valid phone number is required"),
});

/* ---------------- COMPONENT ---------------- */

const CreateProfile = () => {
    const { profile, user, logout, completeProfile } = useAuth();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    // Form states
    const [username, setUsername] = useState("");
    const [studentClass, setStudentClass] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // OTP states
    const [otp, setOtp] = useState("");
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendOtp = async () => {
        if (phone.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        try {
            setIsSendingOtp(true);

            if (!recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': () => {
                        console.log('reCAPTCHA verified');
                    }
                });
            }

            let formattedPhone = phone.trim();
            if (!formattedPhone.startsWith('+')) {
                formattedPhone = `+91${formattedPhone}`; // Default to India
            }

            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
            setConfirmationResult(confirmation);

            setShowOtpInput(true);
            setResendTimer(30); // 30 seconds cooldown
            toast.success("OTP sent to your phone!");
        } catch (error: any) {
            console.error("Firebase Auth Error:", error);
            toast.error(error.message || "Failed to send OTP");
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleEditPhone = () => {
        setShowOtpInput(false);
        setOtp("");
        setResendTimer(0);
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            toast.error("Please enter a 6-digit OTP");
            return;
        }

        if (!confirmationResult) {
            toast.error("Please request an OTP first");
            return;
        }

        try {
            setIsVerifyingOtp(true);

            // 1. Verify with Firebase
            await confirmationResult.confirm(otp);

            // 2. Notify backend to mark as verified in our DB
            const response = await apiClient.verifyWhatsAppOtp("verified_by_firebase");

            if (response.success) {
                setIsPhoneVerified(true);
                setShowOtpInput(false);
                toast.success("Phone verified successfully!");
            }
        } catch (error: any) {
            console.error("Verification Error:", error);
            toast.error(error.message || "Invalid OTP");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await res.json();
                    if (data.display_name) {
                        setAddress(data.display_name);
                        toast.success("Location detected!");
                    } else {
                        toast.error("Could not determine address");
                    }
                } catch (err) {
                    toast.error("Failed to fetch address");
                } finally {
                    setIsDetectingLocation(false);
                }
            },
            (error) => {
                toast.error("Could not get your location: " + error.message);
                setIsDetectingLocation(false);
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = profileSchema.safeParse({ username, studentClass, address, phone });
        if (!validation.success) {
            toast.error(validation.error.errors[0].message);
            return;
        }

        if (!isPhoneVerified) {
            toast.error("Please verify your phone number first");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append("username", username);
        formData.append("studentClass", studentClass);
        formData.append("address", address);
        formData.append("phone", phone);
        if (avatarFile) {
            formData.append("avatar", avatarFile);
        }

        try {
            const result = await completeProfile(formData);
            if (!result.error) {
                toast.success("Profile updated successfully!");
                // Redirect based on role if available, otherwise default to student dashboard
                const redirectPath = user?.role === 'parent' ? "/parent-dashboard" : "/student-dashboard";
                navigate(redirectPath, { replace: true });
            } else {
                toast.error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <section className="py-20 bg-muted min-h-[80vh] flex items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto">
                        <div className="bg-card rounded-2xl shadow-lg p-8">
                            <div className="text-center mb-8">
                                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                                    Complete Your Profile
                                </h1>
                                <p className="text-muted-foreground">
                                    We just need a few more details to get you started.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* AVATAR INPUT */}
                                <div className="flex flex-col items-center mb-6">
                                    <div
                                        className="relative w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20 cursor-pointer group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">Click to upload profile photo</p>
                                </div>

                                <div id="recaptcha-container"></div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder="cool_student_123"
                                            className="pl-10"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Phone Number
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                placeholder="9876543210"
                                                className="pl-10"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                disabled={isPhoneVerified || showOtpInput}
                                            />
                                        </div>
                                        {!isPhoneVerified && !showOtpInput && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleSendOtp}
                                                disabled={isSendingOtp}
                                            >
                                                {isSendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                                            </Button>
                                        )}
                                        {!isPhoneVerified && showOtpInput && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleEditPhone}
                                                title="Edit Phone Number"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {isPhoneVerified && (
                                            <div className="flex items-center text-green-600 px-2">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {showOtpInput && (
                                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-medium text-foreground">
                                                Enter OTP
                                            </label>
                                            <button
                                                type="button"
                                                className={`text-xs ${resendTimer > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:underline'}`}
                                                onClick={handleSendOtp}
                                                disabled={resendTimer > 0 || isSendingOtp}
                                            >
                                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Enter 6-digit OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                maxLength={6}
                                            />
                                            <Button
                                                type="button"
                                                variant="hero"
                                                onClick={handleVerifyOtp}
                                                disabled={isVerifyingOtp}
                                            >
                                                {isVerifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Check your phone for the code</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Class / Grade
                                    </label>
                                    <div className="relative">
                                        <School className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={studentClass}
                                            onChange={(e) => setStudentClass(e.target.value)}
                                        >
                                            <option value="">-- Select Class --</option>
                                            <option value="Class 6">Class 6</option>
                                            <option value="Class 7">Class 7</option>
                                            <option value="Class 8">Class 8</option>
                                            <option value="Class 9">Class 9</option>
                                            <option value="Class 10">Class 10</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-foreground">
                                            Address
                                        </label>
                                        <button
                                            type="button"
                                            className="text-xs text-primary flex items-center gap-1 hover:underline"
                                            onClick={detectLocation}
                                            disabled={isDetectingLocation}
                                        >
                                            {isDetectingLocation ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Navigation className="h-3 w-3" />
                                            )}
                                            Auto-detect
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <textarea
                                            placeholder="Your full address..."
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving Profile...
                                        </>
                                    ) : (
                                        "Complete Profile"
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default CreateProfile;
