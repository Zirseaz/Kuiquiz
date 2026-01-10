export interface QuizQuestion {
    question: string;
    options: string[];
    answer: number;
}

export interface Quiz {
    id?: string;
    questions: QuizQuestion[];
    createdAt: Date;
}

export interface PlayerScore {
    nickname: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeBonus: number;
}
