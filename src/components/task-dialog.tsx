"use client";

import * as React from "react";
import { Task, STATUS_OPTIONS, PRIORITY_OPTIONS, TAB_OPTIONS, RECURRENCE_OPTIONS } from "@/types/task";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Repeat, Clock, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

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
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden flex flex-col max-h-[90vh] border-none shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
          <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
            {isCompleted ? <CheckCircle2 className="text-green-500 h-6 w-6" /> : isAwaiting ? <Info className="text-orange-500 h-6 w-6" /> : <Clock className="text-blue-500 h-6 w-6" />}
            {task?.id === 'new' ? 'Create New Task' : 'Task Details'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1">
          <div className="p-8 space-y-8">
            <div className="grid gap-3">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Task Name</Label>
              <Input
                id="name"
                placeholder="What needs to be done?"
                value={activeData.name || ""}
                onChange={(e) => setFormData({ ...activeData, name: e.target.value })}
                className={cn("text-xl font-bold h-14 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 focus-visible:ring-blue-500 rounded-2xl shadow-sm", isCompleted && "line-through text-muted-foreground")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Status</Label>
                <Select value={activeData.status} onValueChange={(val) => setFormData({ ...activeData, status: val as any })}>
                  <SelectTrigger id="status" className="h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Priority</Label>
                <Select value={activeData.priority} onValueChange={(val) => setFormData({ ...activeData, priority: val as any })}>
                  <SelectTrigger id="priority" className="h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="tab" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Schedule Category</Label>
                <Select value={activeData.tab} onValueChange={(val) => setFormData({ ...activeData, tab: val as any })}>
                  <SelectTrigger id="tab" className="h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl">
                    <SelectValue placeholder="Schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAB_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Due Date</Label>
                <Input id="dueDate" type="date" value={activeData.dueDate || ""} onChange={(e) => setFormData({ ...activeData, dueDate: e.target.value })} className="h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="recurrence" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-1.5">
                  <Repeat className="h-3 w-3" /> Pattern
                </Label>
                <Select value={activeData.recurrence || 'None'} onValueChange={(val) => setFormData({ ...activeData, recurrence: val as any })}>
                  <SelectTrigger id="recurrence" className="h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="grid gap-1.5">
                  <Label htmlFor="startTime" className="text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-2.5 w-2.5" /> Start
                  </Label>
                  <Input id="startTime" type="time" value={activeData.startTime || ""} onChange={(e) => setFormData({ ...activeData, startTime: e.target.value })} className="h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="endTime" className="text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-2.5 w-2.5" /> Finish
                  </Label>
                  <Input id="endTime" type="time" value={activeData.endTime || ""} onChange={(e) => setFormData({ ...activeData, endTime: e.target.value })} className="h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Notes & Context</Label>
              <Textarea 
                id="notes" 
                className="resize-none bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl min-h-[120px] text-sm shadow-sm" 
                rows={4} 
                value={activeData.notes || ""} 
                onChange={(e) => setFormData({ ...activeData, notes: e.target.value })} 
                placeholder="Add any extra details..." 
              />
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t mt-auto">
          <Button variant="ghost" size="lg" onClick={onClose} className="font-black uppercase tracking-widest text-xs rounded-full px-8">Cancel</Button>
          <Button onClick={handleSave} className="bg-slate-900 dark:bg-blue-600 hover:scale-105 active:scale-95 text-white font-black uppercase tracking-widest rounded-full px-12 h-14 shadow-xl shadow-blue-500/20 text-sm transition-all">
            {task?.id === 'new' ? 'Create Task' : 'Update Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
