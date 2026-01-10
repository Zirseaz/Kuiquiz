import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

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

function ensureDataDir() {
    const dataDir = join(process.cwd(), '.data');
    if (!existsSync(dataDir)) {
        mkdirSync(dataDir, { recursive: true });
    }
}

function getUsers(): UsersDB {
    ensureDataDir();
    if (!existsSync(USERS_FILE)) {
        return { users: [] };
    }
    return JSON.parse(readFileSync(USERS_FILE, 'utf-8'));
}

function saveUsers(db: UsersDB): void {
    ensureDataDir();
    writeFileSync(USERS_FILE, JSON.stringify(db, null, 2));
}

// POST - Register new user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, email, password } = body;

        // Validate input
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: 'Todos los campos son requeridos' },
                { status: 400 }
            );
        }

        if (username.length < 3 || username.length > 15) {
            return NextResponse.json(
                { error: 'El nombre debe tener entre 3 y 15 caracteres' },
                { status: 400 }
            );
        }

        if (password.length < 4) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 4 caracteres' },
                { status: 400 }
            );
        }

        // Check if user/email already exists
        const db = getUsers();
        const existingUser = db.users.find(
            u => u.username.toLowerCase() === username.toLowerCase() ||
                u.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
            return NextResponse.json(
                { error: 'El usuario o email ya existe' },
                { status: 409 }
            );
        }

        // Hash password and create user
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser: User = {
            id: randomUUID(),
            username,
            email: email.toLowerCase(),
            passwordHash,
            createdAt: new Date().toISOString(),
            stats: {
                gamesPlayed: 0,
                totalScore: 0,
                bestStreak: 0,
            },
        };

        db.users.push(newUser);
        saveUsers(db);

        // Return user without password
        const { passwordHash: _, ...safeUser } = newUser;
        return NextResponse.json({
            success: true,
            user: safeUser,
        });

    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json(
            { error: 'Error al registrar usuario' },
            { status: 500 }
        );
    }
}
