import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

const EducatorWelcome = () => {
    const { user, logout } = useAuth();

    return (
        <Layout>
            <section className="min-h-[80vh] flex items-center justify-center py-20 px-4 bg-muted/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl w-full bg-card rounded-3xl shadow-xl p-10 text-center border border-border"
                >
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">👋</span>
                    </div>

                    <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                        Welcome, Educator!
                    </h1>

                    <p className="text-xl text-muted-foreground mb-8">
                        Logged in as: <span className="font-medium text-foreground">{user?.email}</span>
                    </p>

                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 mb-10">
                        <p className="text-foreground font-medium">
                            We're glad to have you on board. For now, this is your home base.
                            Further educator features will be available soon!
                        </p>
                    </div>

                    <Button
                        onClick={() => logout()}
                        variant="outline"
                        className="flex items-center gap-2 mx-auto"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </motion.div>
            </section>
        </Layout>
    );
};

export default EducatorWelcome;
