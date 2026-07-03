import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/context/LanguageContext';
import DebugLogger from '@/components/DebugLogger';
import AIChatAssistant from '@/components/AIChatAssistant';
import { Suspense } from "react";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata = {
  title: "Finco AI | Premium Personal Finance Manager",
  description: "Next-generation AI-driven financial intelligence, behavioral credit scoring, and biometric security.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F172A",
};

import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable} font-sans antialiased transition-colors duration-300`}>
        <Providers>
          <LanguageProvider>
            <Toaster position="top-right" toastOptions={{
              style: {
                background: 'var(--toast-bg, #1e293b)',
                color: 'var(--toast-text, #fff)',
                border: '1px solid rgba(128,128,128,0.1)',
                borderRadius: '1rem',
              }
            }} />
            <Suspense fallback={null}>
              <DebugLogger />
            </Suspense>
            {children}
            <AIChatAssistant />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
