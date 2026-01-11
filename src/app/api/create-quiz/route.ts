import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const maxDuration = 60;

export interface QuizQuestion {
    question: string;
    options: string[];
    answer: number;
}

export interface Quiz {
    id: string;
    title: string;
    topic: string;
    description: string;
    questions: QuizQuestion[];
    createdAt: string;
    creatorId?: string;
    creatorName?: string;
}

export async function POST(request: NextRequest) {
    console.log('=== CREATE QUIZ API CALLED ===');

    try {
        const body = await request.json();
        const { text, userId, username } = body;

        console.log('Text length:', text?.length);
        console.log('UserId:', userId);

        if (!text || text.length < 50) {
            return NextResponse.json(
                { error: 'El texto es muy corto (min 50 caracteres)' },
                { status: 400 }
            );
        }

        const truncatedText = text.slice(0, 15000); // Reduced to speed up

        const apiKey = process.env.DEEPSEEK_API_KEY;
        console.log('API Key exists:', !!apiKey);
        console.log('API Key prefix:', apiKey?.substring(0, 10));

        if (!apiKey) {
            return NextResponse.json(
                { error: 'DEEPSEEK_API_KEY no configurada en Vercel' },
                { status: 500 }
            );
        }

        const systemPrompt = `Eres un experto profesor. Genera un quiz con exactamente 5 preguntas de selección múltiple basado en el texto proporcionado.

Responde SOLO con JSON válido en este formato exacto:
{
    "title": "Título del Quiz",
    "topic": "Tema principal",
    "description": "Descripción breve",
    "questions": [
        {
            "question": "Pregunta 1?",
            "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
            "answer": 0
        }
    ]
}

IMPORTANTE: Solo responde con el JSON, sin texto adicional.`;

        console.log('Calling DeepSeek API...');
        const startTime = Date.now();

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Genera un quiz basado en este texto:\n\n${truncatedText}` }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })
        });

        const elapsed = Date.now() - startTime;
        console.log('DeepSeek response received in', elapsed, 'ms');
        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API Error:', response.status, errorText);
            return NextResponse.json(
                { error: `Error de DeepSeek (${response.status}): ${errorText.substring(0, 100)}` },
                { status: 500 }
            );
        }

        const data = await response.json();
        console.log('DeepSeek response keys:', Object.keys(data));

        const content = data.choices?.[0]?.message?.content;
        console.log('Content received, length:', content?.length);

        if (!content) {
            console.error('No content in response:', JSON.stringify(data));
            return NextResponse.json(
                { error: 'DeepSeek no generó contenido' },
                { status: 500 }
            );
        }

        // Parse the quiz JSON
        let quizData;
        try {
            quizData = JSON.parse(content);
        } catch (parseError) {
            console.error('Failed to parse quiz JSON:', content);
            return NextResponse.json(
                { error: 'La IA generó una respuesta inválida. Intenta de nuevo.' },
                { status: 500 }
            );
        }

        if (!quizData.questions || !Array.isArray(quizData.questions)) {
            console.error('Invalid quiz structure:', quizData);
            return NextResponse.json(
                { error: 'Quiz inválido generado' },
                { status: 500 }
            );
        }

        const quizWithMeta = {
            ...quizData,
            createdAt: new Date().toISOString(),
            creatorId: userId || 'anonymous',
            creatorName: username || 'Anónimo',
        };

        // Try to save to Firestore
        let quizId = `temp-${Date.now()}`;
        try {
            const docRef = await addDoc(collection(db, 'quizzes'), quizWithMeta);
            quizId = docRef.id;
            console.log('Quiz saved to Firestore:', quizId);
        } catch (firestoreError: any) {
            console.error('Firestore save failed:', firestoreError.message);
            // Continue anyway with temp ID
        }

        console.log('=== QUIZ CREATED SUCCESSFULLY ===');
        return NextResponse.json({
            success: true,
            quizId: quizId,
            totalQuestions: quizData.questions.length
        });

    } catch (error: any) {
        console.error('=== QUIZ CREATION ERROR ===', error);
        return NextResponse.json(
            { error: error.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}