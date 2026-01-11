import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

// GET - List all authorized teacher emails
export async function GET() {
    try {
        const teachersRef = collection(db, 'authorized_teachers');
        const snapshot = await getDocs(teachersRef);

        const teachers = snapshot.docs.map(doc => ({
            id: doc.id,
            email: doc.data().email,
            addedAt: doc.data().addedAt,
            addedBy: doc.data().addedBy
        }));

        return NextResponse.json({ teachers });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        return NextResponse.json({ teachers: [] });
    }
}

// POST - Add a new authorized teacher email
export async function POST(request: NextRequest) {
    try {
        const { email, addedBy } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
        }

        // Check if already exists
        const teachersRef = collection(db, 'authorized_teachers');
        const q = query(teachersRef, where('email', '==', email.toLowerCase()));
        const existing = await getDocs(q);

        if (!existing.empty) {
            return NextResponse.json({ error: 'Este email ya está autorizado' }, { status: 400 });
        }

        // Add new teacher
        const docRef = await addDoc(teachersRef, {
            email: email.toLowerCase(),
            addedAt: new Date().toISOString(),
            addedBy: addedBy || 'system'
        });

        return NextResponse.json({
            success: true,
            id: docRef.id,
            email: email.toLowerCase()
        });
    } catch (error) {
        console.error('Error adding teacher:', error);
        return NextResponse.json({ error: 'Error al agregar profesor' }, { status: 500 });
    }
}

// DELETE - Remove an authorized teacher email
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
        }

        await deleteDoc(doc(db, 'authorized_teachers', id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing teacher:', error);
        return NextResponse.json({ error: 'Error al eliminar profesor' }, { status: 500 });
    }
}
