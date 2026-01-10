import { NextResponse } from 'next/server';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QUIZZES_DIR = join(process.cwd(), '.quizzes');

export async function GET() {
    try {
        if (!existsSync(QUIZZES_DIR)) {
            return NextResponse.json({ message: 'No local quizzes folder found' });
        }

        const files = readdirSync(QUIZZES_DIR);
        let migratedCount = 0;
        let errors = [];

        for (const file of files) {
            if (!file.endsWith('.json')) continue;

            try {
                const filePath = join(QUIZZES_DIR, file);
                const content = readFileSync(filePath, 'utf-8');
                const quiz = JSON.parse(content);
                const quizId = quiz.id; // Use existing ID

                // Check if already exists in Firestore specifically to avoid overwriting if newer? 
                // Actually, just overwrite/set for migration is safer to ensure consistency.
                const docRef = doc(db, 'quizzes', quizId);

                // Optional: Check existence
                // const docSnap = await getDoc(docRef);
                // if (docSnap.exists()) continue; 

                await setDoc(docRef, quiz);
                migratedCount++;

            } catch (err: any) {
                console.error(`Error migrating ${file}:`, err);
                errors.push({ file, error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            migrated: migratedCount,
            totalFiles: files.length,
            errors
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
