import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ArrowLeft, BookOpen, PlayCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Course {
    _id: string;
    title: string;
    description: string;
    videoUrl?: string;
    grade?: string;
    chapters?: number;
}

interface Video {
    _id: string;
    title: string;
    description?: string;
    videoUrl: string;
    duration?: string;
    order: number;
    thumbnail?: string;
}

const CourseWatch = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error("Please login to access course content");
            navigate("/login");
            return;
        }

        if (id) {
            checkEnrollmentAndLoadCourse();
        }
    }, [id, isAuthenticated]);

    const checkEnrollmentAndLoadCourse = async () => {
        try {
            setIsLoading(true);

            // Check if user is enrolled
            const enrollmentRes = await apiClient.checkEnrollment(id!);

            if (!enrollmentRes.success || !enrollmentRes.enrolled) {
                toast.error("You must enroll in this course to access videos");
                navigate("/courses");
                return;
            }

            setIsEnrolled(true);

            // Load course details
            const courseRes = await apiClient.getCourse(id!);
            if (courseRes.success && courseRes.data) {
                setCourse(courseRes.data);
            }

            // Load course videos
            const videosRes = await apiClient.getCourseVideos(id!);
            if (videosRes.success && videosRes.data) {
                setVideos(videosRes.data);
                // Auto-select first video
                if (videosRes.data.length > 0) {
                    setCurrentVideo(videosRes.data[0]);
                }
            }
        } catch (error) {
            toast.error("Failed to load course");
            navigate("/courses");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (!course) {
        return null;
    }

    return (
        <Layout>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="bg-muted border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate("/courses")}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Courses
                                </Button>
                                <div>
                                    <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                                        <BookOpen className="w-5 h-5" />
                                        {course.title}
                                    </h1>
                                    {course.grade && (
                                        <p className="text-sm text-muted-foreground">{course.grade}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Video Player - Takes 2/3 width */}
                        <div className="lg:col-span-2">
                            <div className="bg-black rounded-lg overflow-hidden mb-4">
                                {currentVideo?.videoUrl ? (
                                    <>
                                        {/* Check if it's a YouTube URL */}
                                        {currentVideo.videoUrl.includes('youtube.com') || currentVideo.videoUrl.includes('youtu.be') ? (
                                            <div className="relative pb-[56.25%] h-0">
                                                <iframe
                                                    className="absolute top-0 left-0 w-full h-full"
                                                    src={getYouTubeEmbedUrl(currentVideo.videoUrl)}
                                                    title={currentVideo.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        ) : currentVideo.videoUrl.includes('vimeo.com') ? (
                                            <div className="relative pb-[56.25%] h-0">
                                                <iframe
                                                    className="absolute top-0 left-0 w-full h-full"
                                                    src={getVimeoEmbedUrl(currentVideo.videoUrl)}
                                                    title={currentVideo.title}
                                                    frameBorder="0"
                                                    allow="autoplay; fullscreen; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        ) : (
                                            // Direct video URL
                                            <video
                                                className="w-full"
                                                controls
                                                controlsList="nodownload"
                                                src={currentVideo.videoUrl}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        )}
                                    </>
                                ) : (
                                    <div className="aspect-video flex items-center justify-center bg-muted">
                                        <div className="text-center text-muted-foreground">
                                            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg">No video selected</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Current Video Info */}
                            <div className="bg-card rounded-lg border p-6">
                                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                                    {currentVideo?.title || 'Select a video from the playlist'}
                                </h2>
                                {currentVideo?.description && (
                                    <p className="text-muted-foreground mb-4">{currentVideo.description}</p>
                                )}

                                {currentVideo?.duration && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>Duration: {currentVideo.duration}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Video Playlist - Takes 1/3 width */}
                        <div className="lg:col-span-1">
                            <div className="bg-card rounded-lg border">
                                <div className="p-4 border-b">
                                    <h3 className="font-semibold text-lg">Course Videos</h3>
                                    <p className="text-sm text-muted-foreground">{videos.length} videos</p>
                                </div>

                                <div className="max-h-[600px] overflow-y-auto">
                                    {videos.length > 0 ? (
                                        videos.map((video) => (
                                            <div
                                                key={video._id}
                                                onClick={() => setCurrentVideo(video)}
                                                className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted ${currentVideo?._id === video._id ? 'bg-muted border-l-4 border-l-primary' : ''
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    {/* Thumbnail */}
                                                    <div className="relative flex-shrink-0">
                                                        {video.thumbnail ? (
                                                            <img
                                                                src={video.thumbnail}
                                                                alt={video.title}
                                                                className="w-24 h-16 object-cover rounded"
                                                            />
                                                        ) : (
                                                            <div className="w-24 h-16 bg-muted rounded flex items-center justify-center">
                                                                <PlayCircle className="w-8 h-8 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        {video.duration && (
                                                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                                                {video.duration}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Video Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                                                            {video.title}
                                                        </h4>
                                                        {video.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                                {video.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No videos available yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
};

// Helper function to convert Vimeo URL to embed URL
const getVimeoEmbedUrl = (url: string): string => {
    const videoId = url.split('/').pop();
    return `https://player.vimeo.com/video/${videoId}`;
};

export default CourseWatch;
