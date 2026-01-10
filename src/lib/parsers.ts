import { extractTextFromPDF as pdfParse } from './pdf'; // Reuse existing logic
import mammoth from 'mammoth';

export async function parseFile(file: File): Promise<string> {
    const type = file.type;

    if (type === 'application/pdf') {
        return pdfParse(file);
    }

    if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // .docx
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value.trim();
    }

    if (type === 'text/plain') {
        return await file.text();
    }

    throw new Error('Formato no soportado. Usa PDF, Word (.docx) o TXT.');
}
