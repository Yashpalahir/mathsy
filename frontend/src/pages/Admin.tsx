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
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2, Plus, Edit, Trash2, BookOpen, FileText, Upload, Image as ImageIcon, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

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
  examGuidance?: string;
  counselingSupport?: string;
  onlineTag?: boolean;
  bannerImage?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  teacherGroupImage?: string;
  yellowTagText?: string;
  languageBadge?: string;
  audienceText?: string;
  promoBannerText?: string;
  oldPrice?: number;
  discountPercent?: number;
}

interface StudyMaterial {
  _id: string;
  title: string;
  description?: string;
  category: string;
  class: string;
  pdfUrl: string;
  pages: number;
  questions: number;
  year?: string;
  course?: {
    _id: string;
    title: string;
    class: string;
  };
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
    examGuidance: "Exam guidance at our Mathsy Offline centers",
    counselingSupport: "One-to-one emotional well-being support by Mathsy counselors",
    onlineTag: true,
    bannerImage: "",
    bannerTitle: "",
    bannerSubtitle: "",
    teacherGroupImage: "",
    yellowTagText: "COMEBACK KIT INCLUDED",
    languageBadge: "Hinglish",
    audienceText: "",
    promoBannerText: "New Batch Plans Included",
    oldPrice: "",
    discountPercent: "",
  });
  const [materialFormData, setMaterialFormData] = useState({
    title: "",
    description: "",
    category: "Notes",
    class: "",
    pages: "",
    questions: "",
    year: "",
    course: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Educator state
  const [educatorFormData, setEducatorFormData] = useState({
    name: "",
    phone: "",
  });
  const [isEducatorDialogOpen, setIsEducatorDialogOpen] = useState(false);

  // Test state
  const [tests, setTests] = useState<any[]>([]);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any | null>(null);
  const [testFormData, setTestFormData] = useState({
    name: "",
    class: "",
    description: "",
    duration: 60,
    passingMarks: 0,
    questions: [
      {
        type: "mcq",
        question: "",
        image: "",
        video: "",
        options: [
          { text: "", image: "" },
          { text: "", image: "" },
          { text: "", image: "" },
          { text: "", image: "" }
        ],
        correctAnswer: 0,
        marks: 1,
        explanation: ""
      }
    ] as any[],
    targetUsers: [] as string[],
    course: ""
  });
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);


  useEffect(() => {
    if (!authLoading && (!isAuthenticated || userType !== "admin")) {
      navigate("/admin-login");
    } else if (userType === "admin") {
      fetchCourses();
      fetchStudyMaterials();
      fetchTests();
    }
  }, [isAuthenticated, userType, authLoading, navigate]);

  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const handleFileUpload = async (file: File, path: string, callback: (url: string) => void) => {
    try {
      setUploading(prev => ({ ...prev, [path]: true }));
      const response = await (apiClient as any).uploadFile(file);
      if (response.success && response.url) {
        callback(response.url);
        toast.success("File uploaded successfully");
      }
    } catch (error) {
      toast.error("Upload failed");
      console.error(error);
    } finally {
      setUploading(prev => ({ ...prev, [path]: false }));
    }
  };

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getTests();
      if (response.success && response.data) {
        setTests(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch tests");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrolledStudents = async (courseId: string) => {
    try {
      setIsLoadingStudents(true);
      const response = await (apiClient as any).getEnrolledStudents(courseId);
      if (response.success && response.data) {
        setEnrolledStudents(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch enrolled students");
    } finally {
      setIsLoadingStudents(false);
    }
  };

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
        examGuidance: formData.examGuidance || undefined,
        counselingSupport: formData.counselingSupport || undefined,
        onlineTag: formData.onlineTag,
        bannerImage: formData.bannerImage || undefined,
        bannerTitle: formData.bannerTitle || undefined,
        bannerSubtitle: formData.bannerSubtitle || undefined,
        teacherGroupImage: formData.teacherGroupImage || undefined,
        yellowTagText: formData.yellowTagText || undefined,
        languageBadge: formData.languageBadge || undefined,
        audienceText: formData.audienceText || undefined,
        promoBannerText: formData.promoBannerText || undefined,
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
        discountPercent: formData.discountPercent ? Number(formData.discountPercent) : undefined,
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
      examGuidance: course.examGuidance || "Exam guidance at our Mathsy Offline centers",
      counselingSupport: course.counselingSupport || "One-to-one emotional well-being support by Mathsy counselors",
      onlineTag: course.onlineTag ?? true,
      bannerImage: course.bannerImage || "",
      bannerTitle: course.bannerTitle || "",
      bannerSubtitle: course.bannerSubtitle || "",
      teacherGroupImage: course.teacherGroupImage || "",
      yellowTagText: course.yellowTagText || "COMEBACK KIT INCLUDED",
      languageBadge: course.languageBadge || "Hinglish",
      audienceText: course.audienceText || "",
      promoBannerText: course.promoBannerText || "New Batch Plans Included",
      oldPrice: course.oldPrice?.toString() || "",
      discountPercent: course.discountPercent?.toString() || "",
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
      examGuidance: "Exam guidance at our Mathsy Offline centers",
      counselingSupport: "One-to-one emotional well-being support by Mathsy counselors",
      onlineTag: true,
      bannerImage: "",
      bannerTitle: "",
      bannerSubtitle: "",
      teacherGroupImage: "",
      yellowTagText: "COMEBACK KIT INCLUDED",
      languageBadge: "Hinglish",
      audienceText: "",
      promoBannerText: "New Batch Plans Included",
      oldPrice: "",
      discountPercent: "",
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
      formDataToSend.append('class', materialFormData.class);
      formDataToSend.append('pages', materialFormData.pages);
      formDataToSend.append('questions', materialFormData.questions);
      formDataToSend.append('year', materialFormData.year);
      if (materialFormData.course) {
        formDataToSend.append('course', materialFormData.course);
      }

      if (selectedFile) {
        formDataToSend.append('pdf', selectedFile);
      }

      if (editingMaterial) {
        await apiClient.updateStudyMaterial(editingMaterial._id, {
          title: materialFormData.title,
          description: materialFormData.description,
          category: materialFormData.category,
          class: materialFormData.class,
          pages: Number(materialFormData.pages) || 0,
          questions: Number(materialFormData.questions) || 0,
          year: materialFormData.year,
          course: materialFormData.course || null,
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
      class: material.class,
      pages: material.pages.toString(),
      questions: material.questions.toString(),
      year: material.year || "",
      course: material.course?._id || "",
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
      class: "",
      pages: "",
      questions: "",
      year: "",
      course: "",
    });
    setSelectedFile(null);
    setEditingMaterial(null);
    setIsMaterialDialogOpen(false);
  };

  const handleEducatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!educatorFormData.phone) {
        toast.error("Please provide phone number");
        return;
      }

      await (apiClient as any).addEducator(educatorFormData.phone, educatorFormData.name);
      toast.success("Educator added successfully");
      setEducatorFormData({ name: "", phone: "" });
      setIsEducatorDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add educator");
    }
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTest) {
        await apiClient.updateTest(editingTest._id, testFormData);
        toast.success("Test updated successfully");
      } else {
        await apiClient.createTest(testFormData);
        toast.success("Test created successfully");
      }
      setIsTestDialogOpen(false);
      fetchTests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save test");
    }
  };

  const handleTestEdit = (test: any) => {
    setEditingTest(test);
    setTestFormData({
      name: test.name,
      class: test.class,
      description: test.description || "",
      duration: test.duration,
      passingMarks: test.passingMarks,
      questions: test.questions,
      targetUsers: test.targetUsers || [],
      course: test.course || ""
    });
    if (test.course) {
      fetchEnrolledStudents(test.course);
    } else {
      setEnrolledStudents([]);
    }
    setIsTestDialogOpen(true);
  };

  const handleTestDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      await apiClient.deleteTest(id);
      toast.success("Test deleted successfully");
      fetchTests();
    } catch (error) {
      toast.error("Failed to delete test");
    }
  };

  const resetTestForm = () => {
    setTestFormData({
      name: "",
      class: "",
      description: "",
      duration: 60,
      passingMarks: 0,
      questions: [
        {
          type: "mcq",
          question: "",
          image: "",
          video: "",
          options: [
            { text: "", image: "" },
            { text: "", image: "" },
            { text: "", image: "" },
            { text: "", image: "" }
          ],
          correctAnswer: 0,
          marks: 1,
          explanation: ""
        }
      ],
      targetUsers: [],
      course: ""
    });
    setEditingTest(null);
    setEnrolledStudents([]);
  };

  const addQuestion = () => {
    setTestFormData({
      ...testFormData,
      questions: [
        ...testFormData.questions,
        {
          type: "mcq",
          question: "",
          image: "",
          video: "",
          options: [
            { text: "", image: "" },
            { text: "", image: "" },
            { text: "", image: "" },
            { text: "", image: "" }
          ],
          correctAnswer: 0,
          marks: 1,
          explanation: ""
        }
      ]
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...testFormData.questions];
    newQuestions.splice(index, 1);
    setTestFormData({ ...testFormData, questions: newQuestions });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...testFormData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setTestFormData({ ...testFormData, questions: newQuestions });
  };

  const updateOption = (qIndex: number, oIndex: number, field: string, value: string) => {
    const newQuestions = [...testFormData.questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[oIndex] = { ...newOptions[oIndex], [field]: value };
    newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
    setTestFormData({ ...testFormData, questions: newQuestions });
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

                {/* Removed Batch About, Dates, and Validity */}

                <div>
                  <Label htmlFor="examGuidance">Exam Guidance</Label>
                  <Textarea
                    id="examGuidance"
                    value={formData.examGuidance}
                    onChange={(e) => setFormData({ ...formData, examGuidance: e.target.value })}
                    placeholder="Exam guidance at our Mathsy Offline centers"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="counselingSupport">Counseling Support</Label>
                  <Textarea
                    id="counselingSupport"
                    value={formData.counselingSupport}
                    onChange={(e) => setFormData({ ...formData, counselingSupport: e.target.value })}
                    placeholder="One-to-one emotional well-being support by Mathsy counselors"
                    rows={2}
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="onlineTag"
                    checked={formData.onlineTag}
                    onCheckedChange={(checked) => setFormData({ ...formData, onlineTag: checked })}
                  />
                  <Label htmlFor="onlineTag">Show ONLINE Ribbon</Label>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="col-span-2 font-semibold">Banner Settings</div>
                  <div>
                    <Label htmlFor="bannerImage">Banner Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bannerImage"
                        value={formData.bannerImage}
                        onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                        placeholder="https://..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(file, 'bannerImage', (url) => setFormData(prev => ({ ...prev, bannerImage: url })));
                          };
                          input.click();
                        }}
                        disabled={uploading['bannerImage']}
                      >
                        {uploading['bannerImage'] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="teacherGroupImage">Teacher Group Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="teacherGroupImage"
                        value={formData.teacherGroupImage}
                        onChange={(e) => setFormData({ ...formData, teacherGroupImage: e.target.value })}
                        placeholder="https://..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(file, 'teacherGroupImage', (url) => setFormData(prev => ({ ...prev, teacherGroupImage: url })));
                          };
                          input.click();
                        }}
                        disabled={uploading['teacherGroupImage']}
                      >
                        {uploading['teacherGroupImage'] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bannerTitle">Banner Title (Uppercase)</Label>
                    <Input
                      id="bannerTitle"
                      value={formData.bannerTitle}
                      onChange={(e) => setFormData({ ...formData, bannerTitle: e.target.value })}
                      placeholder="PROJECT 45"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bannerSubtitle">Banner Subtitle</Label>
                    <Input
                      id="bannerSubtitle"
                      value={formData.bannerSubtitle}
                      onChange={(e) => setFormData({ ...formData, bannerSubtitle: e.target.value })}
                      placeholder="CLASS 11TH"
                    />
                  </div>
                  <div>
                    <Label htmlFor="yellowTagText">Yellow Tag Text</Label>
                    <Input
                      id="yellowTagText"
                      value={formData.yellowTagText}
                      onChange={(e) => setFormData({ ...formData, yellowTagText: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="languageBadge">Language Badge</Label>
                    <Input
                      id="languageBadge"
                      value={formData.languageBadge}
                      onChange={(e) => setFormData({ ...formData, languageBadge: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="col-span-2 font-semibold">Additional Details</div>
                  <div>
                    <Label htmlFor="audienceText">Audience Text</Label>
                    <Input
                      id="audienceText"
                      value={formData.audienceText}
                      onChange={(e) => setFormData({ ...formData, audienceText: e.target.value })}
                      placeholder="For Class 11th Science Students"
                    />
                  </div>
                  <div>
                    <Label htmlFor="promoBannerText">Promo Banner Text</Label>
                    <Input
                      id="promoBannerText"
                      value={formData.promoBannerText}
                      onChange={(e) => setFormData({ ...formData, promoBannerText: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="oldPrice">Old Price (₹)</Label>
                    <Input
                      id="oldPrice"
                      type="number"
                      value={formData.oldPrice}
                      onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                      placeholder="2450"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountPercent">Discount Percent (%)</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      placeholder="59"
                    />
                  </div>
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
                        {material.category} • {material.class}
                        {material.course && ` • ${material.course.title}`}
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

        {/* Educator Management Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Educator Management
            </CardTitle>
            <CardDescription>Add new educators to the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Create credentials for new educators
              </p>
              <Dialog open={isEducatorDialogOpen} onOpenChange={setIsEducatorDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Educator
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Educator</DialogTitle>
                    <DialogDescription>Set email and password for the new educator</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEducatorSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="educator-name">Full Name</Label>
                      <Input
                        id="educator-name"
                        value={educatorFormData.name}
                        onChange={(e) => setEducatorFormData({ ...educatorFormData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="educator-phone">Phone Number</Label>
                      <Input
                        id="educator-phone"
                        value={educatorFormData.phone}
                        onChange={(e) => setEducatorFormData({ ...educatorFormData, phone: e.target.value })}
                        placeholder="9876543210"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEducatorDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="hero">
                        Add Educator
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Test Management Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Test Management ({tests.length})
            </CardTitle>
            <CardDescription>Create and manage online tests with AI integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">
                Create MCQs or subjective tests with automatic AI evaluation
              </p>
              <Button variant="hero" onClick={() => { resetTestForm(); setIsTestDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Test
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test._id}>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>{test.class}</TableCell>
                      <TableCell>{test.duration} mins</TableCell>
                      <TableCell>{test.questions?.length || 0}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${test.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {test.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleTestEdit(test)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleTestDelete(test._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
                  <Label htmlFor="material-class">Class</Label>
                  <select
                    id="material-class"
                    value={materialFormData.class}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, class: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">-- Select Class --</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="material-course">Course (Optional)</Label>
                <Select
                  id="material-course"
                  options={courses.map(course => ({ value: course._id, label: `${course.title} (${course.grade})` }))}
                  value={courses.find(c => c._id === materialFormData.course) ? { value: materialFormData.course, label: courses.find(c => c._id === materialFormData.course)!.title } : null}
                  onChange={(option) => setMaterialFormData({ ...materialFormData, course: option?.value || "" })}
                  isClearable
                  placeholder="Search and select a course..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '40px',
                      borderColor: 'hsl(var(--input))',
                      '&:hover': { borderColor: 'hsl(var(--input))' },
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'hsl(var(--background))',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
                      color: 'hsl(var(--foreground))',
                    }),
                  }}
                />
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

        {/* Test Creation Dialog */}
        <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTest ? "Edit Test" : "Create New Test"}</DialogTitle>
              <DialogDescription>Configure test settings and questions</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleTestSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Test Name *</Label>
                  <Input
                    value={testFormData.name}
                    onChange={(e) => setTestFormData({ ...testFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Class *</Label>
                  <select
                    value={testFormData.class}
                    onChange={(e) => setTestFormData({ ...testFormData, class: e.target.value })}
                    className="w-full h-10 px-3 border rounded-md"
                    required
                  >
                    <option value="">Select Class</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Assigned Course</Label>
                  <select
                    value={testFormData.course}
                    onChange={(e) => {
                      const courseId = e.target.value;
                      setTestFormData({ ...testFormData, course: courseId });
                      if (courseId) {
                        fetchEnrolledStudents(courseId);
                      } else {
                        setEnrolledStudents([]);
                      }
                    }}
                    className="w-full h-10 px-3 border rounded-md"
                  >
                    <option value="">None (Available to all in Class)</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Target Specific Students (Optional)</Label>
                  <Select
                    isMulti
                    options={enrolledStudents.map(s => ({ value: s._id, label: `${s.name} (${s.email})` }))}
                    value={enrolledStudents
                      .filter(s => testFormData.targetUsers.includes(s._id))
                      .map(s => ({ value: s._id, label: `${s.name} (${s.email})` }))}
                    onChange={(selected: any) => {
                      setTestFormData({
                        ...testFormData,
                        targetUsers: selected ? selected.map((s: any) => s.value) : []
                      });
                    }}
                    isLoading={isLoadingStudents}
                    placeholder="Select students..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '40px',
                        borderColor: 'hsl(var(--input))',
                        '&:hover': { borderColor: 'hsl(var(--input))' },
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: 'hsl(var(--background))',
                        zIndex: 100,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
                        color: 'hsl(var(--foreground))',
                      }),
                    }}
                  />
                  {testFormData.course && enrolledStudents.length === 0 && !isLoadingStudents && (
                    <p className="text-xs text-muted-foreground mt-1">No students enrolled in this course yet.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (Minutes)</Label>
                  <Input
                    type="number"
                    value={testFormData.duration}
                    onChange={(e) => setTestFormData({ ...testFormData, duration: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Passing Marks</Label>
                  <Input
                    type="number"
                    value={testFormData.passingMarks}
                    onChange={(e) => setTestFormData({ ...testFormData, passingMarks: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={testFormData.description}
                  onChange={(e) => setTestFormData({ ...testFormData, description: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Questions ({testFormData.questions.length})</h3>
                  <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Question
                  </Button>
                </div>

                {testFormData.questions.map((q, qIdx) => (
                  <Card key={qIdx} className="p-4 border-2">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        <span className="font-bold flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">
                          {qIdx + 1}
                        </span>
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(qIdx, 'type', e.target.value)}
                          className="h-9 px-2 border rounded-md text-sm"
                        >
                          <option value="mcq">MCQ</option>
                          <option value="subjective">Subjective</option>
                        </select>
                        <Input
                          type="number"
                          value={q.marks}
                          onChange={(e) => updateQuestion(qIdx, 'marks', Number(e.target.value))}
                          className="w-20 h-9"
                          placeholder="Marks"
                        />
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qIdx)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Label>Question Text</Label>
                      <Textarea
                        value={q.question}
                        onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                        required
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Question Image</Label>
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, `q-${qIdx}-img`, (url) => updateQuestion(qIdx, 'image', url));
                              }}
                              className="flex-1"
                            />
                            {q.image && (
                              <div className="w-10 h-10 border rounded bg-muted flex items-center justify-center overflow-hidden">
                                <img src={q.image} alt="Preview" className="object-cover w-full h-full" />
                              </div>
                            )}
                            {uploading[`q-${qIdx}-img`] && <Loader2 className="w-4 h-4 animate-spin mt-3" />}
                          </div>
                        </div>
                        <div>
                          <Label>Question Video</Label>
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, `q-${qIdx}-vid`, (url) => updateQuestion(qIdx, 'video', url));
                              }}
                              className="flex-1"
                            />
                            {uploading[`q-${qIdx}-vid`] && <Loader2 className="w-4 h-4 animate-spin mt-3" />}
                          </div>
                        </div>
                      </div>

                      {q.type === 'mcq' && (
                        <div className="space-y-3 pt-2">
                          <Label>Options</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt: any, oIdx: number) => (
                              <div key={oIdx} className="flex gap-2 items-center">
                                <input
                                  type="radio"
                                  name={`correct-${qIdx}`}
                                  checked={q.correctAnswer === oIdx}
                                  onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                                />
                                <Input
                                  value={opt.text}
                                  onChange={(e) => updateOption(qIdx, oIdx, 'text', e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                  className="flex-1"
                                  required={q.type === 'mcq'}
                                />
                                <div className="flex gap-1 items-center">
                                  <Label htmlFor={`opt-file-${qIdx}-${oIdx}`} className="cursor-pointer p-2 border rounded hover:bg-muted">
                                    <ImageIcon className="w-4 h-4" />
                                    <input
                                      id={`opt-file-${qIdx}-${oIdx}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, `q-${qIdx}-o-${oIdx}-img`, (url) => updateOption(qIdx, oIdx, 'image', url));
                                      }}
                                    />
                                  </Label>
                                  {opt.image && (
                                    <div className="w-8 h-8 border rounded bg-muted flex items-center justify-center overflow-hidden">
                                      <img src={opt.image} alt="Preview" className="object-cover w-full h-full" />
                                    </div>
                                  )}
                                  {uploading[`q-${qIdx}-o-${oIdx}-img`] && <Loader2 className="w-4 h-4 animate-spin" />}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>Explanation / Solution</Label>
                        <Textarea
                          value={q.explanation}
                          onChange={(e) => updateQuestion(qIdx, 'explanation', e.target.value)}
                          placeholder="If left empty, Gemini will generate this."
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero">
                  {editingTest ? "Update Test" : "Create Test"}
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

