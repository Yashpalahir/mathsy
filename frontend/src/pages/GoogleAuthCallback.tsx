import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
    const { user, isLoading: authLoading } = useAuth();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Completing authentication...");

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
                    // No token found in URL - authentication failed
                    setStatus("error");
                    setMessage("No authentication token received. Please try again.");
                    setTimeout(() => navigate("/login"), 3000);
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
                    const user = response.user;
                    console.log('✅ [CALLBACK PAGE] User data retrieved successfully');
                    console.log('👤 [CALLBACK PAGE] User Profile Status:', user.isProfileComplete ? 'COMPLETE' : 'INCOMPLETE');
                    console.log('👤 [CALLBACK PAGE] User Role:', user.role);

                    // Authentication successful!
                    setStatus("success");
                    setMessage("Authentication successful! Redirecting...");

                    // Step 5: Wait briefly to show success message
                    setTimeout(() => {
                        // Step 6: Redirect based on user's profile completion and role
                        // FORCE REDIRECT to create-profile if flag is false or missing
                        if (user.isProfileComplete === false || user.isProfileComplete === undefined) {
                            console.log('🔀 [CALLBACK PAGE] Redirecting to /create-profile');
                            navigate("/create-profile", { replace: true });
                        } else if (user.role === "admin") {
                            console.log('🔀 [CALLBACK PAGE] Redirecting to /admin');
                            navigate("/admin", { replace: true });
                        } else {
                            console.log('🔀 [CALLBACK PAGE] Redirecting to /student-dashboard');
                            navigate("/student-dashboard", { replace: true });
                        }
                    }, 1000);
                } else {
                    throw new Error("Failed to fetch user data");
                }
            } catch (error) {
                console.error('❌ [CALLBACK PAGE] Error in OAuth callback:', error);
                console.error('❌ [CALLBACK PAGE] Error details:', error instanceof Error ? error.message : 'Unknown error');

                // Authentication failed
                setStatus("error");
                setMessage(
                    error instanceof Error
                        ? error.message
                        : "Authentication failed. Please try again."
                );

                // Clean up invalid token
                console.log('🧹 [CALLBACK PAGE] Cleaning up invalid token...');
                localStorage.removeItem("token");
                apiClient.setToken(null);

                // Redirect to login after showing error
                console.log('🔀 [CALLBACK PAGE] Redirecting to /login in 3 seconds...');
                setTimeout(() => navigate("/login"), 3000);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <Layout>
            <section className="py-20 bg-muted min-h-[80vh] flex items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8">
                        <div className="text-center space-y-6">
                            {/* Icon */}
                            <div className="flex justify-center">
                                {status === "loading" && (
                                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                                )}
                                {status === "success" && (
                                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in">
                                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                                    </div>
                                )}
                                {status === "error" && (
                                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center animate-in zoom-in">
                                        <XCircle className="h-10 w-10 text-red-600" />
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="font-display text-2xl font-bold text-foreground">
                                {status === "loading" && "Authenticating..."}
                                {status === "success" && "Success!"}
                                {status === "error" && "Authentication Failed"}
                            </h1>

                            {/* Message */}
                            <p className="text-muted-foreground">{message}</p>

                            {/* Loading indicator for status */}
                            {status === "loading" && (
                                <div className="flex flex-col items-center gap-2 pt-4">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Please wait...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default GoogleAuthCallback;
