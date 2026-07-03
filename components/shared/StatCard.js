'use client';

export default function StatCard({ label, value, icon: Icon, color = "text-white", subValue }) {
  return (
    <div className="glass-panel p-6 border-white/5">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">{label}</span>
        {Icon && <Icon className={`w-5 h-5 ${color} opacity-50`} />}
      </div>
      <div className="space-y-1">
        <p className={`text-2xl font-black ${color}`}>{value}</p>
        {subValue && <p className="text-xs text-slate-400">{subValue}</p>}
      </div>
    </div>
  );
}
