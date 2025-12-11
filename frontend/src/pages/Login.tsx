import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GraduationCap, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

type AuthMode = "login" | "signup";

const Login = () => {
  const { login, signup, isAuthenticated, userType: currentUserType, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"student" | "parent">("student");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Show loading state while checking auth or waiting for role to load
  if (authLoading || (isAuthenticated && currentUserType === null)) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Redirect if already logged in and role is known
  if (isAuthenticated && currentUserType) {
    if (currentUserType === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/student-dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === "login") {
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setIsLoading(false);
          return;
        }

        const { error } = await login(email, password);
        if (error) {
          toast.error(error);
        } else {
          toast.success("Welcome back!");
        }
      } else {
        const validation = signupSchema.safeParse({ fullName, email, password });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setIsLoading(false);
          return;
        }

        const { error } = await signup(email, password, fullName, userType);
        if (error) {
          if (error.includes("already registered")) {
            toast.error("This email is already registered. Please log in.");
          } else {
            toast.error(error);
          }
        } else {
          toast.success("Account created! Redirecting to home.");
          navigate("/", { replace: true });
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
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
                  {authMode === "login" ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-muted-foreground">
                  {authMode === "login" ? "Login to access your dashboard" : "Sign up to get started"}
                </p>
              </div>

              {/* User Type Toggle */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setUserType("student")}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    userType === "student"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-medium">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("parent")}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    userType === "parent"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Parent</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {authMode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <Input
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      maxLength={100}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={128}
                  />
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {authMode === "login" ? "Signing in..." : "Creating account..."}
                    </>
                  ) : (
                    authMode === "login" ? `Login as ${userType === "student" ? "Student" : "Parent"}` : "Create Account"
                  )}
                </Button>
              </form>

              <p className="text-center text-muted-foreground text-sm mt-6">
                {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                  className="ml-2 text-primary hover:underline font-medium"
                >
                  {authMode === "login" ? "Sign up" : "Log in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
