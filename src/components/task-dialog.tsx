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
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const USER_THEMES = {
  'Owen': 'text-blue-900 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300',
  'Lucy': 'text-emerald-900 bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300'
};

export function TaskDialog({ task, isOpen, onClose, onSave }: TaskDialogProps) {
  const [formData, setFormData] = React.useState<Task | null>(null);

  // Synchronize internal state with the task prop when the dialog opens
  React.useEffect(() => {
    if (isOpen && task) {
      setFormData({ ...task });
    } else if (!isOpen) {
      // Clear data when closed to ensure a clean state for next open
      setFormData(null);
    }
  }, [isOpen, task]);

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  // We use a fallback if formData is null for rendering stability during animations
  const activeData = formData || ({} as Task);
  const isCompleted = activeData.status === 'Completed';
  const isAwaiting = activeData.status === 'Awaiting Information';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-2 border-b bg-slate-50/50 dark:bg-slate-900/50">
          <DialogTitle className="flex items-center gap-2">
            {isCompleted ? <CheckCircle2 className="text-green-500 h-5 w-5" /> : isAwaiting ? <Info className="text-orange-500 h-5 w-5" /> : <Clock className="text-blue-500 h-5 w-5" />}
            {task?.id === 'new' ? 'Create New Task' : 'Task Details'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Task Name</Label>
                {activeData.createdBy && activeData.createdBy !== activeData.owner && (
                  <div className={cn("flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border", USER_THEMES[activeData.createdBy as keyof typeof USER_THEMES])}>
                    <UserPen className="h-2.5 w-2.5" /> Created by {activeData.createdBy}
                  </div>
                )}
              </div>
              <Input
                id="name"
                placeholder="What needs to be done?"
                value={activeData.name || ""}
                onChange={(e) => setFormData({ ...activeData, name: e.target.value })}
                className={cn("text-xl font-bold h-12 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-visible:ring-blue-500 shadow-sm", isCompleted && "line-through text-muted-foreground")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
                <Select value={activeData.status} onValueChange={(val) => setFormData({ ...activeData, status: val as any })}>
                  <SelectTrigger id="status" className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="priority" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</Label>
                <Select value={activeData.priority} onValueChange={(val) => setFormData({ ...activeData, priority: val as any })}>
                  <SelectTrigger id="priority" className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="owner" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assignee</Label>
                <Select value={activeData.owner} onValueChange={(val) => setFormData({ ...activeData, owner: val as any })}>
                  <SelectTrigger id="owner" className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="tab" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Schedule</Label>
                <Select value={activeData.tab} onValueChange={(val) => setFormData({ ...activeData, tab: val as any })}>
                  <SelectTrigger id="tab" className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAB_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="dueDate" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Due Date</Label>
                <Input id="dueDate" type="date" value={activeData.dueDate || ""} onChange={(e) => setFormData({ ...activeData, dueDate: e.target.value })} className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="recurrence" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Repeat className="h-3 w-3" /> Pattern
                </Label>
                <Select value={activeData.recurrence || 'None'} onValueChange={(val) => setFormData({ ...activeData, recurrence: val as any })}>
                  <SelectTrigger id="recurrence" className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="grid gap-1.5">
                <Label htmlFor="startTime" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Start Time
                </Label>
                <Input id="startTime" type="time" value={activeData.startTime || ""} onChange={(e) => setFormData({ ...activeData, startTime: e.target.value })} className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="endTime" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Finish Time
                </Label>
                <Input id="endTime" type="time" value={activeData.endTime || ""} onChange={(e) => setFormData({ ...activeData, endTime: e.target.value })} className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes & Context</Label>
              <Textarea 
                id="notes" 
                className="resize-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[100px] text-sm shadow-sm" 
                rows={4} 
                value={activeData.notes || ""} 
                onChange={(e) => setFormData({ ...activeData, notes: e.target.value })} 
                placeholder="Add any extra details..." 
              />
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t mt-auto">
          <Button variant="ghost" size="lg" onClick={onClose} className="font-bold rounded-full px-8">Cancel</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-full px-12 h-12 shadow-lg shadow-blue-600/20 text-base">
            {task?.id === 'new' ? 'Create Task' : 'Update Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
