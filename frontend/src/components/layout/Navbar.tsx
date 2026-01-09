import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import mathsyLogo from "@/assets/mathsy-logo.png";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Courses", path: "/courses" },
  { name: "Live Classes", path: "/live-classes" },
  { name: "Study Materials", path: "/study-materials" },
  { name: "Results", path: "/results" },
  { name: "Contact", path: "/contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const location = useLocation();
  const { isAuthenticated, user, userType, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border/50 py-2 shadow-lg shadow-primary/5"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link to="/" className="flex items-center gap-3">
              <img src={mathsyLogo} alt="Mathsy Logo" className={`transition-all duration-500 ${scrolled ? "h-10" : "h-12"} w-auto`} />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-muted/20 backdrop-blur-sm p-1 rounded-full">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onMouseEnter={() => setHoveredPath(link.path)}
                onMouseLeave={() => setHoveredPath(null)}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                <span className="relative z-10">{link.name}</span>
                {hoveredPath === link.path && (
                  <motion.div
                    layoutId="navbar-hover"
                    className="absolute inset-0 bg-primary/10 rounded-full -z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-primary/5 rounded-full border border-primary/20 -z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {userType === "admin" && (
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to="/admin">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full hover:bg-primary/10">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{user?.name || "User"}</span>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userType === "student" && (
                      <DropdownMenuItem onClick={() => navigate("/student-dashboard")} className="cursor-pointer rounded-md">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                    )}
                    {userType === "admin" && (
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer rounded-md">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer rounded-md">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="hero" size="sm" className="rounded-full px-6">
                  <Link to="/courses">Enroll Now</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-6 border-t border-border mt-2 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 24
                    }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                        location.pathname === link.path
                          ? "text-primary bg-primary/10"
                          : "text-foreground/70 hover:text-primary hover:bg-muted hover:pl-6"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                  className="pt-4 px-4"
                >
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-2 py-2 mb-2 bg-muted/50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{user?.name}</p>
                          <p className="text-muted-foreground text-xs">{user?.email}</p>
                        </div>
                      </div>
                      {userType === "admin" && (
                        <Button asChild variant="outline" className="w-full rounded-xl justify-start">
                          <Link to="/admin" onClick={() => setIsOpen(false)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Admin Panel
                          </Link>
                        </Button>
                      )}
                      <Button variant="destructive" className="w-full rounded-xl justify-start" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Button asChild variant="outline" className="rounded-xl">
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button asChild variant="hero" className="rounded-xl">
                        <Link to="/courses" onClick={() => setIsOpen(false)}>
                          Enroll Now
                        </Link>
                      </Button>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
