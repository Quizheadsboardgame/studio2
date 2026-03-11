export type TaskStatus = 'Incomplete' | 'In Progress' | 'Needs Action' | 'Completed';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskTab = 'Today' | 'Tomorrow' | 'Next Week';
export type TaskUser = 'Owen' | 'Lucy' | 'Nick';

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  startTime?: string; // Format: HH:mm
  notes?: string;
  tab: TaskTab;
  owner: TaskUser;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export const STATUS_OPTIONS: TaskStatus[] = ['Incomplete', 'In Progress', 'Needs Action', 'Completed'];
export const PRIORITY_OPTIONS: TaskPriority[] = ['High', 'Medium', 'Low'];
export const TAB_OPTIONS: TaskTab[] = ['Today', 'Tomorrow', 'Next Week'];
export const USER_OPTIONS: TaskUser[] = ['Owen', 'Lucy', 'Nick'];

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  'High': 1,
  'Medium': 2,
  'Low': 3
};
