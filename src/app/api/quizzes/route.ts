import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
    try {
        const quizzesRef = collection(db, 'quizzes');
        // In a real app we might paginate or filter by public=true
        // For now, fetch last 50 quizzes
        const q = query(
            quizzesRef,
            limit(50)
        );

        const querySnapshot = await getDocs(q);
        const quizzes: any[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            quizzes.push({
                id: doc.id,
                ...data
            });
        });

        // Client side sort if needed, or composite index later
        quizzes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ quizzes });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return NextResponse.json({ quizzes: [] });
    }
}
