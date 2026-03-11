
"use client";

import * as React from "react";
import { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./task-card";
import { format, addDays, startOfDay, isSameDay, parseISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TaskDiaryViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export function TaskDiaryView({ tasks, onEdit, onDelete, onStatusChange }: TaskDiaryViewProps) {
  const [days, setDays] = React.useState<Date[]>([]);

  React.useEffect(() => {
    const today = startOfDay(new Date());
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));
    setDays(weekDays);
  }, []);

  if (days.length === 0) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {days.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(task => {
             try {
               return isSameDay(parseISO(task.dueDate), day);
             } catch (e) {
               return task.dueDate === dayStr;
             }
          });

          const isToday = isSameDay(day, new Date());

          return (
            <div key={dayStr} className="flex flex-col gap-3 min-h-[200px]">
              <div className={cn(
                "px-3 py-2 rounded-lg border text-center transition-colors",
                isToday 
                  ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              )}>
                <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80">
                  {format(day, 'EEE')}
                </span>
                <span className="block text-lg font-bold">
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-3">
                {dayTasks.length > 0 ? (
                  dayTasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onEdit={onEdit} 
                      onDelete={onDelete} 
                      onStatusChange={onStatusChange}
                    />
                  ))
                ) : (
                  <div className="py-8 border-2 border-dashed border-slate-100 dark:border-slate-800/50 rounded-xl flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-tight">Free Day</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
