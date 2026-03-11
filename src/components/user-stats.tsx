"use client";

import * as React from "react";
import { Task, TaskUser, USER_OPTIONS } from "@/types/task";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Flame, Target, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStatsProps {
  tasks: Task[];
  activeUser: TaskUser;
}

export function UserStats({ tasks, activeUser }: UserStatsProps) {
  const getStats = (user: TaskUser) => {
    const userTasks = tasks.filter((t) => t.owner === user);
    const completed = userTasks.filter((t) => t.status === "Completed").length;
    const total = userTasks.length;
    // If 0 tasks, completion is 100% (clean slate)
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 100;
    return { completed, total, percentage };
  };

  const activeStats = getStats(activeUser);

  const encouragingWords = React.useMemo(() => {
    if (activeStats.total === 0) return "Add your first task and let's get moving!";
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
      <Card className="lg:col-span-2 overflow-hidden border-2 border-blue-100 dark:border-slate-800 shadow-lg shadow-blue-500/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                {activeUser}'s Daily Progress
              </h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                {encouragingWords}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-blue-600">
                {activeStats.percentage}%
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {activeStats.completed} of {activeStats.total} Tasks Done
              </p>
            </div>
          </div>
          <div className="relative pt-2">
            <Progress value={activeStats.percentage} className="h-4 rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between px-1 pointer-events-none">
              {[25, 50, 75].map((mark) => (
                <div 
                  key={mark} 
                  className={cn(
                    "h-2 w-0.5 bg-white/30 dark:bg-slate-700/30",
                    activeStats.percentage >= mark && "bg-blue-300"
                  )} 
                  style={{ marginLeft: `${mark}%` }} 
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Competition */}
      <Card className="border-2 border-amber-100 dark:border-slate-800 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-900 dark:to-slate-800/50 shadow-lg shadow-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <Trophy className="h-4 w-4" />
            Daily Standings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allUserStats.map((stat, index) => (
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
                    stat.name === activeUser && "text-blue-600 underline underline-offset-4 decoration-2"
                  )}>
                    {stat.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    {stat.total === 0 ? "0 tasks (Clean slate!)" : `${stat.completed} of ${stat.total} tasks`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-sm font-black tabular-nums">{stat.percentage}%</span>
                </div>
                {index === 0 && (
                  <Flame className="h-4 w-4 text-orange-500 animate-bounce" />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
