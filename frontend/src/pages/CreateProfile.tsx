import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, User, MapPin, School, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

/* ---------------- ZOD SCHEMA ---------------- */

const profileSchema = z.object({
    username: z.string().trim().min(3, "Username must be at least 3 characters").max(30),
    studentClass: z.string().trim().min(1, "Class is required"),
    address: z.string().trim().min(10, "Please enter a valid address"),
});

/* ---------------- COMPONENT ---------------- */

const CreateProfile = () => {
    const { completeProfile, user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [username, setUsername] = useState("");
    const [studentClass, setStudentClass] = useState("");
    const [address, setAddress] = useState("");
    const [avatar, setAvatar] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const validation = profileSchema.safeParse({ username, studentClass, address });
        if (!validation.success) {
            toast.error(validation.error.errors[0].message);
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await completeProfile({
                username,
                studentClass,
                address,
                avatar: avatar || undefined, // Send undefined if empty
            });

            if (error) {
                toast.error(error);
            } else {
                toast.success("Profile updated successfully!");
                navigate("/student-dashboard", { replace: true });
            }
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    // Pre-fill if some data exists (e.g. from Google)
    // Not implemented here as user defaults are empty usually

    return (
        <Layout>
            <section className="py-20 bg-muted min-h-[80vh] flex items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto">
                        <div className="bg-card rounded-2xl shadow-lg p-8">
                            <div className="text-center mb-8">
                                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                                    Complete Your Profile
                                </h1>
                                <p className="text-muted-foreground">
                                    We just need a few more details to get you started.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* AVATAR INPUT (Simple URL for now) */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Profile Image URL (Optional)
                                    </label>
                                    <div className="relative">
                                        <Camera className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder="https://example.com/avatar.jpg"
                                            className="pl-10"
                                            value={avatar}
                                            onChange={(e) => setAvatar(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder="cool_student_123"
                                            className="pl-10"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Class / Grade
                                    </label>
                                    <div className="relative">
                                        <School className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={studentClass}
                                            onChange={(e) => setStudentClass(e.target.value)}
                                        >
                                            <option value="">-- Select Class --</option>
                                            <option value="Class 6">Class 6</option>
                                            <option value="Class 7">Class 7</option>
                                            <option value="Class 8">Class 8</option>
                                            <option value="Class 9">Class 9</option>
                                            <option value="Class 10">Class 10</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Address
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder="Your city, state"
                                            className="pl-10"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Complete Profile"
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default CreateProfile;
