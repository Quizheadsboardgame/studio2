
"use client";

import * as React from "react";
import { Task, STATUS_OPTIONS, PRIORITY_OPTIONS, TAB_OPTIONS, USER_OPTIONS, RECURRENCE_OPTIONS } from "@/types/task";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Repeat, Clock, CheckCircle2, UserPen, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const USER_THEMES = {
  'Owen': 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
  'Lucy': 'text-pink-600 bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:border-pink-800 dark:text-pink-400',
  'Nick': 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
};

export function TaskDialog({ task, isOpen, onClose, onSave }: TaskDialogProps) {
  const [formData, setFormData] = React.useState<Task | null>(null);

  React.useEffect(() => {
    if (task) {
      setFormData({ ...task });
    }
  }, [task]);

  if (!formData) return null;

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const isCompleted = formData.status === 'Completed';
  const isAwaiting = formData.status === 'Awaiting Information';
  const creatorTheme = formData.createdBy && formData.createdBy !== formData.owner 
    ? USER_THEMES[formData.createdBy as keyof typeof USER_THEMES] 
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCompleted ? <CheckCircle2 className="text-green-500 h-5 w-5" /> : isAwaiting ? <Info className="text-orange-500 h-5 w-5" /> : <Clock className="text-blue-500 h-5 w-5" />}
            {task?.id === 'new' ? 'Create New Task' : 'Task Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Task Name</Label>
              {formData.createdBy && formData.createdBy !== formData.owner && (
                <div className={cn(
                  "flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  creatorTheme
                )}>
                  <UserPen className="h-3 w-3" />
                  Created by {formData.createdBy}
                </div>
              )}
            </div>
            <Input
              id="name"
              placeholder="What needs to be done?"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(
                "text-lg font-semibold h-12 border-none px-0 focus-visible:ring-0 shadow-none bg-transparent",
                isCompleted && "line-through text-muted-foreground"
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val as any })}
              >
                <SelectTrigger id="status" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(val) => setFormData({ ...formData, priority: val as any })}
              >
                <SelectTrigger id="priority" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tab" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Schedule</Label>
              <Select
                value={formData.tab}
                onValueChange={(val) => setFormData({ ...formData, tab: val as any })}
              >
                <SelectTrigger id="tab" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Select Tab" />
                </SelectTrigger>
                <SelectContent>
                  {TAB_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="owner" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assignee</Label>
              <Select
                value={formData.owner}
                onValueChange={(val) => setFormData({ ...formData, owner: val as any })}
              >
                <SelectTrigger id="owner" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {USER_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dueDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime || ""}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Finish Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime || ""}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recurrence" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Repeat className="h-3.5 w-3.5" /> Recurrence
            </Label>
            <Select
              value={formData.recurrence || 'None'}
              onValueChange={(val) => setFormData({ ...formData, recurrence: val as any })}
            >
              <SelectTrigger id="recurrence" className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</Label>
            <Textarea
              id="notes"
              className="resize-none bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[100px]"
              rows={3}
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add some details about this task..."
            />
          </div>
        </div>
        
        <DialogFooter className="bg-slate-50 dark:bg-slate-900/50 -mx-6 -mb-6 p-4 mt-2 border-t dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} className="font-semibold">Cancel</Button>
          <Button 
            onClick={handleSave} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-full shadow-lg shadow-blue-600/20"
          >
            {task?.id === 'new' ? 'Create Task' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
