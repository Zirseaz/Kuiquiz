import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LeaderboardEntry {
    nickname: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeBonus: number;
    maxStreak: number;
    timestamp: string;
    responses?: { questionIndex: number; isCorrect: boolean; timeSpent: number }[];
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        const { quizId } = await params;

        // Reference to the leaderboard subcollection
        const leaderboardRef = collection(db, 'quizzes', quizId, 'leaderboard');
        const snapshot = await getDocs(leaderboardRef);

        const leaderboard: LeaderboardEntry[] = [];
        snapshot.forEach(doc => {
            leaderboard.push(doc.data() as LeaderboardEntry);
        });

        // Sort by score desc, then timeBonus desc
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.timeBonus - a.timeBonus;
        });

        return NextResponse.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        const { quizId } = await params;
        const body = await request.json();
        const {
            nickname,
            score,
            correctAnswers,
            totalQuestions,
            timeBonus,
            maxStreak,
            responses
        } = body;

        const newEntry: LeaderboardEntry = {
            nickname,
            score,
            correctAnswers,
            totalQuestions,
            timeBonus,
            maxStreak,
            timestamp: new Date().toISOString(),
            responses // Store detailed responses
        };

        // Save to Firestore subcollection
        const leaderboardRef = collection(db, 'quizzes', quizId, 'leaderboard');
        await addDoc(leaderboardRef, newEntry);

        // Calculate rank
        const snapshot = await getDocs(leaderboardRef);
        const entries: LeaderboardEntry[] = [];
        snapshot.forEach(doc => entries.push(doc.data() as LeaderboardEntry));

        entries.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.timeBonus - a.timeBonus;
        });

        const rank = entries.findIndex(e => e.nickname === nickname && e.score === score && e.timestamp === newEntry.timestamp) + 1;

        return NextResponse.json({
            success: true,
            rank: rank > 0 ? rank : entries.length
        });

    } catch (error) {
        console.error('Error saving score:', error);
        return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
    }
}
