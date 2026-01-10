import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
        }

        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove clutter
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        $('header').remove();

        // extract main text
        // Try to find main content containers commonly used
        let text = $('article').text() || $('main').text() || $('body').text();

        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();

        // Cap length to avoid token limits
        if (text.length > 50000) {
            text = text.slice(0, 50000);
        }

        if (text.length < 100) {
            return NextResponse.json({ error: 'No se pudo extraer suficiente texto de esta página.' }, { status: 400 });
        }

        return NextResponse.json({ text });

    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({ error: 'Error al leer la página web.' }, { status: 500 });
    }
}
