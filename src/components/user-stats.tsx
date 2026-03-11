"use client";

import * as React from "react";
import { Task, TaskUser, USER_OPTIONS } from "@/types/task";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Flame, Target, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface UserStatsProps {
  tasks: Task[];
  activeUser: TaskUser;
}

const USER_COLORS = {
  'Owen': {
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-100',
    shadow: 'shadow-blue-500/5',
    ring: 'ring-blue-200',
    soft: 'bg-blue-100'
  },
  'Lucy': {
    bg: 'bg-pink-500',
    text: 'text-pink-500',
    border: 'border-pink-100',
    shadow: 'shadow-pink-500/5',
    ring: 'ring-pink-200',
    soft: 'bg-pink-100'
  },
  'Nick': {
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    border: 'border-emerald-100',
    shadow: 'shadow-emerald-500/5',
    ring: 'ring-emerald-200',
    soft: 'bg-emerald-100'
  }
};

export function UserStats({ tasks, activeUser }: UserStatsProps) {
  const [todayStr, setTodayStr] = React.useState<string>("");

  // Set today's date only on the client to avoid hydration mismatch
  React.useEffect(() => {
    setTodayStr(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const getStats = (user: TaskUser) => {
    if (!todayStr) return { completed: 0, total: 0, percentage: 100 };
    
    // Filter tasks specifically for this user and for TODAY'S date
    const userTasksForToday = tasks.filter((t) => t.owner === user && t.dueDate === todayStr);
    const completed = userTasksForToday.filter((t) => t.status === "Completed").length;
    const total = userTasksForToday.length;
    
    // If 0 tasks for today, completion is 100% (clean slate)
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 100;
    return { completed, total, percentage };
  };

  const activeStats = getStats(activeUser);
  const activeUserTheme = USER_COLORS[activeUser];

  const encouragingWords = React.useMemo(() => {
    if (activeStats.total === 0) return "No tasks scheduled for today. Enjoy the clean slate!";
    if (activeStats.percentage === 0) return "Let's kick things off! You've got this.";
    if (activeStats.percentage < 40) return "Great start! Every small step counts.";
    if (activeStats.percentage < 70) return "Over the hump! Keep that momentum building.";
    if (activeStats.percentage < 100) return "Almost at the finish line! Stay focused.";
    return "Legendary status! You've crushed your schedule!";
  }, [activeStats]);

  const allUserStats = USER_OPTIONS.map((user) => ({
    name: user,
    ...getStats(user),
  })).sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Active User Progress */}
      <Card className={cn(
        "lg:col-span-2 overflow-hidden border-2 shadow-lg transition-all duration-500",
        activeUserTheme.border,
        activeUserTheme.shadow,
        "dark:border-slate-800"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className={cn("h-5 w-5", activeUserTheme.text)} />
                {activeUser}'s Daily Progress
              </h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                {encouragingWords}
              </p>
            </div>
            <div className="text-right">
              <span className={cn("text-3xl font-black", activeUserTheme.text)}>
                {activeStats.percentage}%
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {activeStats.completed} of {activeStats.total} Tasks Done
              </p>
            </div>
          </div>
          <div className="relative pt-2">
            <Progress 
              value={activeStats.percentage} 
              className="h-4 rounded-full bg-slate-100 dark:bg-slate-800"
              indicatorClassName={activeUserTheme.bg}
            />
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between px-1 pointer-events-none">
              {[25, 50, 75].map((mark) => (
                <div 
                  key={mark} 
                  className={cn(
                    "h-2 w-0.5 bg-white/30 dark:bg-slate-700/30",
                    activeStats.percentage >= mark && "bg-white/50"
                  )} 
                  style={{ marginLeft: `${mark}%` }} 
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Competition */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-slate-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Trophy className="h-4 w-4 text-amber-500" />
            Daily Standings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allUserStats.map((stat, index) => {
            const userTheme = USER_COLORS[stat.name];
            return (
              <div key={stat.name} className="flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shadow-sm transition-transform group-hover:scale-110",
                    index === 0 ? "bg-amber-100 text-amber-600 ring-2 ring-amber-200" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                  )}>
                    {index === 0 ? <Star className="h-3 w-3" /> : index + 1}
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-bold",
                      stat.name === activeUser && "underline underline-offset-4 decoration-2",
                      stat.name === activeUser && userTheme.text
                    )}>
                      {stat.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {stat.total === 0 ? "0 tasks today (Clean!)" : `${stat.completed} of ${stat.total} today`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={cn("text-sm font-black tabular-nums", stat.name === activeUser && userTheme.text)}>
                      {stat.percentage}%
                    </span>
                  </div>
                  {index === 0 && stat.percentage > 0 && (
                    <Flame className="h-4 w-4 text-orange-500 animate-bounce" />
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
