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
    CheckCircle2, 
    Navigation,
    Edit2,
    ArrowRight,
    ArrowLeft
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
    const { profile, user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    
    const [isLoading, setIsLoading] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    // Flow state
    const [step, setStep] = useState<1 | 2>(profile?.isPhoneVerified ? 2 : 1);

    // Form states
    const [username, setUsername] = useState(profile?.username || "");
    const [studentClass, setStudentClass] = useState(profile?.studentClass || "");
    const [address, setAddress] = useState(profile?.address || "");
    const [phone, setPhone] = useState(profile?.phone || "");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar || null);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // OTP states
    const [otp, setOtp] = useState("");
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(!!profile?.isPhoneVerified);
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

    // Update state if profile loads later
    useEffect(() => {
        if (profile) {
            if (profile.isPhoneVerified && step === 1) {
                setStep(2);
                setIsPhoneVerified(true);
            }
            if (profile.phone && !phone) setPhone(profile.phone);
            if (profile.username && !username) setUsername(profile.username);
            if (profile.studentClass && !studentClass) setStudentClass(profile.studentClass);
            if (profile.address && !address) setAddress(profile.address);
            if (profile.avatar && !avatarPreview) setAvatarPreview(profile.avatar);
        }
    }, [profile]);

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
            // We also send the phone number to the backend so it's stored in the profile
            const response = await apiClient.sendWhatsAppOtp(phone); // This saves the phone
            if (response.success) {
                const verifyResponse = await apiClient.verifyWhatsAppOtp("verified_by_firebase");
                
                if (verifyResponse.success) {
                    setIsPhoneVerified(true);
                    setShowOtpInput(false);
                    toast.success("Phone verified successfully!");
                    await refreshUser(); // Update global auth state
                    setStep(2); // Move to next step
                }
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
            setStep(1);
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
            const response = await apiClient.completeProfile(formData);
            if (response.success) {
                toast.success("Profile updated successfully!");
                await refreshUser();
                navigate("/student-dashboard", { replace: true });
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
                                    {step === 1 ? "Verify Your Phone" : "Complete Your Profile"}
                                </h1>
                                <p className="text-muted-foreground">
                                    {step === 1 
                                        ? "You must verify your phone number to continue." 
                                        : "Almost there! Just a few more details."}
                                </p>
                            </div>

                            <div className="flex justify-center mb-8">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-primary' : 'bg-green-500'}`} />
                                    <div className={`w-12 h-0.5 ${step === 2 ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                                    <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                </div>
                            </div>

                            <div id="recaptcha-container"></div>

                            {step === 1 ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
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
                                                    disabled={showOtpInput}
                                                />
                                            </div>
                                            {!showOtpInput && (
                                                <Button 
                                                    type="button" 
                                                    variant="hero"
                                                    onClick={handleSendOtp}
                                                    disabled={isSendingOtp || phone.length < 10}
                                                >
                                                    {isSendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                                                </Button>
                                            )}
                                            {showOtpInput && (
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
                                        </div>
                                    </div>

                                    {showOtpInput && (
                                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-3 animate-in zoom-in-95">
                                            <div className="flex justify-between items-center">
                                                <label className="block text-sm font-medium text-foreground">
                                                    Enter 6-digit OTP
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
                                                    placeholder="123456"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    maxLength={6}
                                                    className="text-center tracking-widest"
                                                />
                                                <Button 
                                                    type="button" 
                                                    variant="hero"
                                                    onClick={handleVerifyOtp}
                                                    disabled={isVerifyingOtp || otp.length !== 6}
                                                >
                                                    {isVerifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Check your phone for the code</p>
                                        </div>
                                    )}
                                    
                                    <div className="pt-4 border-t border-border mt-6">
                                        <Button 
                                            variant="ghost" 
                                            className="w-full text-muted-foreground"
                                            onClick={() => logout()}
                                        >
                                            Sign out and try later
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    {/* Phone Display (Verified) */}
                                    <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-700">{phone}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-green-600 font-bold">
                                            <CheckCircle2 className="h-3 w-3" />
                                            VERIFIED
                                        </div>
                                    </div>

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
                                        <p className="text-xs text-muted-foreground mt-2">Upload profile photo</p>
                                    </div>

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

                                    <div className="flex gap-3">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            className="flex-1"
                                            onClick={() => setStep(1)}
                                            disabled={isLoading}
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                        <Button type="submit" variant="hero" className="flex-[2]" disabled={isLoading}>
                                            {isLoading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                "Complete Profile"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default CreateProfile;
