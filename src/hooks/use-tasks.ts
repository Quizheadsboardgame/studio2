'use client';

import { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskTab, TaskUser, TaskRecurrence, PRIORITY_ORDER } from '@/types/task';
import { 
  useUser, 
  useFirestore, 
  useAuth,
  useCollection, 
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  initiateAnonymousSignIn
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDays, addWeeks, addMonths, parseISO, format } from 'date-fns';

export function useTasks() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [activeTab, setActiveTab] = useState<TaskTab>('Today');
  const [activeUser, setActiveUser] = useState<TaskUser>('Owen');
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'diary'>('list');

  // Automatically sign in anonymously if not logged in (to enable basic firestore usage)
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // Sync tasks from Firestore
  const tasksQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'tasks');
  }, [db, user]);

  const { data: firestoreTasks, isLoading: isTasksLoading } = useCollection<Task>(tasksQuery);

  const tasks = firestoreTasks || [];

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        
        // In diary view, we show tasks for the whole week, so we skip the tab filter
        const matchesTab = viewMode === 'diary' ? true : task.tab === activeTab;
        
        const matchesUser = task.owner === activeUser;
        return matchesSearch && matchesStatus && matchesTab && matchesUser;
      })
      .sort((a, b) => {
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [tasks, searchQuery, statusFilter, activeTab, activeUser, viewMode]);

  const addTask = () => {
    if (!db || !user || !tasksQuery) return;
    
    const now = new Date().toISOString();
    const newTaskData = {
      name: 'New Task',
      status: 'Incomplete' as TaskStatus,
      priority: 'Medium' as any,
      dueDate: now.split('T')[0],
      notes: '',
      tab: activeTab,
      owner: activeUser,
      recurrence: 'None' as TaskRecurrence,
      createdAt: now,
      updatedAt: now,
      userId: user.uid // Denormalized for security rules as per backend.json
    };
    
    addDocumentNonBlocking(tasksQuery, newTaskData);
  };

  const updateTask = (updatedTask: Task) => {
    if (!db || !user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', updatedTask.id);
    updateDocumentNonBlocking(taskRef, { 
      ...updatedTask, 
      updatedAt: new Date().toISOString() 
    });
  };

  const deleteTask = (id: string) => {
    if (!db || !user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    deleteDocumentNonBlocking(taskRef);
  };

  const moveTaskStatus = (id: string, newStatus: TaskStatus) => {
    if (!db || !user || !tasksQuery) return;
    
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    
    // If moving to completed and is recurring, create a new task for the next instance
    if (newStatus === 'Completed' && task.recurrence && task.recurrence !== 'None') {
      let nextDate: Date;
      const currentDueDate = parseISO(task.dueDate);
      
      switch (task.recurrence) {
        case 'Daily':
          nextDate = addDays(currentDueDate, 1);
          break;
        case 'Weekly':
          nextDate = addWeeks(currentDueDate, 1);
          break;
        case 'Monthly':
          nextDate = addMonths(currentDueDate, 1);
          break;
        default:
          nextDate = currentDueDate;
      }

      const nextDueDateStr = format(nextDate, 'yyyy-MM-dd');
      const now = new Date().toISOString();
      
      const nextTaskData = {
        ...task,
        status: 'Incomplete' as TaskStatus,
        dueDate: nextDueDateStr,
        createdAt: now,
        updatedAt: now,
      };
      // remove the id so it gets a new one
      const { id: _, ...dataForNewTask } = nextTaskData;
      
      addDocumentNonBlocking(tasksQuery, dataForNewTask);
    }

    updateDocumentNonBlocking(taskRef, { 
      status: newStatus, 
      updatedAt: new Date().toISOString() 
    });
  };

  return {
    tasks,
    filteredTasks: filteredAndSortedTasks,
    isLoaded: !isUserLoading && !isTasksLoading,
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
