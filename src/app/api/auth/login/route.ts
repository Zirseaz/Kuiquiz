import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    stats: {
        gamesPlayed: number;
        totalScore: number;
        bestStreak: number;
    };
}

interface UsersDB {
    users: User[];
}

const USERS_FILE = join(process.cwd(), '.data', 'users.json');

function getUsers(): UsersDB {
    if (!existsSync(USERS_FILE)) {
        return { users: [] };
    }
    return JSON.parse(readFileSync(USERS_FILE, 'utf-8'));
}

// POST - Login user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email y contraseña son requeridos' },
                { status: 400 }
            );
        }

        const db = getUsers();
        const user = db.users.find(
            u => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 401 }
            );
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Contraseña incorrecta' },
                { status: 401 }
            );
        }

        // Return user without password
        const { passwordHash: _, ...safeUser } = user;
        return NextResponse.json({
            success: true,
            user: safeUser,
        });

    } catch (error) {
        console.error('Error logging in:', error);
        return NextResponse.json(
            { error: 'Error al iniciar sesión' },
            { status: 500 }
        );
    }
}
