import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Calendar, 
  Clock, 
  Award,
  Bell,
  CreditCard,
  Loader2
} from "lucide-react";

const StudentDashboard = () => {
  const { user, profile, userType, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    } else if (!isLoading && userType === "parent") {
      navigate("/parent-dashboard");
    }
  }, [isAuthenticated, isLoading, userType, navigate]);

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Upcoming Classes */}
            <Card className="md:col-span-2">
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
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">December</span>
                      <span className="text-green-500 font-medium">Paid</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">January</span>
                      <span className="text-yellow-500 font-medium">Pending</span>
                    </div>
                  </div>
                  <Button variant="hero" size="sm" className="w-full mt-4">Pay Now</Button>
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
