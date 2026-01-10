import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: ReactNode;
  requireAuth?: boolean;
};

/**
 * Blocks access to pages until the user has verified phone number IF they are logged in.
 * If requireAuth is true, it also enforces login.
 */
export const PhoneVerificationGuard = ({ children, requireAuth = true }: Props) => {
  const { isAuthenticated, isLoading, user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      const role = user?.role;
      if (role === "admin" || role === "educator") return;

      const isPhoneVerified = !!profile?.isPhoneVerified;
      const isProfileComplete = !!user?.isProfileComplete;

      if (!isProfileComplete || !isPhoneVerified) {
        if (location.pathname !== "/create-profile") {
          navigate("/create-profile", { replace: true });
        }
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate, profile?.isPhoneVerified, user?.isProfileComplete, user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated as student/parent, enforce profile completion even on public routes
  if (isAuthenticated) {
    const role = user?.role;
    if (role !== "admin" && role !== "educator") {
      const isPhoneVerified = !!profile?.isPhoneVerified;
      const isProfileComplete = !!user?.isProfileComplete;

      if ((!isProfileComplete || !isPhoneVerified) && location.pathname !== "/create-profile") {
        return <Navigate to="/create-profile" replace />;
      }
    }
  }

  return <>{children}</>;
};

