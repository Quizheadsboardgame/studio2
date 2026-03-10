
import { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskTab, TaskUser, PRIORITY_ORDER } from '@/types/task';

const LOCAL_STORAGE_KEY = 'time-based-tasks-v2';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [activeTab, setActiveTab] = useState<TaskTab>('Today');
  const [activeUser, setActiveUser] = useState<TaskUser>('Owen');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             task.notes.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        const matchesTab = task.tab === activeTab;
        const matchesUser = task.owner === activeUser;
        return matchesSearch && matchesStatus && matchesTab && matchesUser;
      })
      .sort((a, b) => {
        // Sort by priority (High -> Low)
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by due date
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [tasks, searchQuery, statusFilter, activeTab, activeUser]);

  const addTask = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: 'New Task',
      status: 'Incomplete',
      priority: 'Medium',
      dueDate: new Date().toISOString().split('T')[0],
      notes: '',
      tab: activeTab,
      owner: activeUser,
      createdAt: Date.now()
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const moveTaskStatus = (id: string, newStatus: TaskStatus) => {
    setTasks(tasks.map((t) => t.id === id ? { ...t, status: newStatus } : t));
  };

  return {
    tasks,
    filteredTasks: filteredAndSortedTasks,
    isLoaded,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    activeTab,
    setActiveTab,
    activeUser,
    setActiveUser,
    viewMode,
    setViewMode,
    addTask,
    updateTask,
    deleteTask,
    moveTaskStatus
  };
}
