import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Quiz {
    id: string;
    creatorId?: string;
    creatorName?: string;
    questions: any[];
    createdAt: string;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        // Query Firestore for quizzes created by this user
        const quizzesRef = collection(db, 'quizzes');

        // Note: Composite index might be needed for 'creatorId' + 'createdAt'
        // For now, sorting client-side or simple query to avoid deployment blocking
        const q = query(
            quizzesRef,
            where('creatorId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const quizzes: Quiz[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as Omit<Quiz, 'id'>;
            quizzes.push({
                id: doc.id,
                ...data
            });
        });

        // Sort by newest first (doing it in memory to avoid index requirement errors during demo)
        quizzes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ quizzes });
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        return NextResponse.json({ quizzes: [] });
    }
}
