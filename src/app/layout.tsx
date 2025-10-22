import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Distribuciones Estadísticas",
  description: "Calculadora interactiva de distribuciones estadísticas discretas y continuas con tablas completas y funciones directas e inversas.",
  keywords: ["estadística", "distribuciones", "probabilidad", "calculadora", "matemáticas"],
  authors: [{ name: "Chatbot Estadístico" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Distribuciones Estadísticas",
    description: "Calculadora interactiva de distribuciones estadísticas",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script
          id="MathJax-script"
          strategy="afterInteractive"
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        />
        <Script
          id="MathJax-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.MathJax = {
                tex: {
                  inlineMath: [['$', '$'], ['\\(', '\\)']],
                  displayMath: [['$$', '$$'], ['\\[', '\\]']]
                },
                options: {
                  skipHtmlTags: ['script','noscript','style','textarea','pre','code']
                }
              };
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
