import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Index from "./pages/Index";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Contact from "./pages/Contact";
import Results from "./pages/Results";
import LiveClasses from "./pages/LiveClasses";
import StudyMaterials from "./pages/StudyMaterials";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import CreateProfile from "./pages/CreateProfile";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import CourseWatch from "./pages/CourseWatch";
import EducatorWelcome from "./pages/EducatorWelcome";
import NotFound from "./pages/NotFound";
import { PhoneVerificationGuard } from "@/components/PhoneVerificationGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} />
        <BrowserRouter>
          <Routes>
            {/* Public Routes - Wrapped to redirect unverified logged-in users */}
            <Route path="/" element={<PhoneVerificationGuard requireAuth={false}><Index /></PhoneVerificationGuard>} />
            <Route path="/about" element={<PhoneVerificationGuard requireAuth={false}><About /></PhoneVerificationGuard>} />
            <Route path="/courses" element={<PhoneVerificationGuard requireAuth={false}><Courses /></PhoneVerificationGuard>} />
            <Route path="/contact" element={<PhoneVerificationGuard requireAuth={false}><Contact /></PhoneVerificationGuard>} />
            <Route path="/results" element={<PhoneVerificationGuard requireAuth={false}><Results /></PhoneVerificationGuard>} />
            <Route path="/live-classes" element={<PhoneVerificationGuard requireAuth={false}><LiveClasses /></PhoneVerificationGuard>} />
            <Route path="/study-materials" element={<PhoneVerificationGuard requireAuth={false}><StudyMaterials /></PhoneVerificationGuard>} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/auth/success" element={<GoogleAuthCallback />} />

            {/* Profile Completion Page - Must be accessible to unverified users */}
            <Route 
              path="/create-profile" 
              element={
                <PhoneVerificationGuard requireAuth={true}>
                  <CreateProfile />
                </PhoneVerificationGuard>
              } 
            />

            {/* Protected Routes */}
            <Route
              path="/student-dashboard"
              element={
                <PhoneVerificationGuard requireAuth={true}>
                  <StudentDashboard />
                </PhoneVerificationGuard>
              }
            />
            <Route
              path="/parent-dashboard"
              element={
                <PhoneVerificationGuard requireAuth={true}>
                  <ParentDashboard />
                </PhoneVerificationGuard>
              }
            />
            <Route
              path="/course/:id/watch"
              element={
                <PhoneVerificationGuard requireAuth={true}>
                  <CourseWatch />
                </PhoneVerificationGuard>
              }
            />
            <Route
              path="/admin"
              element={
                <PhoneVerificationGuard requireAuth={true}>
                  <Admin />
                </PhoneVerificationGuard>
              }
            />
            <Route
              path="/educator-welcome"
              element={
                <PhoneVerificationGuard requireAuth={true}>
                  <EducatorWelcome />
                </PhoneVerificationGuard>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
