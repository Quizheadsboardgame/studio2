
"use client";

import { Task } from "@/types/task";
import { TaskCard } from "./task-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

interface TaskListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: any) => void;
  onMoveDate: (id: string) => void;
}

export function TaskListView({ tasks, onEdit, onDelete, onStatusChange, onMoveDate }: TaskListViewProps) {
  if (tasks.length === 0) {
    const placeholder = PlaceHolderImages.find(img => img.id === 'empty-tasks');
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
        {placeholder && (
          <div className="relative w-48 h-48 mb-6 grayscale opacity-40">
            <Image 
              src={placeholder.imageUrl} 
              alt={placeholder.description} 
              fill 
              className="object-contain"
              data-ai-hint={placeholder.imageHint}
            />
          </div>
        )}
        <h3 className="text-xl font-semibold text-muted-foreground">No tasks found</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
          Start by creating a new task or try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-3xl mx-auto w-full animate-in fade-in duration-500">
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          onStatusChange={onStatusChange}
          onMoveDate={onMoveDate}
        />
      ))}
    </div>
  );
}
