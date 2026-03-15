"use client";

import * as React from "react";
import { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./task-card";
import { 
  format, 
  addDays, 
  startOfDay, 
  isSameDay, 
  parseISO, 
  getDay, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  addMonths,
  subMonths,
  subDays,
  isSameMonth
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TaskDiaryViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onMoveDate: (id: string) => void;
}

export function TaskDiaryView({ tasks, onEdit, onDelete, onStatusChange, onMoveDate }: TaskDiaryViewProps) {
  const [viewType, setViewType] = React.useState<'week' | 'month'>('week');
  const [baseDate, setBaseDate] = React.useState<Date | null>(null);
  const [days, setDays] = React.useState<Date[]>([]);

  // Defer initialization of current date until after hydration
  React.useEffect(() => {
    setBaseDate(new Date());
  }, []);

  React.useEffect(() => {
    if (!baseDate) return;

    const start = startOfDay(baseDate);
    let intervalDays: Date[] = [];

    if (viewType === 'week') {
      intervalDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    } else {
      const monthStart = startOfMonth(start);
      const monthEnd = endOfMonth(start);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      
      intervalDays = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
      });
    }
    setDays(intervalDays);
  }, [baseDate, viewType]);

  const navigate = (direction: 'prev' | 'next') => {
    if (!baseDate) return;
    if (viewType === 'week') {
      setBaseDate(prev => direction === 'next' ? addDays(prev!, 7) : subDays(prev!, 7));
    } else {
      setBaseDate(prev => direction === 'next' ? addMonths(prev!, 1) : subMonths(prev!, 1));
    }
  };

  const isTaskScheduledForDay = (task: Task, day: Date) => {
    const taskDueDate = parseISO(task.dueDate);
    
    // Always show if it's the actual due date
    if (isSameDay(taskDueDate, day)) return true;
    
    // CRITICAL: If the task is actioned (Completed or Awaiting Info), DO NOT project it into future days.
    if (task.status === 'Completed' || task.status === 'Awaiting Information') return false;
    
    // If not completed/actioned and recurring, project it forward
    if (task.recurrence === 'None') return false;
    if (taskDueDate > day) return false;

    const dayOfWeek = getDay(day);
    switch (task.recurrence) {
      case 'Daily':
        return true;
      case 'Monday to Friday':
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'Weekly':
        return getDay(taskDueDate) === dayOfWeek;
      case 'Monthly':
        return taskDueDate.getDate() === day.getDate();
      default:
        return false;
    }
  };

  // Prevent rendering before the current date is determined to avoid hydration mismatch
  if (!baseDate || days.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <Tabs value={viewType} onValueChange={(v) => setViewType(v as any)} className="w-auto">
            <TabsList className="grid w-full grid-cols-2 h-9 p-1">
              <TabsTrigger value="week" className="text-xs">
                <LayoutGrid className="h-3 w-3 mr-1.5" /> Week
              </TabsTrigger>
              <TabsTrigger value="month" className="text-xs">
                <CalendarIcon className="h-3 w-3 mr-1.5" /> Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate('prev')} className="h-8 w-8 rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm font-bold min-w-[120px] text-center">
              {viewType === 'week' 
                ? `${format(days[0], 'MMM d')} - ${format(days[days.length - 1], 'MMM d, yyyy')}`
                : format(baseDate, 'MMMM yyyy')
              }
            </h2>
            <Button variant="outline" size="icon" onClick={() => navigate('next')} className="h-8 w-8 rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setBaseDate(new Date())}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          Jump to Today
        </Button>
      </div>

      <div className={cn(
        "grid gap-4",
        viewType === 'week' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-7" : "grid-cols-7"
      )}>
        {viewType === 'month' && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 py-2">
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(task => isTaskScheduledForDay(task, day))
            .sort((a, b) => {
              if (!a.startTime) return 1;
              if (!b.startTime) return -1;
              return a.startTime.localeCompare(b.startTime);
            });

          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, baseDate);

          return (
            <div 
              key={`${dayStr}-${viewType}`} 
              className={cn(
                "flex flex-col gap-2 min-h-[120px] transition-all",
                viewType === 'month' && !isCurrentMonth && "opacity-30 grayscale pointer-events-none"
              )}
            >
              <div className={cn(
                "px-2 py-1.5 rounded-lg border text-center transition-all",
                isToday 
                  ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105 z-10" 
                  : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
              )}>
                <span className="block text-[10px] uppercase font-bold tracking-tight opacity-70">
                  {format(day, 'EEE')}
                </span>
                <span className="block text-base font-bold">
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto no-scrollbar">
                {dayTasks.length > 0 ? (
                  dayTasks.map((task) => {
                    const timeRange = task.startTime ? (task.endTime ? `${task.startTime}-${task.endTime}` : task.startTime) : null;
                    
                    return (
                      <div key={`${task.id}-${dayStr}`} className="relative">
                        {timeRange && (
                          <div className="absolute -top-1.5 left-2 z-10">
                            <span className="bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 text-[8px] font-bold px-1 py-0.5 rounded-sm shadow-sm">
                              {timeRange}
                            </span>
                          </div>
                        )}
                        <div className={cn(timeRange ? "pt-1.5" : "")}>
                          <TaskCard 
                            task={task} 
                            onEdit={onEdit} 
                            onDelete={onDelete} 
                            onStatusChange={onStatusChange}
                            onMoveDate={onMoveDate}
                            isBoard={viewType === 'month'}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  viewType === 'week' && (
                    <div className="py-8 border-2 border-dashed border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-tight">Free Day</span>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
