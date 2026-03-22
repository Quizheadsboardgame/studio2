
"use client";

import * as React from "react";
import { TaskUser } from "@/types/task";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Zap, Play, Pause, RotateCcw, Timer, Quote } from "lucide-react";
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
    border: 'border-blue-200',
    shadow: 'shadow-blue-900/10',
    ring: 'ring-blue-300',
    soft: 'bg-blue-50 dark:bg-blue-950/40',
    button: 'bg-blue-900 hover:bg-blue-800 text-white'
  },
  'Lucy': {
    bg: 'bg-emerald-900',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    shadow: 'shadow-emerald-900/10',
    ring: 'ring-emerald-300',
    soft: 'bg-emerald-50 dark:bg-emerald-950/40',
    button: 'bg-emerald-900 hover:bg-emerald-800 text-white'
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

  // Focus Timer State
  const [timerMinutes, setTimerMinutes] = React.useState("25");
  const [timeLeft, setTimeLeft] = React.useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = React.useState(false);

  // Motivational Quote State
  const [quoteIndex, setQuoteIndex] = React.useState(0);

  // Handle Timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      toast({
        title: "Focus Time Complete!",
        description: "Great job focusing! Take a well-deserved break.",
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft, toast]);

  // Handle Quote Rotation (Every 2 minutes)
  React.useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 120000); // 120,000ms = 2 minutes

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Progress Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
            </div>

            {/* Focus Timer & Quotes Widget */}
            <div className={cn(
              "p-6 rounded-2xl border flex flex-col items-center justify-center space-y-4 min-h-[220px]",
              activeUserTheme.soft,
              "border-slate-100 dark:border-slate-800"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <Timer className={cn("h-5 w-5", activeUserTheme.text)} />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Focus Time</h3>
              </div>
              
              <div className="text-4xl font-black tracking-tight font-mono tabular-nums">
                {formatTime(timeLeft)}
              </div>

              <div className="flex items-center gap-2 w-full">
                <Input 
                  type="number" 
                  value={timerMinutes} 
                  onChange={handleMinutesChange}
                  className="w-16 h-10 text-center font-bold bg-white dark:bg-slate-800 border-slate-200"
                  disabled={isTimerActive}
                />
                <Button 
                  onClick={toggleTimer}
                  className={cn("flex-1 h-10 font-bold rounded-lg", activeUserTheme.button)}
                >
                  {isTimerActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isTimerActive ? "Pause" : "Start"}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={resetTimer}
                  className="h-10 w-10 bg-white dark:bg-slate-800"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Rotating Quote Display */}
              <div className="mt-4 px-4 py-3 bg-white/50 dark:bg-black/20 rounded-xl w-full text-center flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-1000" key={quoteIndex}>
                <Quote className={cn("h-3 w-3 opacity-30", activeUserTheme.text)} />
                <p className="text-[11px] font-bold italic leading-tight text-slate-700 dark:text-slate-300 max-w-[200px]">
                  "{MOTIVATIONAL_QUOTES[quoteIndex]}"
                </p>
                <span className="text-[8px] uppercase tracking-widest font-black opacity-40 text-slate-400">Next inspiration in 2m</span>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
