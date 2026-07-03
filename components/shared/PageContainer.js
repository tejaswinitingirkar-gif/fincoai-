'use client';

export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`space-y-12 animate-enter ${className}`}>
      {children}
    </div>
  );
}
