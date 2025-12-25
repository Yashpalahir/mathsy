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
import { Loader2, Plus, Edit, Trash2, BookOpen, FileText } from "lucide-react";
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

interface StudyMaterial {
  _id: string;
  title: string;
  description?: string;
  category: string;
  grade: string;
  pdfUrl: string;
  pages: number;
  questions: number;
  year?: string;
}

const Admin = () => {
  const { isAuthenticated, userType, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
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
  const [materialFormData, setMaterialFormData] = useState({
    title: "",
    description: "",
    category: "Notes",
    grade: "",
    pages: "",
    questions: "",
    year: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userType !== "admin")) {
      navigate("/admin-login");
    } else if (userType === "admin") {
      fetchCourses();
      fetchStudyMaterials();
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
      // Error details omitted from console in production
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudyMaterials = async () => {
    try {
      const response = await apiClient.getStudyMaterials();
      if (response.success && response.data) {
        setStudyMaterials(response.data);
      }
    } catch (error) {
      toast.error("Failed to load study materials");
      // Error details omitted from console in production
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

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedFile && !editingMaterial) {
        toast.error("Please select a PDF file");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', materialFormData.title);
      formDataToSend.append('description', materialFormData.description);
      formDataToSend.append('category', materialFormData.category);
      formDataToSend.append('grade', materialFormData.grade);
      formDataToSend.append('pages', materialFormData.pages);
      formDataToSend.append('questions', materialFormData.questions);
      formDataToSend.append('year', materialFormData.year);

      if (selectedFile) {
        formDataToSend.append('pdf', selectedFile);
      }

      if (editingMaterial) {
        await apiClient.updateStudyMaterial(editingMaterial._id, {
          title: materialFormData.title,
          description: materialFormData.description,
          category: materialFormData.category,
          grade: materialFormData.grade,
          pages: Number(materialFormData.pages) || 0,
          questions: Number(materialFormData.questions) || 0,
          year: materialFormData.year,
        });
        toast.success("Study material updated successfully");
      } else {
        await apiClient.createStudyMaterial(formDataToSend);
        toast.success("Study material created successfully");
      }

      resetMaterialForm();
      fetchStudyMaterials();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save study material");
    }
  };

  const handleMaterialEdit = (material: StudyMaterial) => {
    setMaterialFormData({
      title: material.title,
      description: material.description || "",
      category: material.category,
      grade: material.grade,
      pages: material.pages.toString(),
      questions: material.questions.toString(),
      year: material.year || "",
    });
    setEditingMaterial(material);
    setIsMaterialDialogOpen(true);
  };

  const handleMaterialDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this study material?")) {
      return;
    }

    try {
      await apiClient.deleteStudyMaterial(id);
      toast.success("Study material deleted successfully");
      fetchStudyMaterials();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete study material");
    }
  };

  const resetMaterialForm = () => {
    setMaterialFormData({
      title: "",
      description: "",
      category: "Notes",
      grade: "",
      pages: "",
      questions: "",
      year: "",
    });
    setSelectedFile(null);
    setEditingMaterial(null);
    setIsMaterialDialogOpen(false);
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
                    <select
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">-- Select Grade --</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                    </select>
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
                              aria-label={`Edit ${course.title}`}
                              onClick={() => handleEdit(course)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={`Delete ${course.title}`}
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

        {/* Study Materials Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Study Materials ({studyMaterials.length})
            </CardTitle>
            <CardDescription>Manage study materials and PDFs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">
                Upload PDFs and organize them by category
              </p>
              <Button variant="hero" onClick={() => setIsMaterialDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </Button>
            </div>

            {studyMaterials.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No study materials yet. Upload your first PDF!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studyMaterials.map((material) => (
                  <div key={material._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{material.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {material.category} • {material.grade}
                        {material.pages > 0 && ` • ${material.pages} pages`}
                        {material.questions > 0 && ` • ${material.questions} questions`}
                        {material.year && ` • Year: ${material.year}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Edit ${material.title}`}
                        onClick={() => handleMaterialEdit(material)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Delete ${material.title}`}
                        onClick={() => handleMaterialDelete(material._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Material Dialog */}
        <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? "Edit Study Material" : "Add Study Material"}
              </DialogTitle>
              <DialogDescription>
                {editingMaterial ? "Update the study material details" : "Upload a PDF and add material details"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMaterialSubmit} className="space-y-4">
              <div>
                <Label htmlFor="material-title">Title</Label>
                <Input
                  id="material-title"
                  value={materialFormData.title}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, title: e.target.value })}
                  placeholder="e.g., Quadratic Equations - Complete Notes"
                  required
                />
              </div>

              <div>
                <Label htmlFor="material-description">Description</Label>
                <Textarea
                  id="material-description"
                  value={materialFormData.description}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="material-category">Category</Label>
                  <select
                    id="material-category"
                    value={materialFormData.category}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    required
                  >
                    <option value="Notes">Notes</option>
                    <option value="Practice Sheets">Practice Sheets</option>
                    <option value="Previous Year Questions">Previous Year Questions</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="material-grade">Grade</Label>
                  <select
                    id="material-grade"
                    value={materialFormData.grade}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, grade: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">-- Select Grade --</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="material-pages">Pages</Label>
                  <Input
                    id="material-pages"
                    type="number"
                    value={materialFormData.pages}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, pages: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="material-questions">Questions</Label>
                  <Input
                    id="material-questions"
                    type="number"
                    value={materialFormData.questions}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, questions: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="material-year">Year</Label>
                  <Input
                    id="material-year"
                    value={materialFormData.year}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, year: e.target.value })}
                    placeholder="e.g., 2023"
                  />
                </div>
              </div>

              {!editingMaterial && (
                <div>
                  <Label htmlFor="material-pdf">PDF File</Label>
                  <Input
                    id="material-pdf"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetMaterialForm}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="hero">
                  {editingMaterial ? "Update Material" : "Upload Material"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Admin;

