
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
  'Owen': 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
  'Lucy': 'text-pink-600 bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:border-pink-800 dark:text-pink-400',
  'Nick': 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
};

export function TaskDialog({ task, isOpen, onClose, onSave }: TaskDialogProps) {
  const [formData, setFormData] = React.useState<Task | null>(null);

  React.useEffect(() => {
    if (task && isOpen) {
      setFormData({ ...task });
    }
  }, [task, isOpen]);

  if (!formData) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const isCompleted = formData.status === 'Completed';
  const isAwaiting = formData.status === 'Awaiting Information';

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
                {formData.createdBy && formData.createdBy !== formData.owner && (
                  <div className={cn("flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border", USER_THEMES[formData.createdBy as keyof typeof USER_THEMES])}>
                    <UserPen className="h-2.5 w-2.5" /> Created by {formData.createdBy}
                  </div>
                )}
              </div>
              <Input
                id="name"
                placeholder="What needs to be done?"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn("text-xl font-bold h-12 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-visible:ring-blue-500 shadow-sm", isCompleted && "line-through text-muted-foreground")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as any })}>
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
                <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val as any })}>
                  <SelectTrigger id="priority" className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="owner" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assignee</Label>
                <Select value={formData.owner} onValueChange={(val) => setFormData({ ...formData, owner: val as any })}>
                  <SelectTrigger id="owner" className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="tab" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Schedule</Label>
                <Select value={formData.tab} onValueChange={(val) => setFormData({ ...formData, tab: val as any })}>
                  <SelectTrigger id="tab" className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAB_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="dueDate" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Due Date</Label>
                <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="recurrence" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Repeat className="h-3 w-3" /> Pattern
                </Label>
                <Select value={formData.recurrence || 'None'} onValueChange={(val) => setFormData({ ...formData, recurrence: val as any })}>
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
                <Input id="startTime" type="time" value={formData.startTime || ""} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="endTime" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Finish Time
                </Label>
                <Input id="endTime" type="time" value={formData.endTime || ""} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes & Context</Label>
              <Textarea 
                id="notes" 
                className="resize-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[100px] text-sm shadow-sm" 
                rows={4} 
                value={formData.notes || ""} 
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                placeholder="Add any extra details Owen, Lucy, or Nick might need..." 
              />
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t mt-auto">
          <Button variant="ghost" size="lg" onClick={onClose} className="font-semibold rounded-full px-6">Cancel</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-10 h-11 shadow-lg shadow-blue-600/20">
            {task?.id === 'new' ? 'Create Task' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
