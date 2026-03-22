"use client";

import * as React from "react";
import { Task } from "@/types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Calendar, MoreVertical, CheckCircle2, Clock, AlertCircle, Repeat, Check, CalendarPlus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, parseISO } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: any) => void;
  onMoveDate: (id: string) => void;
  isBoard?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, onMoveDate, isBoard }: TaskCardProps) {
  const [todayStr, setTodayStr] = React.useState<string | null>(null);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchOffset, setTouchOffset] = React.useState<number>(0);
  
  const isSwipingLeft = touchOffset < 0;
  const isSwipingRight = touchOffset > 0;

  // Set today's date only on the client to avoid hydration mismatch
  React.useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  const isHighPriorityDueToday = React.useMemo(() => {
    if (!todayStr) return false;
    return task.priority === 'High' && task.dueDate === todayStr && task.status !== 'Completed';
  }, [task.priority, task.dueDate, task.status, todayStr]);

  const isUrgent = isHighPriorityDueToday && task.status !== 'Awaiting Information';

  const priorityColor = {
    High: isUrgent ? "bg-white text-red-700 dark:bg-white dark:text-red-700" : "bg-red-100 text-red-700 border-red-200 dark:bg-red-700 dark:text-white dark:border-red-800",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    Low: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
  }[task.priority];

  const statusIcon = task.status === 'Completed' 
    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
    : task.status === 'Awaiting Information'
      ? <Info className="w-4 h-4 text-orange-500 animate-pulse" />
      : task.status === 'Follow up Required'
        ? <AlertCircle className="w-4 h-4 text-blue-500" />
        : isUrgent 
          ? <AlertCircle className="w-4 h-4 text-white animate-pulse" />
          : <Clock className="w-4 h-4 text-muted-foreground" />;

  const handleDragStart = (e: React.DragEvent) => {
    if (!isBoard) return;
    e.dataTransfer.setData("taskId", task.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (Math.abs(touchOffset) < 10) {
      onEdit(task);
    }
  };

  const handleActionClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    if (diff < 0 && task.status === 'Completed') return;
    setTouchOffset(diff);
  };

  const handleTouchEnd = () => {
    if (touchOffset < -100 && task.status !== 'Completed') {
      onStatusChange(task.id, 'Completed');
    } else if (touchOffset > 100) {
      onMoveDate(task.id);
    }
    setTouchStart(null);
    setTouchOffset(0);
  };

  const formattedDate = React.useMemo(() => {
    try {
      return format(parseISO(task.dueDate), 'dd/MM/yyyy');
    } catch (e) {
      return task.dueDate;
    }
  }, [task.dueDate]);

  const timeDisplay = React.useMemo(() => {
    if (!task.startTime) return null;
    if (!task.endTime) return task.startTime;
    return `${task.startTime} - ${task.endTime}`;
  }, [task.startTime, task.endTime]);

  return (
    <div className="relative overflow-hidden rounded-lg group">
      <div 
        className={cn(
          "absolute inset-0 bg-green-500 flex items-center justify-end px-6 transition-opacity",
          isSwipingLeft ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex flex-col items-center text-white">
          <Check className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase">Complete</span>
        </div>
      </div>

      <div 
        className={cn(
          "absolute inset-0 bg-amber-500 flex items-center justify-start px-6 transition-opacity",
          isSwipingRight ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex flex-col items-center text-white">
          <CalendarPlus className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase">Next Day</span>
        </div>
      </div>

      <Card 
        draggable={isBoard}
        onDragStart={handleDragStart}
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          transform: `translateX(${touchOffset}px)`,
          transition: touchStart === null ? 'transform 0.3s ease-out' : 'none'
        }}
        className={cn(
          "relative group transition-all hover:shadow-md cursor-pointer border-2 z-10 bg-card",
          isBoard && "cursor-grab active:cursor-grabbing",
          task.status === 'Completed' 
            ? "border-green-200 bg-green-50/50 dark:bg-green-950/10 opacity-75" 
            : task.status === 'Awaiting Information'
              ? "border-orange-200 bg-orange-50/50 dark:bg-orange-950/10 shadow-sm"
              : isUrgent
                ? "border-red-600 bg-red-600 text-white dark:bg-red-700 dark:border-red-500 shadow-xl scale-[1.02]" 
                : "border-transparent"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <span className="mt-1">{statusIcon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className={cn(
                    "text-sm font-bold truncate",
                    task.status === 'Completed' && "line-through text-muted-foreground font-medium",
                    isUrgent && "text-white"
                  )}>
                    {task.name}
                  </h3>
                  {task.recurrence && task.recurrence !== 'None' && (
                    <Repeat className={cn("h-3 w-3", isUrgent ? "text-white/80" : "text-blue-500")} title={`Recurring: ${task.recurrence}`} />
                  )}
                </div>
                {task.notes && (
                  <p className={cn(
                    "text-xs line-clamp-2 mt-2 leading-relaxed",
                    isUrgent ? "text-white/90" : "text-muted-foreground"
                  )}>
                    {task.notes}
                  </p>
                )}
              </div>
            </div>
            
            <div onClick={handleActionClick}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-8 w-8",
                      isUrgent ? "text-white hover:bg-white/10" : "opacity-0 group-hover:opacity-100 transition-opacity"
                    )}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(task.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider", priorityColor)}>
                {task.priority}
              </Badge>
              <div className={cn(
                "flex items-center text-[11px] font-medium",
                isUrgent ? "text-white font-black" : "text-muted-foreground"
              )}>
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {formattedDate} {timeDisplay && `@ ${timeDisplay}`} {isUrgent && "!!!"}
              </div>
            </div>
            
            {!isBoard && (
              <div className="flex items-center gap-1" onClick={handleActionClick}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8",
                    isUrgent ? "text-white/80 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-blue-600"
                  )}
                  onClick={() => onEdit(task)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
