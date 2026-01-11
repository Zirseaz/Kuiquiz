import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const maxDuration = 60;

export interface QuizQuestion {
    question: string;
    options: string[];
    answer: number;
}

// Helper function to extract JSON from text that might have markdown
function extractJSON(text: string): any {
    // Try direct parse first
    try {
        return JSON.parse(text);
    } catch (e) {
        // Try to find JSON in markdown code block
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1].trim());
        }

        // Try to find JSON object pattern
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            return JSON.parse(objectMatch[0]);
        }

        throw new Error('No valid JSON found in response');
    }
}

export async function POST(request: NextRequest) {
    console.log('=== CREATE QUIZ API CALLED ===');

    try {
        const body = await request.json();
        const { text, userId, username } = body;

        console.log('Text length:', text?.length);

        if (!text || text.length < 50) {
            return NextResponse.json(
                { error: 'El texto es muy corto (min 50 caracteres)' },
                { status: 400 }
            );
        }

        const truncatedText = text.slice(0, 12000);

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'DEEPSEEK_API_KEY no configurada' },
                { status: 500 }
            );
        }

        const systemPrompt = `Eres un profesor experto creando quizzes educativos.

INSTRUCCIONES:
1. Lee el texto del usuario
2. Crea exactamente 5 preguntas de opción múltiple
3. Cada pregunta tiene 4 opciones (A, B, C, D)
4. Indica la respuesta correcta como número (0=A, 1=B, 2=C, 3=D)

RESPONDE ÚNICAMENTE con este JSON (sin texto adicional, sin markdown):
{"title":"Título del Quiz","topic":"Tema","description":"Descripción","questions":[{"question":"Pregunta?","options":["A","B","C","D"],"answer":0}]}`;

        console.log('Calling DeepSeek...');
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
                    { role: 'user', content: truncatedText }
                ],
                temperature: 0.2,
                max_tokens: 2500
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek Error:', response.status, errorText);
            return NextResponse.json(
                { error: `DeepSeek error: ${response.status}` },
                { status: 500 }
            );
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        console.log('Raw content from DeepSeek:', content?.substring(0, 200));

        if (!content) {
            return NextResponse.json(
                { error: 'DeepSeek no respondió' },
                { status: 500 }
            );
        }

        // Extract JSON even if wrapped in markdown
        let quizData;
        try {
            quizData = extractJSON(content);
        } catch (parseError: any) {
            console.error('JSON parse failed. Raw content:', content);
            return NextResponse.json(
                { error: 'Formato de respuesta inválido. Intenta con otro texto.' },
                { status: 500 }
            );
        }

        // Validate structure
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            return NextResponse.json(
                { error: 'Quiz sin preguntas generadas' },
                { status: 500 }
            );
        }

        const quizWithMeta = {
            title: quizData.title || 'Quiz sin título',
            topic: quizData.topic || 'General',
            description: quizData.description || '',
            questions: quizData.questions,
            createdAt: new Date().toISOString(),
            creatorId: userId || 'anonymous',
            creatorName: username || 'Anónimo',
        };

        // Save to Firestore
        let quizId = `temp-${Date.now()}`;
        try {
            const docRef = await addDoc(collection(db, 'quizzes'), quizWithMeta);
            quizId = docRef.id;
            console.log('Saved to Firestore:', quizId);
        } catch (e: any) {
            console.error('Firestore error:', e.message);
        }

        console.log('=== SUCCESS ===');
        return NextResponse.json({
            success: true,
            quizId: quizId,
            totalQuestions: quizData.questions.length
        });

    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: error.message || 'Error interno' },
            { status: 500 }
        );
    }
}