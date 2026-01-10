import * as pdfjsLib from 'pdfjs-dist';

// Configure worker - using Cloudflare CDN for stability without complex Next.js config
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';

        // Iterate through all pages
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');

            fullText += ` ${pageText}`;
        }

        return fullText.trim();
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('No se pudo leer el PDF. Asegúrate de que no esté encriptado o sea una imagen escaneada.');
    }
}
