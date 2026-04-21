const express = require('express');
const router = express.Router();

let openai;

router.post('/', async (req, res) => {
    try {
        const { message, language } = req.body;
        
        const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey === 'your_openai_api_key_here') {
            // Fallback response if no API key is provided
            return res.json({
                success: true,
                reply: `(AI Mode Offline) Aapne kaha: "${message}". Kripya asli AI jawaab ke liye API key \`.env\` file mein daalein.`,
                note: "Using offline fallback"
            });
        }

        if(!openai) {
            const { OpenAI } = require('openai');
            openai = new OpenAI({ 
                apiKey: apiKey,
                baseURL: "https://api.groq.com/openai/v1"
            });
        }

        const systemPrompt = `You are "NyayaSathi", a friendly rural legal assistant for citizens in India.
Your goal is to help citizens understand their legal rights, access govt schemes, and get legal guidance in simple, non-technical language.
Current user preferred language: ${language || 'Hinglish / Hindi'}.
Important: Provide a disclaimer that you are an AI assistant and not a professional lawyer if asked complex legal questions.
Keep answers concise, actionable, and culturally relevant. Use emojis sparingly but effectively.
`;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "llama-3.1-8b-instant", // Active Groq model
        });

        res.json({
            success: true,
            reply: completion.choices[0].message.content
        });

    } catch (err) {
        console.error('Chatbot API Error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to generate response. Please try again later.' });
    }
});

module.exports = router;
