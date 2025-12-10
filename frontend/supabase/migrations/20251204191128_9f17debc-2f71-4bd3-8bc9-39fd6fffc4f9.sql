-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student', 'parent');

-- Create user roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create parent-student relationship table
CREATE TABLE public.parent_student_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (parent_id, student_id)
);

-- Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    syllabus JSONB,
    duration TEXT,
    timing TEXT,
    fee DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create enrollments table
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (student_id, course_id)
);

-- Create live classes table
CREATE TABLE public.live_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    class_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    meeting_link TEXT,
    recording_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create attendance table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    live_class_id UUID REFERENCES public.live_classes(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late')),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (student_id, live_class_id)
);

-- Create study materials table
CREATE TABLE public.study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('notes', 'assignment', 'solution', 'pyq', 'practice_sheet')),
    file_url TEXT NOT NULL,
    chapter TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create recorded lectures table
CREATE TABLE public.recorded_lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    chapter TEXT,
    duration TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create test series table
CREATE TABLE public.test_series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create test questions table
CREATE TABLE public.test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES public.test_series(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    marks INTEGER DEFAULT 1,
    explanation TEXT,
    order_index INTEGER DEFAULT 0
);

-- Create test attempts table
CREATE TABLE public.test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    test_id UUID REFERENCES public.test_series(id) ON DELETE CASCADE NOT NULL,
    answers JSONB,
    score INTEGER,
    total_marks INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_taken_seconds INTEGER
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    transaction_id TEXT,
    invoice_url TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create notices table
CREATE TABLE public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'holiday', 'exam', 'important')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create testimonials table
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    video_url TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create results/toppers table
CREATE TABLE public.results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    exam_name TEXT NOT NULL,
    score TEXT NOT NULL,
    year INTEGER,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorded_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user profile id
CREATE OR REPLACE FUNCTION public.get_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Parent-student links policies
CREATE POLICY "Parents can view their links" ON public.parent_student_links
    FOR SELECT USING (parent_id = public.get_profile_id(auth.uid()));

-- Courses - public read
CREATE POLICY "Anyone can view active courses" ON public.courses
    FOR SELECT USING (is_active = true);

-- Enrollments policies
CREATE POLICY "Students can view their enrollments" ON public.enrollments
    FOR SELECT USING (student_id = public.get_profile_id(auth.uid()));
CREATE POLICY "Students can enroll" ON public.enrollments
    FOR INSERT WITH CHECK (student_id = public.get_profile_id(auth.uid()));

-- Live classes - enrolled students can view
CREATE POLICY "Enrolled students can view live classes" ON public.live_classes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.course_id = live_classes.course_id
            AND e.student_id = public.get_profile_id(auth.uid())
        )
    );

-- Attendance policies
CREATE POLICY "Students can view their attendance" ON public.attendance
    FOR SELECT USING (student_id = public.get_profile_id(auth.uid()));

-- Study materials - enrolled students can view
CREATE POLICY "Enrolled students can view materials" ON public.study_materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.course_id = study_materials.course_id
            AND e.student_id = public.get_profile_id(auth.uid())
        )
    );

-- Recorded lectures - enrolled students can view
CREATE POLICY "Enrolled students can view lectures" ON public.recorded_lectures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.course_id = recorded_lectures.course_id
            AND e.student_id = public.get_profile_id(auth.uid())
        )
    );

-- Test series policies
CREATE POLICY "Enrolled students can view tests" ON public.test_series
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.course_id = test_series.course_id
            AND e.student_id = public.get_profile_id(auth.uid())
        )
    );

-- Test questions policies
CREATE POLICY "Students can view test questions" ON public.test_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.test_series ts
            JOIN public.enrollments e ON e.course_id = ts.course_id
            WHERE ts.id = test_questions.test_id
            AND e.student_id = public.get_profile_id(auth.uid())
        )
    );

-- Test attempts policies
CREATE POLICY "Students can view their attempts" ON public.test_attempts
    FOR SELECT USING (student_id = public.get_profile_id(auth.uid()));
CREATE POLICY "Students can create attempts" ON public.test_attempts
    FOR INSERT WITH CHECK (student_id = public.get_profile_id(auth.uid()));
CREATE POLICY "Students can update their attempts" ON public.test_attempts
    FOR UPDATE USING (student_id = public.get_profile_id(auth.uid()));

-- Payments policies
CREATE POLICY "Students can view their payments" ON public.payments
    FOR SELECT USING (student_id = public.get_profile_id(auth.uid()));

-- Notices - public read
CREATE POLICY "Anyone can view active notices" ON public.notices
    FOR SELECT USING (is_active = true);

-- Testimonials - public read
CREATE POLICY "Anyone can view testimonials" ON public.testimonials
    FOR SELECT TO anon, authenticated USING (true);

-- Results - public read
CREATE POLICY "Anyone can view results" ON public.results
    FOR SELECT TO anon, authenticated USING (true);

-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );
  
  -- Assign default role based on user_type metadata
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'user_type')::app_role, 'student')
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample courses
INSERT INTO public.courses (name, description, duration, timing, fee, syllabus) VALUES
('Class 8 Mathematics', 'Complete mathematics course for Class 8 students covering all NCERT topics', '12 months', 'Mon-Fri, 4:00 PM - 5:30 PM', 8000, '["Number System", "Algebra", "Geometry", "Mensuration", "Data Handling"]'),
('Class 9 Mathematics', 'Comprehensive Class 9 math course with focus on board exam preparation', '12 months', 'Mon-Fri, 5:30 PM - 7:00 PM', 10000, '["Real Numbers", "Polynomials", "Coordinate Geometry", "Linear Equations", "Triangles", "Statistics"]'),
('Class 10 Mathematics', 'Board exam focused Class 10 math course with extensive practice', '12 months', 'Mon-Sat, 4:00 PM - 6:00 PM', 12000, '["Real Numbers", "Polynomials", "Quadratic Equations", "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Trigonometry", "Circles", "Surface Areas and Volumes", "Statistics", "Probability"]'),
('JEE Basics', 'Foundation course for JEE aspirants covering fundamental concepts', '18 months', 'Mon-Sat, 6:00 PM - 8:00 PM', 25000, '["Algebra", "Trigonometry", "Coordinate Geometry", "Calculus Basics", "Vectors"]');

-- Insert sample notices
INSERT INTO public.notices (title, content, type) VALUES
('Welcome to New Session 2024-25', 'New academic session starts from April 1st. All students please complete your enrollment.', 'important'),
('Holiday Notice', 'Classes will remain closed on March 8th for Holi festival.', 'holiday'),
('Monthly Test Schedule', 'Monthly tests for all classes will be conducted on last Saturday of every month.', 'exam');

-- Insert sample testimonials
INSERT INTO public.testimonials (name, role, content, rating, is_featured) VALUES
('Priya Sharma', 'Class 10 Student', 'Mathsy helped me score 98% in my board exams! The teaching methods are excellent and doubt clearing sessions are very helpful.', 5, true),
('Rajesh Kumar', 'Parent', 'My son''s performance has improved dramatically since joining Mathsy. The teachers are dedicated and the study materials are comprehensive.', 5, true),
('Ankit Verma', 'JEE Aspirant', 'Best coaching for JEE preparation. The concepts are explained so clearly that even difficult topics become easy to understand.', 5, true);

-- Insert sample results
INSERT INTO public.results (student_name, exam_name, score, year, is_featured) VALUES
('Riya Patel', 'CBSE Class 10', '99%', 2024, true),
('Arjun Singh', 'JEE Main', 'AIR 245', 2024, true),
('Sneha Gupta', 'CBSE Class 12', '97%', 2024, true),
('Vikram Reddy', 'CBSE Class 10', '98%', 2024, true);