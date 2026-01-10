import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KuiQuizz - Crea Quiz con IA",
  description: "Transforma cualquier texto en un quiz interactivo y gamificado. ¡Aprende jugando!",
  keywords: ["quiz", "educación", "IA", "gamificación", "aprendizaje", "kahoot alternativa"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#020617" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className={`${inter.variable} antialiased bg-slate-950 text-white`}>
        {children}
      </body>
    </html>
  );
}
