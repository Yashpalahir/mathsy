import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: ReactNode;
  requireAuth?: boolean;
};

/**
 * Blocks access to protected dashboard pages or public pages until the user has verified phone number.
 * - requireAuth=true (default): Unauthenticated -> /login
 * - requireAuth=false: Unauthenticated -> Allowed
 * - Authenticated Student without verified phone -> /create-profile (even for public routes)
 * - Admin/Educator -> allowed
 */
export const PhoneVerificationGuard = ({ children, requireAuth = true }: Props) => {
  const { isAuthenticated, isLoading, user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isPhoneVerified = !!profile?.isPhoneVerified;
  const isProfileComplete = !!user?.isProfileComplete;
  const role = user?.role;
  const isUnverifiedStudent = isAuthenticated && role === "student" && (!isProfileComplete || !isPhoneVerified);

  useEffect(() => {
    if (isLoading) return;

    if (isUnverifiedStudent) {
      if (location.pathname !== "/create-profile") {
        navigate("/create-profile", { replace: true });
      }
    } else if (requireAuth && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, isLoading, location, navigate, isUnverifiedStudent, requireAuth]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If unverified student, only allow them to see the create-profile page
  if (isUnverifiedStudent) {
    return location.pathname === "/create-profile" ? <>{children}</> : null;
  }

  // If requireAuth is true and not authenticated, don't show children (useEffect will redirect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

