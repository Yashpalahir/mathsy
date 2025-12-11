import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2, Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Course {
  _id: string;
  title: string;
  description: string;
  grade: string;
  price: number;
  duration?: string;
  timing?: string;
  chapters?: number;
  syllabus?: string[];
  color?: string;
  popular?: boolean;
  studentsCount?: number;
}

const Admin = () => {
  const { isAuthenticated, userType, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    grade: "",
    price: "",
    duration: "",
    timing: "",
    chapters: "",
    syllabus: "",
    color: "from-mathsy-blue to-primary",
    popular: false,
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userType !== "admin")) {
      navigate("/admin-login");
    } else if (userType === "admin") {
      fetchCourses();
    }
  }, [isAuthenticated, userType, authLoading, navigate]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (error) {
      toast.error("Failed to load courses");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        grade: formData.grade,
        price: Number(formData.price),
        duration: formData.duration || undefined,
        timing: formData.timing || undefined,
        chapters: formData.chapters ? Number(formData.chapters) : undefined,
        syllabus: formData.syllabus
          ? formData.syllabus.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        color: formData.color,
        popular: formData.popular,
      };

      if (editingCourse) {
        await apiClient.updateCourse(editingCourse._id, courseData);
        toast.success("Course updated successfully");
      } else {
        await apiClient.createCourse(courseData);
        toast.success("Course created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save course");
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      grade: course.grade,
      price: course.price.toString(),
      duration: course.duration || "",
      timing: course.timing || "",
      chapters: course.chapters?.toString() || "",
      syllabus: course.syllabus?.join(", ") || "",
      color: course.color || "from-mathsy-blue to-primary",
      popular: course.popular || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      await apiClient.deleteCourse(id);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete course");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      grade: "",
      price: "",
      duration: "",
      timing: "",
      chapters: "",
      syllabus: "",
      color: "from-mathsy-blue to-primary",
      popular: false,
    });
    setEditingCourse(null);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || userType !== "admin") {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage courses and content</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? "Update course details" : "Add a new course to the platform"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Class 8 Mathematics"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade *</Label>
                    <Input
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      required
                      placeholder="Class 8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Course description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      min="0"
                      placeholder="4999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chapters">Chapters</Label>
                    <Input
                      id="chapters"
                      type="number"
                      value={formData.chapters}
                      onChange={(e) => setFormData({ ...formData, chapters: e.target.value })}
                      min="0"
                      placeholder="15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="10 months"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timing">Timing</Label>
                    <Input
                      id="timing"
                      value={formData.timing}
                      onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                      placeholder="Mon, Wed, Fri - 4:00 PM"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="syllabus">Syllabus (comma-separated)</Label>
                  <Textarea
                    id="syllabus"
                    value={formData.syllabus}
                    onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                    placeholder="Rational Numbers, Linear Equations, Geometry..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color Gradient</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="from-mathsy-blue to-primary"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="popular"
                    checked={formData.popular}
                    onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                  />
                  <Label htmlFor="popular">Mark as Popular</Label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero">
                    {editingCourse ? "Update Course" : "Create Course"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Courses ({courses.length})
            </CardTitle>
            <CardDescription>Manage all courses in the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No courses yet. Create your first course!</p>
                <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Popular</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.grade}</TableCell>
                        <TableCell>₹{course.price.toLocaleString()}</TableCell>
                        <TableCell>{course.studentsCount || 0}</TableCell>
                        <TableCell>{course.popular ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(course)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(course._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;

