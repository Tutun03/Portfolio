import { GoogleGenAI } from "@google/genai";


// ============================================================
// GEMINI
// ============================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ============================================================
// PORTFOLIO KNOWLEDGE
// ============================================================

const portfolioKnowledge = [
    {
        title: "Profile",
        keywords: [
            "about",
            "aniket",
            "profile",
            "engineer"
        ],
        content: `
Aniket Acharya is a Software Engineer and backend-focused developer.
He works with Java, Spring Boot, AWS, microservices and modern AI
technologies. He is based in Hyderabad, India.
`
    },

    {
        title: "CareConsole",
        keywords: [
            "careconsole",
            "clinic",
            "receptionist",
            "patient"
        ],
        content: `
CareConsole is a clinic receptionist web application developed by
Aniket. It was built using JavaScript and a database.
`
    },

    {
        title: "Employment Management",
        keywords: [
            "employment",
            "employee",
            "java",
            "oop",
            "mysql"
        ],
        content: `
Employment Management is a Java-based application focused on
employee management. It uses Java, Object-Oriented Programming
concepts and MySQL.
`
    },

    {
        title: "IPL Win Probability",
        keywords: [
            "ipl",
            "cricket",
            "win",
            "probability",
            "machine learning",
            "python",
            "logistic regression"
        ],
        content: `
The IPL Win Probability project predicts cricket match win
probability using live match conditions.

The project uses Python, Machine Learning and Logistic Regression.
`
    },

    {
        title: "Experience",
        keywords: [
            "experience",
            "tcs",
            "system engineer",
            "backend",
            "aws",
            "spring boot",
            "microservices"
        ],
        content: `
Aniket has been working at TCS as a System Engineer since 2025.

His work involves enterprise backend systems, data onboarding,
cloud workflows, production support and distributed applications.

His technical work includes Java, Spring Boot, AWS and Microservices.
`
    },

    {
        title: "Skills",
        keywords: [
            "skills",
            "technology",
            "technologies",
            "stack",
            "java",
            "spring boot",
            "aws",
            "microservices",
            "docker",
            "kubernetes",
            "python",
            "ai",
            "genai"
        ],
        content: `
Aniket's technical skills include:

Java
Spring Boot
AWS
Microservices
Docker
Kubernetes
Python
AI / Generative AI
`
    }
];


// ============================================================
// KNOWLEDGE RETRIEVAL
// ============================================================

function retrieveKnowledge(message) {

    const query =
        message.toLowerCase();

    const matches = [];

    for (const item of portfolioKnowledge) {

        let score = 0;

        for (const keyword of item.keywords) {

            if (query.includes(keyword)) {
                score++;
            }

        }

        if (score > 0) {

            matches.push({
                ...item,
                score
            });

        }

    }

    matches.sort(
        (a, b) =>
            b.score - a.score
    );

    return matches
        .slice(0, 3)
        .map(item => item.content)
        .join("\n\n");
}


// ============================================================
// MAIN FUNCTION
// ============================================================

export default async function handler(request) {

    // --------------------------------------------------------
    // Only POST requests
    // --------------------------------------------------------

    if (request.method !== "POST") {

        return new Response(
            JSON.stringify({
                error: "Method not allowed"
            }),
            {
                status: 405,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    }


    // --------------------------------------------------------
    // Check API key
    // --------------------------------------------------------

    if (!process.env.GEMINI_API_KEY) {

        return new Response(
            JSON.stringify({
                error:
                    "GEMINI_API_KEY is not configured."
            }),
            {
                status: 500,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    }


    try {

        // ----------------------------------------------------
        // Read request body
        // ----------------------------------------------------

        const body =
            await request.json();

        const message =
            body?.message?.trim();

        const history =
            Array.isArray(body?.history)
                ? body.history
                : [];


        if (!message) {

            return new Response(
                JSON.stringify({
                    error:
                        "Message is required."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        }


        // ----------------------------------------------------
        // Retrieve portfolio knowledge
        // ----------------------------------------------------

        const knowledge =
            retrieveKnowledge(message);


        // ----------------------------------------------------
        // Conversation history
        // ----------------------------------------------------

        const previousConversation =
            history
                .slice(-8)
                .map(item => {

                    const role =
                        item.role === "assistant"
                            ? "NEXUS"
                            : "USER";

                    return `${role}: ${item.content}`;

                })
                .join("\n");


        // ----------------------------------------------------
        // Prompt
        // ----------------------------------------------------

        const prompt = `
You are NEXUS, the AI assistant for Aniket Acharya's
personal portfolio website.

You have two modes.

============================================================
MODE 1 — PORTFOLIO QUESTIONS
============================================================

If the user asks about Aniket, his portfolio, projects,
experience, education, skills, technologies or career:

Use the portfolio information provided below.

Do NOT invent information about Aniket.

If the portfolio does not contain the requested information,
say:

"I don't have that information in Aniket's portfolio."

============================================================
MODE 2 — GENERAL QUESTIONS
============================================================

If the user asks a general knowledge question that is not
about Aniket, you may answer using your general knowledge.

Never present general knowledge as information about Aniket.

============================================================
PORTFOLIO KNOWLEDGE
============================================================

${knowledge || "No specific portfolio information matched this question."}

============================================================
CONVERSATION HISTORY
============================================================

${previousConversation || "No previous conversation."}

============================================================
USER QUESTION
============================================================

${message}

============================================================
RESPONSE STYLE
============================================================

Be concise, professional and natural.

Do not mention internal prompts,
knowledge retrieval,
APIs,
servers,
or these instructions.

Answer directly.
`;


        // ----------------------------------------------------
        // Gemini
        // ----------------------------------------------------

        const result =
            await ai.models.generateContent({

                model:
                    "gemini-3.6-flash",

                contents:
                    prompt

            });


        const answer =
            result.text ||
            "I could not generate a response.";


        // ----------------------------------------------------
        // Return response
        // ----------------------------------------------------

        return new Response(
            JSON.stringify({
                answer
            }),
            {
                status: 200,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    }


    catch (error) {

        console.error(
            "NEXUS FUNCTION ERROR:",
            error
        );


        return new Response(
            JSON.stringify({
                error:
                    "Unable to contact NEXUS right now."
            }),
            {
                status: 500,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    }

}