
"use client";

import { Task, TaskStatus, STATUS_OPTIONS } from "@/types/task";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";

interface TaskBoardViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onMoveDate: (id: string) => void;
}

export function TaskBoardView({ tasks, onEdit, onDelete, onStatusChange, onMoveDate }: TaskBoardViewProps) {
  const columns: Record<TaskStatus, Task[]> = {
    'Incomplete': [],
    'In Progress': [],
    'Needs Action': [],
    'Completed': []
  };

  tasks.forEach(task => {
    if (columns[task.status]) {
      columns[task.status].push(task);
    }
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500 h-full">
      {STATUS_OPTIONS.map((status) => (
        <div 
          key={status} 
          className="flex flex-col h-full min-h-[500px]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="text-sm font-bold flex items-center gap-2">
              {status}
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-medium">
                {columns[status].length}
              </span>
            </h3>
          </div>
          
          <div className={cn(
            "flex-1 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg p-3 space-y-3 border-2 border-transparent transition-colors",
            "group-hover:border-primary/20"
          )}>
            {columns[status].map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onStatusChange={onStatusChange}
                onMoveDate={onMoveDate}
                isBoard
              />
            ))}
            
            {columns[status].length === 0 && (
              <div className="h-24 border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Drop tasks here</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
