import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

let genAIInstance = null;

const getGenAI = () => {
    console.log("⚙️ [Gemini] Initializing GoogleGenerativeAI…");

    if (!genAIInstance) {
        const apiKey = process.env.GEMINI_API_KEY;

        console.log("🔑 [Gemini] API Key present:", !!apiKey);

        if (!apiKey) {
            console.error("❌ [Gemini] ERROR: GEMINI_API_KEY missing!");
            return null;
        }

        genAIInstance = new GoogleGenerativeAI(apiKey);
        console.log("✅ [Gemini] genAIInstance created.");
    }

    return genAIInstance;
};

// --------------------------------------------------------
//  MCQ + IMAGE EXPLANATION
// --------------------------------------------------------

export const getExplanation = async ({
    question,
    options = [],
    correctAnswer,
    type = "mcq",
    imageUrl = null,
}) => {
    console.log("\n📘 [Explain] FUNCTION CALLED");
    console.log("📝 Question:", question);
    console.log("🔢 Options:", options);
    console.log("✔ Correct Answer:", correctAnswer);
    console.log("🖼 Image URL:", imageUrl);
    console.log("📌 Type:", type);

    try {
        const genAI = getGenAI();
        if (!genAI) {
            console.warn("⚠️ [Explain] genAI is NULL. Returning fallback text.");
            return "Explanation unavailable.";
        }

        console.log("🤖 [Explain] Creating model: gemini-2.5-flash");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
You are a top math teacher. Explain the question step-by-step.

Question:
${question}

Options:
${options.map((o, i) => `${i + 1}. ${o.text}`).join("\n")}

Correct Answer Index: ${correctAnswer}

Give:
- Why the correct answer is correct
- Why other options are wrong
- Step-by-step reasoning
- Clean formatting
- Final answer
`;

        console.log("🧠 [Explain] Prompt Ready:\n", prompt);

        const parts = [{ text: prompt }];

        if (imageUrl) {
            console.log("🖼 [Explain] Adding image to Gemini request");
            parts.push({
                fileData: {
                    mimeType: imageUrl.endsWith(".png") ? "image/png" : "image/jpeg",
                    fileUri: imageUrl,
                },
            });
        }

        console.log("📤 [Explain] Sending request to Gemini…");

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
        });

        console.log("📥 [Explain] Gemini Raw Response:", result);

        const text = result.response.text();
        console.log("📘 [Explain] FINAL EXPLANATION GENERATED:\n", text);

        return text;
    } catch (err) {
        console.error("❌ [Explain] ERROR OCCURRED:", err);
        return "Explanation unavailable.";
    }
};

// --------------------------------------------------------
//  SUBJECTIVE EVALUATION
// --------------------------------------------------------

export const evaluateSubjective = async (question, studentAnswer, imageUrl = null) => {
    console.log("\n🧪 [Subjective] FUNCTION CALLED");
    console.log("📝 Question:", question);
    console.log("✍️ Student Answer:", studentAnswer);
    console.log("🖼 Image URL:", imageUrl);

    try {
        const genAI = getGenAI();
        if (!genAI) {
            console.warn("⚠️ [Subjective] genAI NULL. Returning fallback.");
            return {
                score: 0,
                feedback: "AI unavailable.",
                suggestions: "Review manually.",
            };
        }

        console.log("🤖 [Subjective] Creating model: gemini-2.5-flash");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
Evaluate the student's answer.

Question:
${question}

Student Answer:
${studentAnswer}

Respond ONLY in JSON:
{
  "score": number (0 to 10),
  "feedback": "text",
  "suggestions": "text"
}
`;

        console.log("🧠 [Subjective] Prompt:\n", prompt);

        const parts = [{ text: prompt }];

        if (imageUrl) {
            console.log("� [Subjective] Adding image to Gemini request");
            parts.push({
                fileData: {
                    mimeType: imageUrl.endsWith(".png") ? "image/png" : "image/jpeg",
                    fileUri: imageUrl,
                },
            });
        }

        console.log("�📤 [Subjective] Sending request to Gemini…");
        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
        });

        console.log("📥 [Subjective] Gemini Raw Response:", result);

        let text = result.response.text().trim();
        console.log("📄 [Subjective] Gemini Returned Text:\n", text);

        text = text.replace(/```json|```/g, "").trim();
        console.log("🔧 [Subjective] Cleaned JSON:\n", text);

        const parsed = JSON.parse(text);

        console.log("✅ [Subjective] Parsed JSON:", parsed);

        return parsed;
    } catch (err) {
        console.error("❌ [Subjective] ERROR:", err);
        console.error("🟥 Full Stack Trace:", err.stack);

        return {
            score: 0,
            feedback: "Evaluation failed.",
            suggestions: "Please check manually.",
        };
    }
};
