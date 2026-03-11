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
import { addDays, addWeeks, addMonths, parseISO, format, isBefore, startOfDay, isSameDay, getDay } from 'date-fns';

export function useTasks() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [activeTab, setActiveTab] = useState<TaskTab>('Today');
  const [activeUser, setActiveUser] = useState<TaskUser>('Owen');
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'diary'>('list');

  // Client-side dates to avoid hydration mismatch
  const [todayStr, setTodayStr] = useState<string>('');
  const [tomorrowStr, setTomorrowStr] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    setTodayStr(format(today, 'yyyy-MM-dd'));
    setTomorrowStr(format(addDays(today, 1), 'yyyy-MM-dd'));
  }, []);

  // Automatically sign in anonymously if not logged in
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

  /**
   * Automatic Tab Synchronization
   */
  useEffect(() => {
    if (!todayStr || !tomorrowStr || !user || !db || isTasksLoading || tasks.length === 0) return;

    tasks.forEach(task => {
      let correctTab: TaskTab = 'Next Week';
      
      if (task.dueDate === todayStr || task.dueDate < todayStr) {
        correctTab = 'Today';
      } else if (task.dueDate === tomorrowStr) {
        correctTab = 'Tomorrow';
      }

      if (task.tab !== correctTab) {
        const taskRef = doc(db, 'users', user.uid, 'tasks', task.id);
        updateDocumentNonBlocking(taskRef, { 
          tab: correctTab, 
          updatedAt: new Date().toISOString() 
        });
      }
    });
  }, [tasks, todayStr, tomorrowStr, user, db, isTasksLoading]);

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        
        // Tab Filtering logic
        // Non-recurring: exact tab match
        // Recurring: If Daily or Weekday, they appear in all future-relevant tabs
        const isRecurringTodayPlus = task.recurrence !== 'None';
        let matchesTab = task.tab === activeTab;
        
        if (isRecurringTodayPlus && viewMode !== 'diary') {
           // If it's a recurring task, we show it in its "next" tab, 
           // and if it's Daily/Weekday, it's effectively "due" in every tab 
           // after its start date.
           if (activeTab === 'Today' && (task.dueDate <= todayStr)) matchesTab = true;
           if (activeTab === 'Tomorrow' && (task.dueDate <= tomorrowStr)) matchesTab = true;
           if (activeTab === 'Next Week') matchesTab = true;
        }

        if (viewMode === 'diary') matchesTab = true;
        
        const matchesUser = task.owner === activeUser;
        return matchesSearch && matchesStatus && matchesTab && matchesUser;
      })
      .sort((a, b) => {
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [tasks, searchQuery, statusFilter, activeTab, activeUser, viewMode, todayStr, tomorrowStr]);

  const addTask = () => {
    if (!db || !user || !tasksQuery || !todayStr) return;
    
    const now = new Date();
    let defaultDueDate = todayStr;

    if (activeTab === 'Tomorrow') {
      defaultDueDate = tomorrowStr;
    } else if (activeTab === 'Next Week') {
      defaultDueDate = format(addDays(now, 2), 'yyyy-MM-dd');
    }
    
    const newTaskData = {
      name: 'New Task',
      status: 'Incomplete' as TaskStatus,
      priority: 'Medium' as any,
      dueDate: defaultDueDate,
      notes: '',
      tab: activeTab,
      owner: activeUser,
      recurrence: 'None' as TaskRecurrence,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      userId: user.uid 
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
    
    if (newStatus === 'Completed' && task.recurrence && task.recurrence !== 'None') {
      let nextDate: Date;
      const currentDueDate = parseISO(task.dueDate);
      
      switch (task.recurrence) {
        case 'Daily':
          nextDate = addDays(currentDueDate, 1);
          break;
        case 'Monday to Friday':
          const day = getDay(currentDueDate);
          // 5 is Friday, so next is Monday (add 3)
          // 6 is Saturday, so next is Monday (add 2)
          if (day === 5) nextDate = addDays(currentDueDate, 3);
          else if (day === 6) nextDate = addDays(currentDueDate, 2);
          else nextDate = addDays(currentDueDate, 1);
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
    isLoaded: !isUserLoading && !isTasksLoading && todayStr !== '',
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
