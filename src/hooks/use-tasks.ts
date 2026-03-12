'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  const [showPastCompleted, setShowPastCompleted] = useState(false);

  const [todayStr, setTodayStr] = useState<string>('');
  const [tomorrowStr, setTomorrowStr] = useState<string>('');

  const syncRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const today = new Date();
    setTodayStr(format(today, 'yyyy-MM-dd'));
    setTomorrowStr(format(addDays(today, 1), 'yyyy-MM-dd'));
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const tasksQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'tasks');
  }, [db, user]);

  const { data: firestoreTasks, isLoading: isTasksLoading } = useCollection<Task>(tasksQuery);
  const tasks = firestoreTasks || [];

  useEffect(() => {
    if (!todayStr || !tomorrowStr || !user || !db || isTasksLoading || tasks.length === 0) return;

    tasks.forEach(task => {
      const syncKey = `${task.id}-${task.dueDate}`;
      if (syncRef.current.has(syncKey)) return;

      let correctTab: TaskTab = 'Later';
      if (task.dueDate === todayStr || task.dueDate < todayStr) {
        correctTab = 'Today';
      } else if (task.dueDate === tomorrowStr) {
        correctTab = 'Tomorrow';
      }

      if (task.tab !== correctTab) {
        syncRef.current.add(syncKey);
        const taskRef = doc(db, 'users', user.uid, 'tasks', task.id);
        updateDocumentNonBlocking(taskRef, { 
          tab: correctTab, 
          updatedAt: new Date().toISOString() 
        });
      }
    });
  }, [tasks, todayStr, tomorrowStr, user, db, isTasksLoading]);

  const filteredAndSortedTasks = useMemo(() => {
    const seen = new Set<string>();

    return tasks
      .filter((task) => {
        const duplicateKey = `${task.name.trim().toLowerCase()}-${task.dueDate}-${task.owner}-${task.status}`;
        if (seen.has(duplicateKey)) return false;
        seen.add(duplicateKey);

        const isPastCompleted = task.status === 'Completed' && task.dueDate < todayStr;
        if (!showPastCompleted && isPastCompleted) return false;

        const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        
        let matchesTab = task.tab === activeTab;
        if (viewMode === 'diary') matchesTab = true;
        
        const matchesUser = task.owner === activeUser;
        return matchesSearch && matchesStatus && matchesTab && matchesUser;
      })
      .sort((a, b) => {
        const aStatus = a.status === 'Completed' ? 1 : 0;
        const bStatus = b.status === 'Completed' ? 1 : 0;
        if (aStatus !== bStatus) return aStatus - bStatus;

        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;

        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [tasks, searchQuery, statusFilter, activeTab, activeUser, viewMode, todayStr, tomorrowStr, showPastCompleted]);

  const getNewTaskTemplate = (): Task | null => {
    if (!todayStr || !user) return null;
    const now = new Date();
    let defaultDueDate = todayStr;
    if (activeTab === 'Tomorrow') defaultDueDate = tomorrowStr;
    else if (activeTab === 'Later') defaultDueDate = format(addDays(now, 2), 'yyyy-MM-dd');
    
    return {
      id: 'new',
      name: '',
      status: 'Incomplete' as TaskStatus,
      priority: 'Medium' as any,
      dueDate: defaultDueDate,
      notes: '',
      tab: activeTab,
      owner: activeUser,
      createdBy: activeUser,
      recurrence: 'None' as TaskRecurrence,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      userId: user.uid 
    };
  };

  const updateTask = (updatedTask: Task) => {
    if (!db || !user || !tasksQuery) return;
    const now = new Date().toISOString();

    if (updatedTask.id === 'new') {
      const { id, ...newTaskData } = { ...updatedTask, updatedAt: now };
      addDocumentNonBlocking(tasksQuery, newTaskData);
    } else {
      const taskRef = doc(db, 'users', user.uid, 'tasks', updatedTask.id);
      updateDocumentNonBlocking(taskRef, { 
        ...updatedTask, 
        updatedAt: now 
      });
    }
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
        case 'Daily': nextDate = addDays(currentDueDate, 1); break;
        case 'Monday to Friday':
          const day = getDay(currentDueDate);
          if (day === 5) nextDate = addDays(currentDueDate, 3);
          else if (day === 6) nextDate = addDays(currentDueDate, 2);
          else nextDate = addDays(currentDueDate, 1);
          break;
        case 'Weekly': nextDate = addWeeks(currentDueDate, 1); break;
        case 'Monthly': nextDate = addMonths(currentDueDate, 1); break;
        default: nextDate = currentDueDate;
      }
      const nextDueDateStr = format(nextDate, 'yyyy-MM-dd');
      const now = new Date().toISOString();
      const alreadyExists = tasks.some(t => 
        t.name.trim().toLowerCase() === task.name.trim().toLowerCase() && 
        t.dueDate === nextDueDateStr && t.owner === task.owner && t.status !== 'Completed'
      );
      if (!alreadyExists) {
        const { id: _, ...dataForNewTask } = { ...task, status: 'Incomplete' as TaskStatus, dueDate: nextDueDateStr, createdAt: now, updatedAt: now };
        addDocumentNonBlocking(tasksQuery, dataForNewTask);
      }
    }
    updateDocumentNonBlocking(taskRef, { status: newStatus, updatedAt: new Date().toISOString() });
  };

  const moveTaskDate = (id: string) => {
    if (!db || !user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const currentDueDate = parseISO(task.dueDate);
    const nextDate = addDays(currentDueDate, 1);
    const nextDateStr = format(nextDate, 'yyyy-MM-dd');
    let newTab: TaskTab = 'Later';
    if (nextDateStr === todayStr) newTab = 'Today';
    else if (nextDateStr === tomorrowStr) newTab = 'Tomorrow';
    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    updateDocumentNonBlocking(taskRef, { dueDate: nextDateStr, tab: newTab, updatedAt: new Date().toISOString() });
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
    getNewTaskTemplate,
    updateTask,
    deleteTask,
    moveTaskStatus,
    moveTaskDate,
    showPastCompleted,
    setShowPastCompleted
  };
}