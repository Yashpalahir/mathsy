import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { toast } from "react-toastify";
import { Loader2, Timer, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const TestInterface = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [test, setTest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const response = await apiClient.getTest(id!);
                if (response.success) {
                    setTest(response.data);
                    setTimeLeft(response.data.duration * 60);
                    // Initialize empty answers
                    setAnswers(response.data.questions.map((_: any, idx: number) => ({
                        questionIndex: idx,
                        selectedAnswer: -1,
                        subjectiveAnswer: ""
                    })));
                }
            } catch (error) {
                toast.error("Failed to load test or you already took it");
                navigate("/student-dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [id, navigate]);

    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const timeTaken = test.duration * 60 - timeLeft;
            await apiClient.submitTest(id!, { answers, timeTaken });
            toast.success("Test submitted successfully!");
            navigate("/student-dashboard");
        } catch (error) {
            toast.error("Failed to submit test");
            setIsSubmitting(false);
        }
    }, [id, answers, test, timeLeft, navigate, isSubmitting]);

    useEffect(() => {
        if (timeLeft <= 0 && test && !isSubmitting) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, test, handleSubmit, isSubmitting]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!test) return null;

    const currentQuestion = test.questions[currentQuestionIdx];

    const handleAnswerChange = (val: any) => {
        const newAnswers = [...answers];
        if (currentQuestion.type === 'mcq') {
            newAnswers[currentQuestionIdx].selectedAnswer = val;
        } else {
            newAnswers[currentQuestionIdx].subjectiveAnswer = val;
        }
        setAnswers(newAnswers);
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{test.name}</h1>
                    <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full font-mono text-xl text-primary font-bold">
                        <Timer className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr,300px] gap-8">
                    <div className="space-y-6">
                        <Card className="shadow-lg border-2">
                            <CardHeader className="bg-muted/50">
                                <CardTitle className="flex justify-between">
                                    <span>Question {currentQuestionIdx + 1} of {test.questions.length}</span>
                                    <span className="text-sm font-normal text-muted-foreground">{currentQuestion.marks} Marks</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <p className="text-lg font-medium">{currentQuestion.question}</p>

                                    {currentQuestion.image && (
                                        <img src={currentQuestion.image} alt="Question" className="max-h-[300px] rounded-lg mx-auto border" />
                                    )}

                                    {currentQuestion.video && (
                                        <div className="aspect-video">
                                            <iframe
                                                src={currentQuestion.video.replace("watch?v=", "embed/")}
                                                className="w-full h-full rounded-lg"
                                                allowFullScreen
                                            />
                                        </div>
                                    )}

                                    {currentQuestion.type === 'mcq' ? (
                                        <div className="grid gap-3">
                                            {currentQuestion.options.map((opt: any, i: number) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleAnswerChange(i)}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${answers[currentQuestionIdx].selectedAnswer === i
                                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                                        : "border-border hover:border-primary/50"
                                                        }`}
                                                >
                                                    <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">{String.fromCharCode(65 + i)}</span>
                                                    <div className="flex-1 text-left">
                                                        <p>{opt.text}</p>
                                                        {opt.image && <img src={opt.image} alt="Option" className="mt-2 max-h-20 rounded" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="pt-4">
                                            <Label className="mb-2 block">Your Answer</Label>
                                            <Textarea
                                                rows={10}
                                                placeholder="Type your solution here..."
                                                value={answers[currentQuestionIdx].subjectiveAnswer}
                                                onChange={(e) => handleAnswerChange(e.target.value)}
                                                className="text-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between items-center">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIdx === 0}
                            >
                                <ChevronLeft className="mr-2 w-4 h-4" /> Previous
                            </Button>
                            <div className="flex gap-2">
                                {currentQuestionIdx === test.questions.length - 1 ? (
                                    <Button variant="hero" onClick={handleSubmit} disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 w-4 h-4" />}
                                        Submit Test
                                    </Button>
                                ) : (
                                    <Button onClick={() => setCurrentQuestionIdx(prev => Math.min(test.questions.length - 1, prev + 1))}>
                                        Next <ChevronRight className="ml-2 w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-5 gap-2">
                                    {test.questions.map((_: any, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentQuestionIdx(i)}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${currentQuestionIdx === i ? "ring-2 ring-primary ring-offset-2" : ""
                                                } ${answers[i]?.selectedAnswer !== -1 || answers[i]?.subjectiveAnswer !== ""
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TestInterface;
