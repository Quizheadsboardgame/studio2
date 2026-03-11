"use client";

import * as React from "react";
import { Task } from "@/types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Calendar, MoreVertical, CheckCircle2, Clock, AlertCircle, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, parseISO } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: any) => void;
  isBoard?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, isBoard }: TaskCardProps) {
  const [todayStr, setTodayStr] = React.useState<string | null>(null);

  // Set today's date only on the client to avoid hydration mismatch
  React.useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  const isHighPriorityDueToday = React.useMemo(() => {
    if (!todayStr) return false;
    return task.priority === 'High' && task.dueDate === todayStr && task.status !== 'Completed';
  }, [task.priority, task.dueDate, task.status, todayStr]);

  const priorityColor = {
    High: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    Low: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
  }[task.priority];

  const statusIcon = task.status === 'Completed' 
    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
    : isHighPriorityDueToday 
      ? <AlertCircle className="w-4 h-4 text-destructive animate-pulse" />
      : <Clock className="w-4 h-4 text-muted-foreground" />;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent triggering edit when clicking action buttons
    onEdit(task);
  };

  const handleActionClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  // Format date to UK format (DD/MM/YYYY)
  const formattedDate = React.useMemo(() => {
    try {
      return format(parseISO(task.dueDate), 'dd/MM/yyyy');
    } catch (e) {
      return task.dueDate;
    }
  }, [task.dueDate]);

  return (
    <Card 
      draggable={isBoard}
      onDragStart={handleDragStart}
      onClick={handleCardClick}
      className={cn(
        "group transition-all hover:shadow-md cursor-pointer border-2",
        isBoard && "cursor-grab active:cursor-grabbing",
        task.status === 'Completed' ? "opacity-75" : "opacity-100",
        isHighPriorityDueToday 
          ? "border-destructive bg-red-50/50 dark:bg-red-950/10 shadow-sm" 
          : "border-transparent"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <span className="mt-1">{statusIcon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className={cn(
                  "text-sm font-semibold truncate",
                  task.status === 'Completed' && "line-through text-muted-foreground",
                  isHighPriorityDueToday && "text-destructive"
                )}>
                  {task.name}
                </h3>
                {task.recurrence && task.recurrence !== 'None' && (
                  <Repeat className="h-3 w-3 text-blue-500" title={`Recurring: ${task.recurrence}`} />
                )}
              </div>
              {task.notes && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {task.notes}
                </p>
              )}
            </div>
          </div>
          
          <div onClick={handleActionClick}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
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

        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", priorityColor)}>
              {task.priority}
            </Badge>
            <div className={cn(
              "flex items-center text-[10px]",
              isHighPriorityDueToday ? "text-destructive font-bold" : "text-muted-foreground"
            )}>
              <Calendar className="w-3 h-3 mr-1" />
              {formattedDate} {task.startTime && `at ${task.startTime}`} {isHighPriorityDueToday && "(TODAY)"}
            </div>
          </div>
          
          {!isBoard && (
            <div className="flex items-center gap-1" onClick={handleActionClick}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => onEdit(task)}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
