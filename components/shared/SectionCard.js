'use client';

export default function SectionCard({ title, icon: Icon, children, className = "", headerAction }) {
  return (
    <div className={`glass-panel overflow-hidden ${className}`}>
      {title && (
        <div className="p-6 bg-app-bg/10 border-b border-app-border flex justify-between items-center transition-colors">
          <h3 className="font-bold flex items-center gap-2 text-text-main">
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            {title}
          </h3>
          {headerAction}
        </div>
      )}
      <div className={title ? "p-8" : ""}>
        {children}
      </div>
    </div>
  );
}
