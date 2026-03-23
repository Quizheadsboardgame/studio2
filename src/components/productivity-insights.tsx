"use client";

import * as React from "react";
import { Task } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from "recharts";
import { format, subDays } from "date-fns";
import { TrendingUp } from "lucide-react";

interface ProductivityInsightsProps {
  tasks: Task[];
  profiles: string[];
}

const COLORS = [
  '#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
];

export function ProductivityInsights({ tasks, profiles }: ProductivityInsightsProps) {
  const chartData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayStats: any = { name: format(date, 'EEE'), date: dateStr };
      
      profiles.forEach(user => {
        const userTasks = tasks.filter(t => t.owner === user && t.dueDate === dateStr);
        const completed = userTasks.filter(t => t.status === 'Completed').length;
        dayStats[user] = userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0;
      });
      
      return dayStats;
    });
    
    return last7Days;
  }, [tasks, profiles]);

  return (
    <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-slate-500/5 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          7-Day Momentum
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[240px] pt-4 pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {profiles.map((user, idx) => (
                <linearGradient key={user} id={`color${user.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
            />
            <YAxis 
              hide 
              domain={[0, 100]} 
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-[10px] font-bold">
                      <p className="mb-2 opacity-60 uppercase">{label} Completion %</p>
                      {payload.map((entry: any) => (
                        <div key={entry.name} className="flex items-center gap-2 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span>{entry.name}: {entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            {profiles.map((user, idx) => (
              <Area
                key={user}
                type="monotone"
                dataKey={user}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#color${user.replace(/\s+/g, '')})`}
                animationDuration={1500}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
