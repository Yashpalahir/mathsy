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
            <Route
              path="/"
              element={
                <PhoneVerificationGuard requireAuth={false}>
                  <Index />
                </PhoneVerificationGuard>
              }
            />
            <Route
              path="/about"
              element={
                <PhoneVerificationGuard requireAuth={false}>
                  <About />
                </PhoneVerificationGuard>
              }
            />
            <Route
              path="/courses"
              element={
                <PhoneVerificationGuard requireAuth={false}>
                  <Courses />
                </PhoneVerificationGuard>
              }
            />
            <Route
              path="/contact"
              element={
                <PhoneVerificationGuard requireAuth={false}>
                  <Contact />
                </PhoneVerificationGuard>
              }
            />
            <Route
              path="/results"
              element={
                <PhoneVerificationGuard requireAuth={false}>
                  <Results />
                </PhoneVerificationGuard>
              }
            />
            <Route
              path="/live-classes"
              element={
                <PhoneVerificationGuard requireAuth={false}>
                  <LiveClasses />
                </PhoneVerificationGuard>
              }
            />
            <Route
              path="/study-materials"
              element={
                <PhoneVerificationGuard requireAuth={false}>
                  <StudyMaterials />
                </PhoneVerificationGuard>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="/student-dashboard"
              element={
                <PhoneVerificationGuard>
                  <StudentDashboard />
                </PhoneVerificationGuard>
              }
            />
            <Route
              path="/parent-dashboard"
              element={
                <PhoneVerificationGuard>
                  <ParentDashboard />
                </PhoneVerificationGuard>
              }
            />
            <Route
              path="/course/:id/watch"
              element={
                <PhoneVerificationGuard>
                  <CourseWatch />
                </PhoneVerificationGuard>
              }
            />
            <Route path="/admin" element={<Admin />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="/educator-welcome" element={<EducatorWelcome />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route
              path="*"
              element={
                <PhoneVerificationGuard requireAuth={false}>
                  <NotFound />
                </PhoneVerificationGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
