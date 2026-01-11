import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2, Phone, User, School, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { apiClient } from "@/lib/api";

const Login = () => {
  const { isAuthenticated, user, completeProfile, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Step: 1=Phone, 2=OTP, 3=Profile Details
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  /* ---------------- REDIRECT IF LOGGED IN ---------------- */

  if (isAuthenticated && user && user.isProfileComplete && step !== 3) {
    if (user.role === "educator") return <Navigate to="/educator-welcome" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  useEffect(() => {
    if (isAuthenticated && user && !user.isProfileComplete) {
      setStep(3);
    }
  }, [isAuthenticated, user?.isProfileComplete]);

  /* ---------------- FIXED RECAPTCHA SETUP ---------------- */

  useEffect(() => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );

      recaptchaVerifierRef.current.render().catch(console.error);
    }
  }, []);

  /* ---------------- SEND OTP ---------------- */

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (phone.length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = `+91${formattedPhone}`;
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current!
      );

      setConfirmationResult(confirmation);
      toast.success("OTP sent!");
      setStep(2);
    } catch (error: any) {
      console.error("OTP Error:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    if (!confirmationResult) {
      toast.error("Please request OTP first");
      return;
    }

    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);

      const response = await apiClient.verifyPhoneOtp(phone, "", true);

      if (response.success && response.token) {
        apiClient.setToken(response.token);
        await refreshUser();
        toast.success("OTP Verified!");

        if (response.user && response.user.isProfileComplete) {
          const role = response.user.role;
          if (role === "educator") navigate("/educator-welcome", { replace: true });
          else if (role === "admin") navigate("/admin", { replace: true });
          else navigate("/student-dashboard", { replace: true });
        } else {
          setStep(3);
        }
      } else {
        toast.error(response.message || "Server error");
      }
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      toast.error(error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- FILE HANDLING ---------------- */

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  /* ---------------- SUBMIT PROFILE ---------------- */

  const requestLocationAndSubmit = async () => {
    setIsLoading(true);
    let location = null;

    if ("geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch {
        console.warn("Location access denied");
      }
    }

    const formData = new FormData();
    formData.append("name", fullName);
    formData.append("studentClass", selectedClass);
    if (location) formData.append("location", JSON.stringify(location));
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const { error } = await completeProfile(formData);
      if (error) toast.error(error);
      else {
        toast.success("Profile completed!");
        navigate("/student-dashboard", { replace: true });
      }
    } catch {
      toast.error("Profile save failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();

    if (!fullName || !selectedClass) {
      toast.error("Please fill all fields");
      return;
    }

    requestLocationAndSubmit();
  };

  /* ---------------- UI ---------------- */

  return (
    <Layout>
      <section className="py-20 bg-muted min-h-[80vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                {step === 1 ? "Login / Sign Up" : step === 2 ? "Verify OTP" : "Complete Profile"}
              </h1>
              <p className="text-muted-foreground">
                {step === 1
                  ? "Enter your phone number to continue"
                  : step === 2
                    ? `Enter the OTP sent to ${phone}`
                    : "Tell us about yourself"}
              </p>
            </div>

            {/* Recaptcha Container */}
            <div id="recaptcha-container"></div>

            {/* STEP 1: PHONE */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="9876543210"
                      className="pl-10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={10}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full" variant="hero">
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Continue"}
                </Button>
              </form>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">One-Time Password</label>
                  <Input
                    placeholder="123456"
                    className="text-center tracking-widest text-lg h-12"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full" variant="hero">
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Verify & Continue"}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-primary hover:underline"
                >
                  Change Phone Number
                </button>
              </form>
            )}

            {/* STEP 3: PROFILE */}
            {step === 3 && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center">
                  <div
                    className="relative w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20 cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  <p className="text-xs text-muted-foreground mt-2">Upload Profile Image</p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="John Doe"
                      className="pl-10"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Class */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Class</label>
                  <div className="relative">
                    <School className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      <option value="">-- Choose Class --</option>
                      {[6, 7, 8, 9, 10, 11, 12].map((num) => (
                        <option key={num} value={`Class ${num}`}>
                          Class {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full" variant="hero">
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Save & Finish"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
