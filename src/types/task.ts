
export type TaskStatus = 'Incomplete' | 'In Progress' | 'Needs Action' | 'Completed';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskTab = 'Today' | 'Tomorrow' | 'Next Week';

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  notes: string;
  tab: TaskTab;
  createdAt: number;
}

export const STATUS_OPTIONS: TaskStatus[] = ['Incomplete', 'In Progress', 'Needs Action', 'Completed'];
export const PRIORITY_OPTIONS: TaskPriority[] = ['High', 'Medium', 'Low'];
export const TAB_OPTIONS: TaskTab[] = ['Today', 'Tomorrow', 'Next Week'];

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  'High': 1,
  'Medium': 2,
  'Low': 3
};
