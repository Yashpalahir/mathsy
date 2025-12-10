import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Calendar, 
  TrendingUp, 
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from "lucide-react";

const ParentDashboard = () => {
  const { user, profile, userType, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    } else if (!isLoading && userType === "student") {
      navigate("/student-dashboard");
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

  if (!isAuthenticated || userType === "student") {
    return null;
  }

  const displayName = profile?.full_name || user?.email || "Parent";

  const childInfo = {
    name: "Rahul Sharma",
    class: "Class 10",
    enrolledCourses: ["Class 10 Maths", "JEE Basics"],
  };

  const attendanceData = [
    { date: "Dec 4", status: "present" },
    { date: "Dec 3", status: "present" },
    { date: "Dec 2", status: "absent" },
    { date: "Dec 1", status: "present" },
    { date: "Nov 30", status: "present" },
    { date: "Nov 29", status: "present" },
    { date: "Nov 28", status: "present" },
  ];

  const performanceData = [
    { test: "Chapter 5 Test", score: 85, total: 100, date: "Dec 1" },
    { test: "Weekly Quiz", score: 42, total: 50, date: "Nov 28" },
    { test: "Monthly Test", score: 78, total: 100, date: "Nov 20" },
    { test: "Chapter 4 Test", score: 90, total: 100, date: "Nov 15" },
  ];

  const feeHistory = [
    { month: "December 2024", amount: 2500, status: "paid", date: "Dec 1" },
    { month: "November 2024", amount: 2500, status: "paid", date: "Nov 1" },
    { month: "October 2024", amount: 2500, status: "paid", date: "Oct 1" },
    { month: "January 2025", amount: 2500, status: "pending", date: "-" },
  ];

  const attendancePercentage = Math.round(
    (attendanceData.filter(a => a.status === "present").length / attendanceData.length) * 100
  );

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
              <p className="text-muted-foreground">Parent Dashboard</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {/* Child Info Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{childInfo.name}</h2>
                  <p className="text-muted-foreground">{childInfo.class}</p>
                  <div className="flex gap-2 mt-2">
                    {childInfo.enrolledCourses.map((course, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Attendance Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Attendance Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-4xl font-bold text-primary">{attendancePercentage}%</p>
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm"><span className="text-green-500 font-medium">{attendanceData.filter(a => a.status === "present").length}</span> Present</p>
                    <p className="text-sm"><span className="text-red-500 font-medium">{attendanceData.filter(a => a.status === "absent").length}</span> Absent</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {attendanceData.map((record, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-sm">{record.date}</span>
                      {record.status === "present" ? (
                        <span className="flex items-center gap-1 text-green-500 text-sm">
                          <CheckCircle className="w-4 h-4" /> Present
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-sm">
                          <XCircle className="w-4 h-4" /> Absent
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-4xl font-bold text-primary">
                    {Math.round(performanceData.reduce((acc, p) => acc + (p.score / p.total) * 100, 0) / performanceData.length)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
                <div className="space-y-4">
                  {performanceData.map((test, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{test.test}</span>
                        <span className="text-sm text-muted-foreground">{test.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(test.score / test.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{test.score}/{test.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fee Status */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Fee History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Month</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Paid On</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeHistory.map((fee, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3 px-2 text-sm">{fee.month}</td>
                          <td className="py-3 px-2 text-sm font-medium">₹{fee.amount}</td>
                          <td className="py-3 px-2">
                            {fee.status === "paid" ? (
                              <span className="inline-flex items-center gap-1 text-green-500 text-sm">
                                <CheckCircle className="w-4 h-4" /> Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-yellow-500 text-sm">
                                <Clock className="w-4 h-4" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">{fee.date}</td>
                          <td className="py-3 px-2 text-right">
                            {fee.status === "pending" && (
                              <Button variant="hero" size="sm">Pay Now</Button>
                            )}
                            {fee.status === "paid" && (
                              <Button variant="outline" size="sm">Receipt</Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ParentDashboard;
