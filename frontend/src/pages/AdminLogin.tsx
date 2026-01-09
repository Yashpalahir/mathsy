import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldCheck } from "lucide-react";

const AdminLogin = () => {
  const { adminPasswordLogin, isAuthenticated, userType, isLoading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (isAuthenticated && userType === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }
    setIsSubmitting(true);
    const { error } = await adminPasswordLogin(password.trim());
    setIsSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Admin login successful");
    navigate("/admin", { replace: true });
  };

  return (
    <Layout>
      <section className="py-20 bg-muted min-h-[70vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Access</h1>
              <p className="text-muted-foreground">Enter the admin password to manage site data.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Admin Password</label>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Login as Admin"
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Default password is "admin" unless changed in backend env.
              </p>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminLogin;

