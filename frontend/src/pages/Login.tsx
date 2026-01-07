import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

/* ---------------- ZOD SCHEMAS ---------------- */

const emailSchema = z.string().email("Please enter a valid email");
const otpSchema = z.string().length(6, "OTP must be 6 digits");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

/* ---------------- COMPONENT ---------------- */

const Login = () => {
  const {
    login,
    signup,
    sendOtp,
    verifyOtp,
    loginWithOtp,
    loginWithGoogle,
    educatorLogin,
    isAuthenticated,
    userType: currentUserType,
    isLoading: authLoading,
    user
  } = useAuth();
  const navigate = useNavigate();

  // Mode: login or signup
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Login Method: password or otp or educator
  const [loginMethod, setLoginMethod] = useState<"password" | "otp" | "educator">("password");

  // Signup Steps: 1=Email, 2=OTP, 2.5=Class Selection, 3=Details
  const [signupStep, setSignupStep] = useState(1);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  /* ---------------- AUTH CHECKS ---------------- */

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Redirect logic
  if (isAuthenticated && user) {
    if ((user.role as any) === "educator") {
      return <Navigate to="/educator-welcome" replace />;
    }
    if (!user.isProfileComplete) {
      return <Navigate to="/create-profile" replace />;
    }
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === "educator") {
      return <Navigate to="/educator-welcome" replace />;
    }
    return <Navigate to="/student-dashboard" replace />;
  }

  /* ---------------- HANDLERS ---------------- */

  const handleGoogleLogin = () => {
    console.log('\n🖱️ [FRONTEND] User clicked "Continue with Google" button');
    setIsLoading(true);

    // Get backend URL from environment variable
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const backendUrl = apiUrl.replace('/api', ''); // Remove /api suffix to get base URL

    const oauthUrl = `${backendUrl}/api/auth/google`;
    console.log('🌐 [FRONTEND] Redirecting to backend OAuth URL:', oauthUrl);

    // Redirect to backend Google Auth route
    window.location.href = oauthUrl;
  };

  const handleSendOtp = async () => {
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      toast.error(emailValidation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const { error, message } = await sendOtp(email);
      if (error) {
        toast.error(error);
      } else {
        toast.success(message || "OTP sent to your email");
        setOtpSent(true);
        if (authMode === "signup") setSignupStep(2);
      }
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (loginMethod === "password") {
        const { error } = await login(email, password);
        if (error) toast.error(error);
        else toast.success("Welcome back!");
      } else if (loginMethod === "educator") {
        console.log(`[FRONTEND] Submitting educator login for: ${email}`);
        const { error } = await educatorLogin(email, password);
        if (error) {
          console.error(`[FRONTEND] Educator login error: ${error}`);
          toast.error(error);
        } else {
          console.log(`[FRONTEND] Educator login successful!`);
          toast.success("Welcome Educator!");
        }
      } else {
        // OTP Login
        if (!otpSent) {
          await handleSendOtp(); // User clicked login but hasn't sent OTP yet? 
          // Actually UI should force send OTP first.
          setIsLoading(false);
          return;
        }
        const { error } = await loginWithOtp(email, otp);
        if (error) toast.error(error);
        else toast.success("Welcome back!");
      }
    } catch {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (signupStep === 1) {
      await handleSendOtp();
      return;
    }

    if (signupStep === 2) {
      // Verify OTP
      if (otp.length !== 6) {
        toast.error("Please enter 6-digit OTP");
        setIsLoading(false);
        return;
      }

      const { error, message } = await verifyOtp(email, otp);
      if (error) {
        toast.error(error);
      } else {
        toast.success(message || "Email verified!");
        setSignupStep(2.5); // Move to class selection
      }
      setIsLoading(false);
      return;
    }

    if (signupStep === 2.5) {
      // Validate class selection
      if (!selectedClass) {
        toast.error("Please select your class");
        setIsLoading(false);
        return;
      }
      setSignupStep(3); // Move to name/password step
      setIsLoading(false);
      return;
    }

    if (signupStep === 3) {
      const { error } = await signup(email, password, fullName, "student", selectedClass);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Account created!");
        // Redirect will happen automatically via AuthContext
      }
      setIsLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Layout>
      <section className="py-20 bg-muted min-h-[80vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8">

            {/* GOOGLE LOGIN HEADER */}
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                {authMode === "login" ? "Welcome Back" : "Get Started"}
              </h1>

              <Button
                variant="outline"
                className="w-full py-6 flex items-center justify-center gap-3 text-base font-medium mb-6 hover:bg-muted/50 transition-colors"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* TABS (Only for Login) */}
              {authMode === "login" && (
                <div className="flex p-1 bg-muted rounded-lg mb-6">
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === "password" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    onClick={() => setLoginMethod("password")}
                  >
                    Password
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === "otp" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    onClick={() => {
                      setLoginMethod("otp");
                      setOtpSent(false); // Reset OTP state when switching
                    }}
                  >
                    OTP
                  </button>
                </div>
              )}
            </div>

            {/* FORMS */}
            <form onSubmit={authMode === "login" ? handleLoginSubmit : handleSignupSubmit} className="space-y-4">

              {/* LOGIN: PASSWORD OR EDUCATOR MODE */}
              {authMode === "login" && (loginMethod === "password" || loginMethod === "educator") && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {loginMethod === "educator" ? "Educator Email" : "Email Address"}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="you@example.com"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading} variant="hero">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : loginMethod === "educator" ? "Login as Educator" : "Login"}
                  </Button>
                </>
              )}

              {/* LOGIN: OTP MODE */}
              {authMode === "login" && loginMethod === "otp" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="you@example.com"
                          className="pl-9"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={otpSent}
                        />
                      </div>
                      {!otpSent && (
                        <Button type="button" onClick={handleSendOtp} disabled={isLoading || !email}>
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {otpSent && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-medium">Enter OTP</label>
                      <Input
                        placeholder="123456"
                        className="text-center tracking-widest text-lg"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <Button type="submit" className="w-full mt-4" disabled={isLoading} variant="hero">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Login"}
                      </Button>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline text-center w-full mt-2"
                        onClick={() => setOtpSent(false)}
                      >
                        Change Email / Resend
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* SIGNUP FLOW */}
              {authMode === "signup" && (
                <>
                  {/* STEP 1: Email */}
                  {signupStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="you@example.com"
                            className="pl-9"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                      </Button>
                    </div>
                  )}

                  {/* STEP 2: OTP */}
                  {signupStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Verify Email</label>
                        <p className="text-xs text-muted-foreground">OTP sent to {email}</p>
                        <Input
                          placeholder="123456"
                          className="text-center tracking-widest text-lg"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify OTP"}
                      </Button>
                    </div>
                  )}

                  {/* STEP 2.5: Class Selection */}
                  {signupStep === 2.5 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                      <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-4 h-4" /> Email Verified
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Your Class</label>
                        <p className="text-xs text-muted-foreground">Choose the class you're currently studying in</p>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                        >
                          <option value="">-- Select Class --</option>
                          <option value="Class 6">Class 6</option>
                          <option value="Class 7">Class 7</option>
                          <option value="Class 8">Class 8</option>
                          <option value="Class 9">Class 9</option>
                          <option value="Class 10">Class 10</option>
                        </select>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading} variant="hero">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                      </Button>
                    </div>
                  )}

                  {/* STEP 3: Details */}
                  {signupStep === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                      <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-4 h-4" /> Email Verified
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Create Password</label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading} variant="hero">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                      </Button>
                    </div>
                  )}
                </>
              )}

            </form>

            <div className="mt-8 text-center text-sm">
              {authMode === "login" ? (
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("signup");
                      setSignupStep(1);
                      setOtpSent(false);
                      setEmail("");
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setLoginMethod("password");
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    Log in
                  </button>
                </p>
              )}

              {/* educator LOGIN OPTION (Only for Login Mode) */}
              {authMode === "login" && (
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      if (loginMethod === "educator") {
                        setLoginMethod("password");
                      } else {
                        setLoginMethod("educator");
                      }
                      setEmail("");
                      setPassword("");
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {loginMethod === "educator" ? "Back to Student Login" : "Login as Educator"}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
