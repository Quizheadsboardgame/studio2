export type TaskStatus = 'Incomplete' | 'Awaiting Information' | 'Follow up Required' | 'Completed';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskTab = 'Today' | 'Tomorrow' | 'Later';
export type TaskUser = 'Daily chart';
export type TaskRecurrence = 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Monday to Friday';

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  startTime?: string; // Format: HH:mm
  endTime?: string;   // Format: HH:mm
  notes?: string;
  tab: TaskTab;
  owner: TaskUser;
  createdBy: TaskUser;
  recurrence: TaskRecurrence;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export const STATUS_OPTIONS: TaskStatus[] = ['Incomplete', 'Awaiting Information', 'Follow up Required', 'Completed'];
export const PRIORITY_OPTIONS: TaskPriority[] = ['High', 'Medium', 'Low'];
export const TAB_OPTIONS: TaskTab[] = ['Today', 'Tomorrow', 'Later'];
export const USER_OPTIONS: TaskUser[] = ['Daily chart'];
export const RECURRENCE_OPTIONS: TaskRecurrence[] = ['None', 'Daily', 'Weekly', 'Monthly', 'Monday to Friday'];

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  'High': 1,
  'Medium': 2,
  'Low': 3
};
