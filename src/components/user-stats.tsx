"use client";

import * as React from "react";
import { TaskUser } from "@/types/task";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Timer, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface UserStatsProps {
  activeUser: TaskUser;
  progress: Record<string, { completed: number, total: number, percentage: number, remaining: number }>;
}

const USER_COLORS = {
  bg: 'bg-blue-900',
  text: 'text-blue-900',
  border: 'border-blue-200/50',
  shadow: 'shadow-blue-900/10',
  ring: 'ring-blue-300',
  soft: 'bg-blue-50/50 dark:bg-blue-950/20',
  button: 'bg-slate-900 dark:bg-blue-800 hover:bg-slate-800 dark:hover:bg-blue-700 text-white'
};

export function UserStats({ activeUser, progress }: UserStatsProps) {
  const activeStats = progress[activeUser] || { completed: 0, total: 0, percentage: 100, remaining: 0 };
  const { toast } = useToast();

  const [timerMinutes, setTimerMinutes] = React.useState("25");
  const [timeLeft, setTimeLeft] = React.useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = React.useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      toast({
        title: "Deep Work Complete",
        description: "Focus session verified. Time for optimal recovery.",
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft, toast]);

  const toggleTimer = () => {
    if (!isTimerActive && timeLeft === 0) {
      const mins = parseInt(timerMinutes) || 25;
      setTimeLeft(mins * 60);
    }
    setIsTimerActive(!isTimerActive);
  };

  const resetTimer = () => {
    const mins = parseInt(timerMinutes) || 25;
    setTimeLeft(mins * 60);
    setIsTimerActive(false);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTimerMinutes(val);
    if (!isTimerActive) {
      const mins = parseInt(val) || 0;
      setTimeLeft(mins * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
      <Card className={cn(
        "overflow-hidden border border-slate-200/50 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-2xl transition-all duration-700 rounded-[2rem]",
        USER_COLORS.shadow
      )}>
        <CardContent className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            <div className="lg:col-span-2 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "h-20 w-20 rounded-3xl flex items-center justify-center shadow-inner relative overflow-hidden group",
                    USER_COLORS.soft
                  )}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                    <ShieldCheck className={cn("h-10 w-10 relative z-10", USER_COLORS.text)} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black font-headline tracking-tighter uppercase">
                      {activeUser}
                    </h2>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.3em] mt-1 opacity-60">
                      Daily Completion: {activeStats.percentage}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn("text-7xl font-black tracking-tighter font-headline", USER_COLORS.text)}>
                    {activeStats.percentage}%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <Progress 
                  value={activeStats.percentage} 
                  className="h-4 rounded-full bg-slate-200 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
                  indicatorClassName={cn(USER_COLORS.bg, "transition-all duration-1000 ease-out")}
                />
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Tasks Progress: {activeStats.completed} / {activeStats.total} completed
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                    Optimized
                  </span>
                </div>
              </div>
            </div>

            <div className={cn(
              "p-8 rounded-[1.5rem] border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center space-y-5 bg-white/50 dark:bg-black/40 backdrop-blur-xl shadow-inner",
            )}>
              <div className="flex items-center gap-2 mb-1">
                <Timer className={cn("h-5 w-5", USER_COLORS.text)} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Focus Timer</h3>
              </div>
              
              <div className="text-5xl font-black tracking-tighter font-headline tabular-nums text-slate-900 dark:text-white">
                {formatTime(timeLeft)}
              </div>

              <div className="flex items-center gap-2 w-full">
                <Input 
                  type="number" 
                  value={timerMinutes} 
                  onChange={handleMinutesChange}
                  className="w-16 h-12 text-center font-black bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                  disabled={isTimerActive}
                />
                <Button 
                  onClick={toggleTimer}
                  className={cn("flex-1 h-12 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg", USER_COLORS.button)}
                >
                  {isTimerActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isTimerActive ? "Pause" : "Start"}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={resetTimer}
                  className="h-12 w-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
