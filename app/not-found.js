'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-app-bg text-text-main flex items-center justify-center p-8 relative overflow-hidden transition-colors duration-500">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-10 relative z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-error/10 border border-error/20 rounded-3xl flex items-center justify-center mx-auto text-error shadow-2xl shadow-error/10"
        >
          <ShieldAlert className="w-12 h-12" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black text-text-main tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold text-text-muted">Lost in the Network</h2>
          <p className="text-text-dim leading-relaxed">
            The page you&apos;re looking for has been moved or doesn&apos;t exist in our financial grid.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/dashboard" className="btn-primary flex-1 py-4">
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary flex-1 py-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <p className="text-[10px] text-text-dim font-black uppercase tracking-[0.4em]">Finco Security Node v2.4</p>
      </div>
    </div>
  );
}
