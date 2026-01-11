import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getExplanation = async (question, options, correctAnswer, type = 'mcq') => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = "";
        if (type === 'mcq') {
            const optionsText = options.map((opt, i) => `${i}: ${opt.text}`).join(', ');
            prompt = `Question: ${question}\nOptions: ${optionsText}\nCorrect Answer Index: ${correctAnswer}\nProvide a concise and clear explanation why this answer is correct and others are wrong.`;
        } else {
            prompt = `Question: ${question}\nProvide a comprehensive solution or explanation for this question.`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Explanation Error:", error);
        return "Explanation currently unavailable.";
    }
};

export const evaluateSubjective = async (question, studentAnswer) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Question: ${question}
      Student's Answer: ${studentAnswer}
      
      Evaluate the student's answer and provide:
      1. A score out of 10.
      2. Constructive feedback on what was good.
      3. Suggestions on how to improve the answer.
      
      Format the response as JSON:
      {
        "score": number,
        "feedback": "...",
        "suggestions": "..."
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean JSON response if Gemini adds markdown code blocks
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Evaluation Error:", error);
        return {
            score: 0,
            feedback: "Answer recorded. AI evaluation failed.",
            suggestions: "Review the standard solution."
        };
    }
};
