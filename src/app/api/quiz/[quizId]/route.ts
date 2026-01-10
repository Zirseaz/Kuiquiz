import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        const { quizId } = await params;

        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        const quizData = docSnap.data();

        // Ensure ID is included in response
        return NextResponse.json({
            id: docSnap.id,
            ...quizData
        });

    } catch (error) {
        console.error('Error fetching quiz:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quiz' },
            { status: 500 }
        );
    }
}
