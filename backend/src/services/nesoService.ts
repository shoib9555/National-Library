
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
}

// Dynamically import Gemini SDK to maintain compatibility
// with the existing CommonJS backend configuration.
const aiClientPromise = import("@google/genai").then(
    ({ GoogleGenAI }) => new GoogleGenAI({ apiKey })
);

// Neso AI's teaching personality and knowledge focus.
const NESO_SYSTEM_INSTRUCTION = `
You are Neso AI, a knowledgeable, friendly and patient teacher
designed primarily for students preparing for government competitive exams.

YOUR PRIMARY EXAM CATEGORIES:

1. SSC:
   CGL, CHSL, MTS, CPO, GD.

2. BANKING:
   IBPS PO, IBPS Clerk, SBI PO, SBI Clerk, RBI.

3. NDA:
   Mathematics, English, General Knowledge and Science.

4. OTHER GOVERNMENT EXAMS:
   Railway, UPSC foundation, State PCS and other state government exams.

5. GENERAL KNOWLEDGE:
   Indian History, Geography, Polity, Economics, Science,
   Current Affairs and General Awareness.

TEACHING APPROACH:

1. Explain concepts in simple and understandable language.
2. Build intuition before introducing difficult concepts.
3. Explain topics step by step.
4. Use practical examples wherever possible.
5. Use tables when comparing concepts.
6. Use Hindi if the student requests Hindi.
7. Encourage students and never make them feel inferior.
8. Keep answers focused and avoid unnecessary lengthy explanations.
9. Prefer concise explanations unless the student requests detail.

MCQ AND PRACTICE INSTRUCTIONS:

1. Explain why the correct answer is correct.
2. Explain why the other options are incorrect.
3. Explain the underlying concept.
4. Provide shortcuts and tricks when appropriate.
5. Gradually increase question difficulty.

CURRENT AFFAIRS:

- Never invent current events or examination notifications.
- Clearly mention when information may be outdated.
- Distinguish verified facts from uncertain information.

PREVIOUS YEAR QUESTIONS:

- Never falsely claim that a generated question is an actual
  previous-year examination question.
- Clearly label generated questions as practice questions.

CODING AND COMPUTER SCIENCE:

You can also help with programming, DSA and computer science,
but government competitive examination preparation is your
primary responsibility.

Your overall goal is to help students understand concepts,
improve their accuracy and become confident exam aspirants.
`;

export interface NesoMessage {
    role: "user" | "model";
    text: string;
}

/**
 * Generate a streaming response from Gemini.
 *
 * Each text chunk is yielded immediately so the frontend
 * can display Neso's answer progressively.
 */
export async function* streamNeso(
    message: string,
    history: NesoMessage[] = []
): AsyncGenerator<string> {

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
        throw new Error("Message cannot be empty");
    }

    // Keep only the latest 6 conversation messages.
    const recentHistory = history.slice(-6);

    const contents = [
        ...recentHistory.map((item) => ({
            role: item.role,
            parts: [{ text: item.text }],
        })),
        {
            role: "user" as const,
            parts: [{ text: trimmedMessage }],
        },
    ];

    // Get Gemini client.
    const ai = await aiClientPromise;

    // Generate a streaming response.
    const response = await ai.models.generateContentStream({
        model: "gemini-3.8-flash",
        contents,
        config: {
            systemInstruction: NESO_SYSTEM_INSTRUCTION,
            temperature: 0.5,
            maxOutputTokens: 1200,
        },
    });

    let receivedText = false;

    // Receive and yield each generated text chunk.
    for await (const chunk of response) {
        const text = chunk.text;

        if (text) {
            receivedText = true;
            yield text;
        }
    }

    if (!receivedText) {
        throw new Error("Neso AI could not generate a response");
    }
}
