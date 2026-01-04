import { useEffect, useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { motion, Variants } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  BookOpen,
  Video,
  FileText,
  Calendar,
  Clock,
  Award,
  Bell,
  CreditCard,
  Loader2,
  QrCode,
  RefreshCw
} from "lucide-react";

const StudentDashboard = () => {
  const { user, profile, userType, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [feeStatuses, setFeeStatuses] = useState<any[]>([]);
  const [isFeesLoading, setIsFeesLoading] = useState(true);

  // Attendance states
  const [attendanceToken, setAttendanceToken] = useState<{ token: string; expiresAt: string; type: string } | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    } else if (!isLoading && userType === "parent") {
      navigate("/parent-dashboard");
    }

    if (isAuthenticated && userType === "student") {
      fetchFeeStatus();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated, isLoading, userType, navigate]);

  const fetchFeeStatus = async () => {
    try {
      setIsFeesLoading(true);
      const response = await apiClient.getFeeStatus();
      if (response.success) {
        setFeeStatuses(response.data);
      }
    } catch (error) {
      console.error("Error fetching fee status:", error);
    } finally {
      setIsFeesLoading(false);
    }
  };

  const generateToken = async (type: 'IN' | 'OUT') => {
    try {
      setIsGeneratingToken(true);
      const response = await apiClient.generateAttendanceToken(type);
      if (response.success) {
        setAttendanceToken(response.data);
        const expiresAt = new Date(response.data.expiresAt).getTime();
        const now = Date.now();
        setTimeLeft(Math.max(0, Math.floor((expiresAt - now) / 1000)));

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          const currentNow = Date.now();
          const remaining = Math.max(0, Math.floor((expiresAt - currentNow) / 1000));
          setTimeLeft(remaining);
          if (remaining <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Auto-refresh token if it expires while being viewed
            generateToken(type);
          }
        }, 1000);

        toast.success(`Generated ${type} QR Code`);
      }
    } catch (error) {
      toast.error("Failed to generate QR code");
      console.error(error);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (isLoading || (isAuthenticated && userType === null)) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || userType === "parent") {
    return null;
  }

  const displayName = profile?.full_name || user?.email || "Student";

  const upcomingClasses = [
    { subject: "Class 10 - Quadratic Equations", time: "10:00 AM", date: "Today" },
    { subject: "Class 10 - Polynomials", time: "2:00 PM", date: "Tomorrow" },
    { subject: "JEE Basics - Calculus", time: "4:00 PM", date: "Dec 7" },
  ];

  const recentTests = [
    { name: "Chapter 5 Test", score: "85/100", date: "Dec 1" },
    { name: "Weekly Quiz", score: "42/50", date: "Nov 28" },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <Layout>
      <section className="py-12 bg-muted min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Welcome, {displayName}!
              </h1>
              <p className="text-muted-foreground">Student Dashboard</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {/* Quick Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-xs text-muted-foreground">Enrolled Courses</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Video className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-xs text-muted-foreground">Classes Attended</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Tests Completed</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Attendance Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Attendance QR
                  </CardTitle>
                  <CardDescription>
                    Generate a QR code to mark your attendance. Valid for 60 seconds.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-xl space-y-6">
                    {attendanceToken ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-white rounded-2xl shadow-sm border">
                          <QRCodeSVG
                            value={attendanceToken.token}
                            size={200}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg text-primary">
                            {attendanceToken.type} TOKEN
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4" />
                            Expires in {timeLeft}s
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAttendanceToken(null)}
                          >
                            Close
                          </Button>
                          <Button
                            variant="hero"
                            size="sm"
                            onClick={() => generateToken(attendanceToken.type as 'IN' | 'OUT')}
                            disabled={isGeneratingToken}
                          >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingToken ? 'animate-spin' : ''}`} />
                            Refresh
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                        <Button
                          variant="hero"
                          className="h-24 flex flex-col gap-2"
                          onClick={() => generateToken('IN')}
                          disabled={isGeneratingToken}
                        >
                          <span className="text-2xl font-bold text-white">IN</span>
                          <span className="text-xs opacity-90">Mark Entry</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-24 flex flex-col gap-2 border-2 border-primary"
                          onClick={() => generateToken('OUT')}
                          disabled={isGeneratingToken}
                        >
                          <span className="text-2xl font-bold text-primary">OUT</span>
                          <span className="text-xs text-muted-foreground">Mark Exit</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Classes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Classes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingClasses.map((cls, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{cls.subject}</p>
                        <p className="text-sm text-muted-foreground">{cls.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{cls.time}</span>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">View Full Schedule</Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentTests.map((test, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{test.name}</p>
                        <p className="text-xs text-muted-foreground">{test.date}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">{test.score}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Fee Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Fee Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isFeesLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : feeStatuses.length > 0 ? (
                      feeStatuses.map((fee, index) => (
                        <div key={fee._id || index} className="space-y-2 pb-2 border-b last:border-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">{fee.month} {fee.year}</p>
                              <p className="text-xs text-muted-foreground">{fee.course?.title}</p>
                            </div>
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${fee.status === 'paid'
                                  ? 'bg-green-500/10 text-green-600'
                                  : fee.status === 'pending'
                                    ? 'bg-yellow-500/10 text-yellow-600'
                                    : 'bg-red-500/10 text-red-600'
                                }`}
                            >
                              {fee.status}
                            </span>
                          </div>
                          {fee.status !== 'paid' && (
                            <Button
                              variant="hero"
                              size="sm"
                              className="w-full h-8 text-xs"
                              onClick={() => navigate(`/checkout/${fee.course?._id}?feeId=${fee._id}`)}
                            >
                              Pay Now (₹{fee.amount})
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">No fee records found</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notices */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                      <p className="text-sm font-medium">Holiday Notice</p>
                      <p className="text-xs text-muted-foreground">No classes on Dec 25</p>
                    </div>
                    <div className="p-3 bg-yellow-500/5 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm font-medium">Test Announcement</p>
                      <p className="text-xs text-muted-foreground">Chapter test on Dec 10</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default StudentDashboard;
