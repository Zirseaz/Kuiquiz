import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const maxDuration = 60;

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export interface QuizQuestion {
    question: string;
    options: string[];
    answer: number;
}

export interface Quiz {
    id: string; // Will now be Firestore ID
    title: string;
    topic: string;
    description: string;
    questions: QuizQuestion[];
    createdAt: string;
    creatorId?: string;
    creatorName?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, userId, username } = body;

        if (!text || text.length < 50) {
            return NextResponse.json(
                { error: 'El texto es muy corto (min 50 caracteres)' },
                { status: 400 }
            );
        }

        const truncatedText = text.slice(0, 50000);

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Eres un experto profesor que crea quizzes de alta calidad. Tu trabajo es leer un texto proporcionado y generar 5 preguntas de selección múltiple (4 opciones cada una) que evalúen la comprensión de los conceptos clave.
                    
Reglas:
1. Genera SIEMPRE 5 preguntas.
2. Las preguntas deben ser desafiantes pero justas.
3. Incluye 4 opciones para cada pregunta.
4. La respuesta correcta debe ser el índice (0, 1, 2, o 3).
5. Devuelve SOLO un objeto JSON válido con la siguiente estructura:
{
    "title": "Un título corto y atractivo para el quiz",
    "topic": "El tema principal del texto",
    "description": "Una breve descripción de lo que cubre el quiz",
    "questions": [
        {
            "question": "¿Cuál es la capital de Francia?",
            "options": ["Londres", "Berlín", "París", "Madrid"],
            "answer": 2
        }
    ]
}
NO incluyas explicaciones, ni markdown, ni código extra. Solo el JSON puro.`
                },
                {
                    role: 'user',
                    content: `Genera un quiz basado en este texto:\n\n${truncatedText}`
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('No se generó contenido');

        const quizData = JSON.parse(content);

        // Add metadata
        const quizWithMeta = {
            ...quizData,
            createdAt: new Date().toISOString(),
            creatorId: userId || 'anonymous',
            creatorName: username || 'Anónimo',
        };

        // Save to Firestore
        const docRef = await addDoc(collection(db, 'quizzes'), quizWithMeta);

        return NextResponse.json({
            success: true,
            quizId: docRef.id,
            totalQuestions: quizData.questions.length
        });

    } catch (error) {
        console.error('Error creating quiz:', error);
        return NextResponse.json(
            { error: 'Error generando el quiz. Intenta de nuevo.' },
            { status: 500 }
        );
    }
}
