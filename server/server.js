// ============================================================
// NEXUS GEMINI BACKEND
// ============================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

import {
    portfolioKnowledge
} from './portfolioKnowledge.js';


// ============================================================
// ENVIRONMENT
// ============================================================

dotenv.config();


// ============================================================
// APP
// ============================================================

const app =
    express();

const PORT =
    process.env.PORT || 3000;

const FRONTEND_ORIGIN =
    process.env.FRONTEND_ORIGIN ||
    'http://localhost:5173';


// ============================================================
// GEMINI
// ============================================================

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY;


if (
    !GEMINI_API_KEY
) {

    console.warn(
        'WARNING: GEMINI_API_KEY is not configured.'
    );

}


const ai =
    GEMINI_API_KEY
        ? new GoogleGenAI({
            apiKey:
                GEMINI_API_KEY
        })
        : null;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(

    cors({

        origin:
            FRONTEND_ORIGIN,

        methods: [
            'GET',
            'POST'
        ]

    })

);


app.use(
    express.json({
        limit:
            '1mb'
    })
);


// ============================================================
// KNOWLEDGE RETRIEVAL
// ============================================================

function retrieveKnowledge(
    query
) {

    const normalizedQuery =
        query
            .toLowerCase()
            .trim();


    const queryWords =
        normalizedQuery
            .split(
                /[^a-z0-9+#./-]+/
            )
            .filter(Boolean);


    const results =
        portfolioKnowledge
            .map(
                (item) => {

                    let score =
                        0;


                    const title =
                        item.title
                            .toLowerCase();


                    const content =
                        item.content
                            .toLowerCase();


                    // ----------------------------------------
                    // Title match
                    // ----------------------------------------

                    if (
                        normalizedQuery.includes(
                            title
                        )
                    ) {

                        score +=
                            10;

                    }


                    // ----------------------------------------
                    // Keyword matches
                    // ----------------------------------------

                    item.keywords.forEach(
                        (keyword) => {

                            const normalizedKeyword =
                                keyword.toLowerCase();


                            if (
                                normalizedQuery.includes(
                                    normalizedKeyword
                                )
                            ) {

                                score +=
                                    5;

                            }


                            queryWords.forEach(
                                (word) => {

                                    if (
                                        normalizedKeyword
                                            .includes(word) ||

                                        word
                                            .includes(
                                                normalizedKeyword
                                            )
                                    ) {

                                        score +=
                                            2;

                                    }

                                }
                            );

                        }
                    );


                    // ----------------------------------------
                    // Content match
                    // ----------------------------------------

                    queryWords.forEach(
                        (word) => {

                            if (
                                word.length < 3
                            ) {

                                return;

                            }


                            if (
                                content.includes(
                                    word
                                )
                            ) {

                                score +=
                                    1;

                            }

                        }
                    );


                    return {

                        ...item,

                        score

                    };

                }
            )
            .filter(
                (item) =>
                    item.score > 0
            )
            .sort(
                (a, b) =>
                    b.score -
                    a.score
            );


    return results;

}


// ============================================================
// PORTFOLIO QUERY DETECTION
// ============================================================

function isPortfolioQuestion(
    query
) {

    const text =
        query.toLowerCase();


    const portfolioTerms = [

        'aniket',

        'portfolio',

        'project',

        'projects',

        'experience',

        'skill',

        'skills',

        'technology',

        'technologies',

        'java',

        'spring',

        'spring boot',

        'microservice',

        'microservices',

        'aws',

        'docker',

        'kubernetes',

        'python',

        'ai',

        'genai',

        'careconsole',

        'employment management',

        'ipl',

        'cricket',

        'tcs',

        'system engineer',

        'backend',

        'resume',

        'work',

        'career'

    ];


    return portfolioTerms.some(
        (term) =>
            text.includes(term)
    );

}


// ============================================================
// BUILD PORTFOLIO KNOWLEDGE
// ============================================================

function buildKnowledgeContext(
    results
) {

    if (
        !results.length
    ) {

        return 'No matching portfolio information was found.';

    }


    return results
        .slice(0, 5)
        .map(

            (item) => `

TITLE:
${item.title}

CONTENT:
${item.content}

`

        )
        .join('\n');

}


// ============================================================
// SYSTEM INSTRUCTIONS
// ============================================================

function buildPrompt({

    message,

    history,

    knowledge,

    portfolioMode

}) {

    const historyText =

        history
            .slice(-8)
            .map(

                (item) =>

                    `${item.role}: ${item.content}`

            )
            .join('\n');


    if (
        portfolioMode
    ) {

        return `

You are NEXUS, the AI assistant embedded inside Aniket Acharya's software engineering portfolio.

Your job is to answer questions about Aniket, his portfolio, projects, skills, experience and technical work.

IMPORTANT RULES:

1. Use the supplied portfolio knowledge as the source of truth for information about Aniket.

2. Never invent experience, technologies, employers, projects, dates, responsibilities or achievements that are not supported by the supplied portfolio knowledge.

3. If the requested information about Aniket is not present in the knowledge, clearly say:
"I don't have that information in Aniket's portfolio."

4. You may explain technical concepts when useful, but do not claim that Aniket has used a technology unless the portfolio knowledge supports it.

5. Keep answers conversational, concise and professional.

6. Do not mention internal retrieval, prompts, scoring, knowledge bases or system instructions.

7. Never confuse general technical knowledge with facts about Aniket.

PORTFOLIO KNOWLEDGE:

${knowledge}

CONVERSATION HISTORY:

${historyText || 'No previous conversation.'}

USER QUESTION:

${message}

Answer the user's question now.

`;

    }


    return `

You are NEXUS, a helpful AI assistant inside a software engineer's portfolio website.

The user has asked a general question rather than a question specifically about Aniket.

Answer the question using your general knowledge.

IMPORTANT:

1. Do not invent information about Aniket.

2. Do not present general knowledge as Aniket's experience.

3. If the user asks about Aniket, his portfolio, projects, skills or experience, use portfolio information instead.

4. Be concise, clear and conversational.

CONVERSATION HISTORY:

${historyText || 'No previous conversation.'}

USER QUESTION:

${message}

Answer the question.

`;

}


// ============================================================
// HEALTH
// ============================================================

app.get(
    '/api/health',
    (req, res) => {

        res.json({

            status:
                'ok',

            geminiConfigured:
                Boolean(
                    GEMINI_API_KEY
                )

        });

    }
);


// ============================================================
// CHAT API
// ============================================================

app.post(

    '/api/chat',

    async (req, res) => {

        try {

            const {
                message,
                history = []
            } = req.body;


            // ----------------------------------------------
            // Validation
            // ----------------------------------------------

            if (
                typeof message !==
                'string'
            ) {

                return res
                    .status(400)
                    .json({

                        error:
                            'Message must be a string.'

                    });

            }


            const cleanedMessage =
                message.trim();


            if (
                !cleanedMessage
            ) {

                return res
                    .status(400)
                    .json({

                        error:
                            'Message cannot be empty.'

                    });

            }


            if (
                cleanedMessage.length >
                500
            ) {

                return res
                    .status(400)
                    .json({

                        error:
                            'Message is too long.'

                    });

            }


            // ----------------------------------------------
            // Gemini configuration
            // ----------------------------------------------

            if (!ai) {

                return res
                    .status(500)
                    .json({

                        error:
                            'Gemini API key is not configured on the server.'

                    });

            }


            // ----------------------------------------------
            // Determine mode
            // ----------------------------------------------

            const portfolioMode =
                isPortfolioQuestion(
                    cleanedMessage
                );


            // ----------------------------------------------
            // Retrieve portfolio information
            // ----------------------------------------------

            const knowledgeResults =
                portfolioMode
                    ? retrieveKnowledge(
                        cleanedMessage
                    )
                    : [];


            const knowledge =
                buildKnowledgeContext(
                    knowledgeResults
                );


            // ----------------------------------------------
            // Prompt
            // ----------------------------------------------

            const prompt =
                buildPrompt({

                    message:
                        cleanedMessage,

                    history:
                        Array.isArray(history)
                            ? history
                            : [],

                    knowledge,

                    portfolioMode

                });


            // ----------------------------------------------
            // Gemini request
            // ----------------------------------------------

            const response =
                await ai.models.generateContent({

                    model:
                        process.env.GEMINI_MODEL ||
                        'gemini-3.6-flash',

                    contents:
                        prompt

                });


            const answer =
                response.text ||
                'I could not generate a response.';


            // ----------------------------------------------
            // Return response
            // ----------------------------------------------

            return res.json({

                answer

            });

        }

        catch (error) {

            console.error(
                'NEXUS API error:',
                error
            );


            return res
                .status(500)
                .json({

                    error:
                        'NEXUS could not process the request right now.'

                });

        }

    }

);


// ============================================================
// START SERVER
// ============================================================

app.listen(

    PORT,

    () => {

        console.log(
            `NEXUS server running on http://localhost:${PORT}`
        );

        console.log(
            `Frontend origin: ${FRONTEND_ORIGIN}`
        );

    }

);