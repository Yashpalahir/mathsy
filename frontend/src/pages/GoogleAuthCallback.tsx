import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api";

/**
 * GoogleAuthCallback Component
 * 
 * This page handles the OAuth callback from Google authentication.
 * It extracts the JWT token from the URL query parameters, stores it,
 * fetches user data, and redirects appropriately.
 */
const GoogleAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                console.log('\n📍 [CALLBACK PAGE] GoogleAuthCallback component mounted');
                console.log('📍 [CALLBACK PAGE] Current URL:', window.location.href);

                // Step 1: Extract JWT token from URL query parameters
                const token = searchParams.get("token");
                console.log('🔍 [CALLBACK PAGE] Extracting token from URL...');

                if (!token) {
                    console.error('❌ [CALLBACK PAGE] No token found in URL query parameters');
                    toast.error("No authentication token received. Please try again.");
                    navigate("/login", { replace: true });
                    return;
                }

                console.log('✅ [CALLBACK PAGE] Token found:', token.substring(0, 20) + '...');

                // Step 2: Store token in localStorage for future API calls
                console.log('💾 [CALLBACK PAGE] Storing token in localStorage...');
                localStorage.setItem("token", token);

                // Step 3: Set token in API client so all future requests include it
                console.log('🔧 [CALLBACK PAGE] Setting token in API client...');
                apiClient.setToken(token);

                // Step 4: Fetch user data to verify token and populate auth state
                console.log('📡 [CALLBACK PAGE] Fetching user data from /api/auth/me...');
                const response = await apiClient.getMe();
                console.log('📡 [CALLBACK PAGE] Response received:', response);

                if (response.success && response.user) {
                    console.log('✅ [CALLBACK PAGE] User data retrieved successfully');
                    console.log('👤 [CALLBACK PAGE] User:', {
                        id: response.user.id,
                        email: response.user.email,
                        name: response.user.name,
                        role: response.user.role,
                        isProfileComplete: response.user.isProfileComplete
                    });

                    toast.success("Logged in successfully");

                    // Redirect based on role + profile completion + phone verification
                    const isPhoneVerified = !!response.user?.profile?.isPhoneVerified;

                    if (response.user.role === "admin") {
                        navigate("/admin", { replace: true });
                        return;
                    }

                    if (!response.user.isProfileComplete || !isPhoneVerified) {
                        navigate("/create-profile", { replace: true });
                        return;
                    }

                    navigate("/student-dashboard", { replace: true });
                } else {
                    throw new Error("Failed to fetch user data");
                }
            } catch (error) {
                console.error('❌ [CALLBACK PAGE] Error in OAuth callback:', error);
                console.error('❌ [CALLBACK PAGE] Error details:', error instanceof Error ? error.message : 'Unknown error');

                toast.error(error instanceof Error ? error.message : "Authentication failed. Please try again.");

                // Clean up invalid token
                console.log('🧹 [CALLBACK PAGE] Cleaning up invalid token...');
                localStorage.removeItem("token");
                apiClient.setToken(null);

                navigate("/login", { replace: true });
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <Layout>
            <section className="py-20 bg-muted min-h-[80vh] flex items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            </div>
                            <h1 className="font-display text-xl font-bold text-foreground">
                                Signing you in...
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Please wait while we complete Google authentication.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default GoogleAuthCallback;
