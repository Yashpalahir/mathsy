import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/results" element={<Results />} />
            <Route path="/live-classes" element={<LiveClasses />} />
            <Route path="/study-materials" element={<StudyMaterials />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="/course/:id/watch" element={<CourseWatch />} />
            <Route path="/auth/success" element={<GoogleAuthCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
