
"use client";

import * as React from "react";
import { TaskUser } from "@/types/task";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Zap, Play, Pause, RotateCcw, Timer, Quote, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface UserStatsProps {
  activeUser: TaskUser;
  streaks: Record<string, number>;
  progress: Record<string, { completed: number, total: number, percentage: number, remaining: number }>;
}

const USER_COLORS = {
  'Owen': {
    bg: 'bg-blue-900',
    text: 'text-blue-900',
    border: 'border-blue-200/50',
    shadow: 'shadow-blue-900/10',
    ring: 'ring-blue-300',
    soft: 'bg-blue-50/50 dark:bg-blue-950/20',
    button: 'bg-slate-900 dark:bg-blue-800 hover:bg-slate-800 dark:hover:bg-blue-700 text-white'
  },
  'Lucy': {
    bg: 'bg-emerald-900',
    text: 'text-emerald-900',
    border: 'border-emerald-200/50',
    shadow: 'shadow-emerald-900/10',
    ring: 'ring-emerald-300',
    soft: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    button: 'bg-slate-900 dark:bg-emerald-800 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white'
  }
};

const MOTIVATIONAL_QUOTES = [
  "The only way to do great work is to love what you do.",
  "Don't count the days, make the days count.",
  "The secret of getting ahead is getting started.",
  "Your time is limited, don't waste it living someone else's life.",
  "Focus on being productive instead of busy.",
  "Action is the foundational key to all success.",
  "The future depends on what you do today.",
  "Dream big. Start small. But most of all, start.",
  "Efficiency is doing things right; effectiveness is doing the right things.",
  "Success is the sum of small efforts, repeated day in and day out."
];

export function UserStats({ activeUser, streaks, progress }: UserStatsProps) {
  const activeStats = progress[activeUser] || { completed: 0, total: 0, percentage: 100, remaining: 0 };
  const activeUserTheme = USER_COLORS[activeUser];
  const { toast } = useToast();

  const [timerMinutes, setTimerMinutes] = React.useState("25");
  const [timeLeft, setTimeLeft] = React.useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = React.useState(false);
  const [quoteIndex, setQuoteIndex] = React.useState(0);

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

  React.useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 120000);
    return () => clearInterval(quoteInterval);
  }, []);

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
        activeUserTheme.shadow
      )}>
        <CardContent className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            <div className="lg:col-span-2 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "h-20 w-20 rounded-3xl flex items-center justify-center shadow-inner relative overflow-hidden group",
                    activeUserTheme.soft
                  )}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                    <ShieldCheck className={cn("h-10 w-10 relative z-10", activeUserTheme.text)} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black font-headline tracking-tighter uppercase flex items-center gap-3">
                      {activeUser}
                      {streaks[activeUser] > 0 && (
                        <span className="flex items-center gap-1.5 text-[9px] bg-orange-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20">
                          <Zap className="h-3 w-3 fill-current" /> {streaks[activeUser]}D STREAK
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.3em] mt-1 opacity-60">
                      System Node Efficiency: {activeStats.percentage}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn("text-7xl font-black tracking-tighter font-headline", activeUserTheme.text)}>
                    {activeStats.percentage}%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <Progress 
                  value={activeStats.percentage} 
                  className="h-4 rounded-full bg-slate-200 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
                  indicatorClassName={cn(activeUserTheme.bg, "transition-all duration-1000 ease-out")}
                />
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Protocol Progress: {activeStats.completed} / {activeStats.total} Actions
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
                <Timer className={cn("h-5 w-5", activeUserTheme.text)} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Focus State</h3>
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
                  className={cn("flex-1 h-12 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg", activeUserTheme.button)}
                >
                  {isTimerActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isTimerActive ? "Suspend" : "Initialize"}
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

              <div className="mt-4 px-6 py-4 bg-slate-900/5 dark:bg-white/5 rounded-2xl w-full text-center flex flex-col items-center gap-3 border border-slate-100 dark:border-white/5 transition-all duration-1000" key={quoteIndex}>
                <Quote className={cn("h-4 w-4 opacity-20", activeUserTheme.text)} />
                <p className="text-[11px] font-bold italic leading-relaxed text-slate-700 dark:text-slate-300 max-w-[240px]">
                  "{MOTIVATIONAL_QUOTES[quoteIndex]}"
                </p>
                <div className="h-0.5 w-8 bg-blue-500/20 rounded-full"></div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
