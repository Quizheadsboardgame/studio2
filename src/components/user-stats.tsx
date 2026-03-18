"use client";

import * as React from "react";
import { TaskUser, USER_OPTIONS } from "@/types/task";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStatsProps {
  activeUser: TaskUser;
  streaks: Record<string, number>;
  progress: Record<string, { completed: number, total: number, percentage: number, remaining: number }>;
}

const USER_COLORS = {
  'Owen': {
    bg: 'bg-blue-900',
    text: 'text-blue-900',
    border: 'border-blue-200',
    shadow: 'shadow-blue-900/10',
    ring: 'ring-blue-300',
    soft: 'bg-blue-50 dark:bg-blue-950/40'
  },
  'Lucy': {
    bg: 'bg-emerald-900',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    shadow: 'shadow-emerald-900/10',
    ring: 'ring-emerald-300',
    soft: 'bg-emerald-50 dark:bg-emerald-950/40'
  }
};

export function UserStats({ activeUser, streaks, progress }: UserStatsProps) {
  const activeStats = progress[activeUser] || { completed: 0, total: 0, percentage: 100, remaining: 0 };
  const activeUserTheme = USER_COLORS[activeUser];

  const encouragingWords = React.useMemo(() => {
    if (activeStats.total === 0) return "No tasks scheduled for today. Enjoy the clean slate!";
    if (activeStats.percentage === 0) return "Let's kick things off! You've got this.";
    if (activeStats.percentage < 40) return "Great start! Every small step counts.";
    if (activeStats.percentage < 70) return "Over the hump! Keep that momentum building.";
    if (activeStats.percentage < 100) return "Almost at the finish line! Stay focused.";
    return "Legendary status! You've actioned everything for today!";
  }, [activeStats]);

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <Card className={cn(
        "overflow-hidden border-2 shadow-xl transition-all duration-500",
        activeUserTheme.border,
        activeUserTheme.shadow,
        "dark:border-slate-800 bg-white dark:bg-slate-900"
      )}>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-start gap-6">
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner",
                activeUserTheme.soft
              )}>
                <Flame className={cn("h-10 w-10", activeUserTheme.text, activeStats.percentage === 100 && activeStats.total > 0 && "animate-pulse")} />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  {activeUser}'s Daily Progress
                  {streaks[activeUser] > 0 && (
                    <span className="flex items-center gap-1.5 text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full dark:bg-orange-900/30 dark:text-orange-400 font-bold uppercase tracking-wider">
                      <Zap className="h-3 w-3 fill-current" /> {streaks[activeUser]} Day Streak
                    </span>
                  )}
                </h2>
                <p className="text-base text-muted-foreground font-medium mt-1">
                  {encouragingWords}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={cn("text-5xl font-black tracking-tighter", activeUserTheme.text)}>
                {activeStats.percentage}%
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                {activeStats.completed} out of {activeStats.total} tasks completed
              </p>
            </div>
          </div>
          <div className="relative pt-2">
            <Progress 
              value={activeStats.percentage} 
              className="h-6 rounded-full bg-slate-100 dark:bg-slate-800"
              indicatorClassName={activeUserTheme.bg}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
