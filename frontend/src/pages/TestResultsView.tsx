import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { toast } from "react-toastify";
import { Loader2, CheckCircle, XCircle, MessageSquare, BookOpen, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const TestResultsView = () => {
    const { id } = useParams<{ id: string }>();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const response = await apiClient.getTestResult(id!);
                if (response.success) {
                    setResult(response.data);
                }
            } catch (error) {
                toast.error("Failed to load result");
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!result) return <div className="text-center py-20">Result not found.</div>;

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Link to="/student-dashboard" className="flex items-center text-primary mb-6 hover:underline">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card rounded-3xl p-8 shadow-xl border-2 mb-10 text-center"
                >
                    <h1 className="text-3xl font-bold mb-2">{result.test.name} Result</h1>
                    <div className="flex justify-center items-center gap-8 my-8">
                        <div className="text-center">
                            <p className="text-muted-foreground mb-1 uppercase text-xs font-bold tracking-widest">Score</p>
                            <p className="text-5xl font-black text-primary">{result.obtainedMarks}/{result.totalMarks}</p>
                        </div>
                        <div className="h-16 w-[1px] bg-border"></div>
                        <div className="text-center">
                            <p className="text-muted-foreground mb-1 uppercase text-xs font-bold tracking-widest">Status</p>
                            <p className={`text-3xl font-bold ${result.status === 'passed' ? 'text-green-500' : 'text-red-500'}`}>
                                {result.status.toUpperCase()}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <h2 className="text-2xl font-bold mb-6">Question Review</h2>
                <div className="space-y-8">
                    {result.answers.map((ans: any, idx: number) => {
                        const question = result.test.questions[idx];
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <Card className={`border-2 ${ans.isCorrect ? 'border-green-100 bg-green-50/10' : 'border-red-100 bg-red-50/10'}`}>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-lg">Question {idx + 1}</CardTitle>
                                        {ans.isCorrect ? <CheckCircle className="text-green-500 w-6 h-6" /> : <XCircle className="text-red-500 w-6 h-6" />}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-lg font-medium">{question.question}</p>

                                        {question.image && <img src={question.image} alt="Q" className="max-h-60 rounded border" />}

                                        {question.type === 'mcq' ? (
                                            <div className="grid gap-2">
                                                {question.options.map((opt: any, oIdx: number) => {
                                                    let bgColor = "bg-muted/30";
                                                    let borderCol = "border-transparent";
                                                    if (oIdx === question.correctAnswer) {
                                                        bgColor = "bg-green-100 text-green-800";
                                                        borderCol = "border-green-500";
                                                    } else if (oIdx === ans.selectedAnswer && !ans.isCorrect) {
                                                        bgColor = "bg-red-100 text-red-800";
                                                        borderCol = "border-red-500";
                                                    }
                                                    return (
                                                        <div key={oIdx} className={`p-3 rounded-lg border-2 ${borderCol} ${bgColor} flex items-center justify-between`}>
                                                            <div className="flex items-center gap-3">
                                                                <span>{String.fromCharCode(65 + oIdx)}. {opt.text}</span>
                                                                {opt.image && <img src={opt.image} className="h-10 rounded" alt="opt" />}
                                                            </div>
                                                            {oIdx === question.correctAnswer && <CheckCircle className="w-4 h-4" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="bg-muted/20 p-4 rounded-lg border">
                                                <p className="text-sm font-bold text-muted-foreground mb-2">YOUR ANSWER:</p>
                                                <p className="whitespace-pre-wrap">{ans.subjectiveAnswer || "No answer provided"}</p>
                                            </div>
                                        )}

                                        {ans.feedback && (
                                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                                <div className="flex items-center gap-2 text-blue-800 mb-2 font-bold">
                                                    <MessageSquare className="w-5 h-5" /> Gemini AI Feedback
                                                </div>
                                                <p className="text-blue-900 whitespace-pre-wrap">{ans.feedback}</p>
                                            </div>
                                        )}

                                        {ans.explanation && (
                                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                                <div className="flex items-center gap-2 text-amber-800 mb-2 font-bold">
                                                    <BookOpen className="w-5 h-5" /> Solution & Explanation
                                                </div>
                                                <p className="text-amber-900 whitespace-pre-wrap">{ans.explanation}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-12 text-center pb-20">
                    <Button size="lg" asChild>
                        <Link to="/student-dashboard">Return to Dashboard</Link>
                    </Button>
                </div>
            </div >
        </Layout >
    );
};

export default TestResultsView;
