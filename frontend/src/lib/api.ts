const API_BASE_URL = import.meta.env.VITE_API_URL;

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  count?: number;
} & T;

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Auth endpoints
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    studentClass?: string;
  }) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async sendOtp(email: string) {
    return this.request<any>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOtp(email: string, otp: string) {
    return this.request<any>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async loginWithOtp(email: string, otp: string) {
    return this.request<{ token: string; user: any; isNewUser: boolean }>('/auth/login-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async googleLogin(data: any) {
    return this.request<{ token: string; user: any }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeProfile(data: FormData | any) {
    return this.request<any>('/auth/complete-profile', {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async updateProfile(data: FormData | any) {
    return this.request<any>('/dashboard/profile', {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async sendWhatsAppOtp(phone: string) {
    return this.request<any>('/auth/send-whatsapp-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async sendPhoneOtp(phone: string) {
    return this.request<{ success: boolean; message: string; otp?: string }>('/auth/send-phone-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyPhoneOtp(phone: string, otp: string, isFirebaseVerified: boolean = false) {
    return this.request<{ success: boolean; token: string; user: any; message: string }>('/auth/verify-phone-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, isFirebaseVerified }),
    });
  }

  async verifyWhatsAppOtp(otp: string) {
    return this.request<any>('/auth/verify-whatsapp-otp', {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  }

  async adminLogin(password: string) {
    return this.request<{ token: string; user: any }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me', {
      method: 'GET',
    });
  }



  async addEducator(phone: string, name: string) {
    return this.request<{ success: boolean; data: any }>('/admin/add-educator', {
      method: 'POST',
      body: JSON.stringify({ phone, name }),
    });
  }

  // Course endpoints
  async getCourses() {
    return this.request<{ data: any[] }>('/courses', {
      method: 'GET',
    });
  }

  async getCoursesForUser() {
    return this.request<any[]>('/courses/my-courses', {
      method: 'GET',
    });
  }

  async getCourse(id: string) {
    return this.request<any>(`/courses/${id}`, {
      method: 'GET',
    });
  }

  async createCourse(data: {
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
  }) {
    return this.request<any>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: string, data: Partial<any>) {
    return this.request<any>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(id: string) {
    return this.request<void>(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Enrollment endpoints
  async getEnrollments() {
    return this.request<any[]>('/enrollments', {
      method: 'GET',
    });
  }

  async createEnrollment(courseId: string) {
    return this.request<any>('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  }

  async checkEnrollment(courseId: string) {
    return this.request<{ enrolled: boolean; enrollment: any }>(`/enrollments/check/${courseId}`, {
      method: 'GET',
    });
  }

  async getCourseVideos(courseId: string) {
    return this.request<any>(`/course-videos/${courseId}`, {
      method: 'GET',
    });
  }

  // Contact endpoints
  async createContact(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) {
    return this.request<any>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContacts() {
    return this.request<any[]>('/contact', {
      method: 'GET',
    });
  }

  // Study Material endpoints
  async getStudyMaterials() {
    return this.request<{ data: any[] }>('/study-materials', {
      method: 'GET',
    });
  }

  async getStudyMaterial(id: string) {
    return this.request<any>(`/study-materials/${id}`, {
      method: 'GET',
    });
  }

  async createStudyMaterial(formData: FormData) {
    return this.request<any>('/study-materials', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  }

  async updateStudyMaterial(id: string, data: Partial<any>) {
    return this.request<any>(`/study-materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStudyMaterial(id: string) {
    return this.request<void>(`/study-materials/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudyMaterialPdf(id: string) {
    const url = `${this.baseURL}/study-materials/${id}/pdf`;
    const headers: HeadersInit = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch PDF');
    }

    return response;
  }

  // Fee Status endpoints
  async getFeeStatus() {
    return this.request<{ data: any[] }>('/fee-status/my', {
      method: 'GET',
    });
  }

  // Dashboard endpoints
  async getStudentStats() {
    return this.request<{ data: { stats: any; recentTests: any[] } }>('/dashboard/student-stats', {
      method: 'GET',
    });
  }

  // Attendance endpoints
  async generateAttendanceToken(type: 'IN' | 'OUT') {
    return this.request<{ data: { token: string; expiresAt: string; type: string } }>('/attendance/generate', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  async scanAttendanceQR(token: string) {
    return this.request<any>('/attendance/scan', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Test endpoints
  async getTests() {
    return this.request<{ data: any[] }>('/tests', {
      method: 'GET',
    });
  }

  async getAllTests() {
    return this.request<{ data: any[] }>('/tests/all', {
      method: 'GET',
    });
  }

  async getTest(id: string) {
    return this.request<{ data: any }>(`/tests/${id}`, {
      method: 'GET',
    });
  }

  async createTest(data: any) {
    return this.request<any>('/tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTest(id: string, data: any) {
    return this.request<any>(`/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTest(id: string) {
    return this.request<void>(`/tests/${id}`, {
      method: 'DELETE',
    });
  }

  async submitTest(id: string, data: { answers: any[]; timeTaken: number }) {
    return this.request<any>(`/tests/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTestResult(testId: string) {
    return this.request<{ data: any }>(`/tests/${testId}/result`, {
      method: 'GET',
    });
  }

  async getAllTestResults() {
    return this.request<{ data: any[] }>('/tests/results/all', {
      method: 'GET',
    });
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ url: string; public_id: string }>('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type
    });
  }

  async getEnrolledStudents(courseId: string) {
    return this.request<{ data: any[] }>(`/enrollments/course/${courseId}/students`, {
      method: 'GET',
    });
  }

  // Review endpoints
  async getReviews(page: number = 1, limit: number = 5) {
    return this.request<{
      data: any[];
      total: number;
      page: number;
      pages: number;
    }>(`/reviews?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  async createReview(data: { content: string; rating: number }) {
    return this.request<{ success: boolean; message: string; data: any }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

