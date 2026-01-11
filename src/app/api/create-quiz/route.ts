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
    try {
        const body = await request.json();
        const { text, userId, username } = body;

        if (!text || text.length < 50) {
            return NextResponse.json(
                { error: 'El texto es muy corto (min 50 caracteres)' },
                { status: 400 }
            );
        }

        const truncatedText = text.slice(0, 30000);

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            console.error('DEEPSEEK_API_KEY not configured');
            return NextResponse.json(
                { error: 'API no configurada. Contacta al administrador.' },
                { status: 500 }
            );
        }

        const systemPrompt = `Eres un experto profesor que crea quizzes de alta calidad. Tu trabajo es leer un texto proporcionado y generar 5 preguntas de selección múltiple (4 opciones cada una) que evalúen la comprensión de los conceptos clave.

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
NO incluyas explicaciones, ni markdown, ni código extra. Solo el JSON puro.`;

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
                temperature: 0.5,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API Error:', errorText);
            return NextResponse.json(
                { error: 'Error con la IA. Verifica tu API key o intenta de nuevo.' },
                { status: 500 }
            );
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('No se generó contenido');
        }

        const quizData = JSON.parse(content);

        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            throw new Error('Quiz inválido generado');
        }

        const quizWithMeta = {
            ...quizData,
            createdAt: new Date().toISOString(),
            creatorId: userId || 'anonymous',
            creatorName: username || 'Anónimo',
        };

        // Try to save to Firestore, but don't fail if it doesn't work
        let quizId = `temp-${Date.now()}`;
        try {
            const docRef = await addDoc(collection(db, 'quizzes'), quizWithMeta);
            quizId = docRef.id;
        } catch (firestoreError) {
            console.error('Firestore save failed (continuing anyway):', firestoreError);
            // Quiz was generated successfully, just couldn't save
        }

        return NextResponse.json({
            success: true,
            quizId: quizId,
            totalQuestions: quizData.questions.length
        });

    } catch (error: any) {
        console.error('Error creating quiz:', error);
        return NextResponse.json(
            { error: error.message || 'Error generando el quiz. Intenta de nuevo.' },
            { status: 500 }
        );
    }
}