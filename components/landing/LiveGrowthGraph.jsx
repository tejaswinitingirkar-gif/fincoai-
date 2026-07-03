'use client';

import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const data = [
  { val: 10 }, { val: 15 }, { val: 12 }, { val: 20 }, 
  { val: 18 }, { val: 30 }, { val: 25 }, { val: 45 },
  { val: 40 }, { val: 60 }, { val: 55 }, { val: 80 }
];

/**
 * Live Growth Graph
 * - Represents "upward growth"
 * - Animates on load
 * - Subtle and professional
 */
export default function LiveGrowthGraph() {
  return (
    <div className="w-full h-full relative group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="val" 
            stroke="#4F46E5" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#growthGrad)" 
            animationDuration={4000}
            animationBegin={500}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Pulse effect on latest data point */}
      <motion.div
        animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] right-[2%] w-4 h-4 bg-primary rounded-full blur-[2px]"
      />
    </div>
  );
}
