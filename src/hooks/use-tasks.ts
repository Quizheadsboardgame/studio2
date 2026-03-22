
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, TaskTab, TaskUser, PRIORITY_ORDER, USER_OPTIONS } from '@/types/task';
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
import { addDays, addWeeks, addMonths, parseISO, format, getDay, subDays, isBefore, startOfDay } from 'date-fns';

const STREAK_START_DATE = '2026-03-11';

const isActioned = (status: TaskStatus) => status === 'Completed' || status === 'Awaiting Information';
const isOutstanding = (status: TaskStatus) => status === 'Incomplete' || status === 'Follow up Required';

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
    const dayOfWeek = getDay(today);
    
    setTodayStr(format(today, 'yyyy-MM-dd'));
    
    let nextWorkingDay = addDays(today, 1);
    if (dayOfWeek === 5) nextWorkingDay = addDays(today, 3);
    else if (dayOfWeek === 6) nextWorkingDay = addDays(today, 2);
    else if (dayOfWeek === 0) nextWorkingDay = addDays(today, 1);
    
    setTomorrowStr(format(nextWorkingDay, 'yyyy-MM-dd'));
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
  const tasks = useMemo(() => firestoreTasks || [], [firestoreTasks]);

  useEffect(() => {
    if (!todayStr || !tomorrowStr || !user || !db || isTasksLoading || tasks.length === 0) return;

    tasks.forEach(task => {
      const syncKey = `${task.id}-${task.dueDate}`;
      if (syncRef.current.has(syncKey)) return;

      let correctTab: TaskTab = 'Later';
      if (task.dueDate <= todayStr) correctTab = 'Today';
      else if (task.dueDate === tomorrowStr) correctTab = 'Tomorrow';

      if (task.tab !== correctTab) {
        syncRef.current.add(syncKey);
        const taskRef = doc(db, 'users', user.uid, 'tasks', task.id);
        updateDocumentNonBlocking(taskRef, { tab: correctTab, updatedAt: new Date().toISOString() });
      }
    });
  }, [tasks, todayStr, tomorrowStr, user, db, isTasksLoading]);

  const stats = useMemo(() => {
    if (!todayStr) return { tabCounts: {}, userCounts: {}, userStreaks: {}, userProgress: {} };

    const tabCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    const userStreaks: Record<string, number> = {};
    const userProgress: Record<string, any> = {};

    const tasksByUser = tasks.reduce((acc, t) => {
      if (!acc[t.owner]) acc[t.owner] = [];
      acc[t.owner].push(t);
      return acc;
    }, {} as Record<string, Task[]>);

    USER_OPTIONS.forEach(userName => {
      const userTasks = tasksByUser[userName] || [];
      
      if (userName === activeUser) {
        ['Today', 'Tomorrow', 'Later'].forEach(tab => {
          tabCounts[tab] = userTasks.filter(t => t.tab === tab && isOutstanding(t.status)).length;
        });
      }

      userCounts[userName] = userTasks.filter(t => isOutstanding(t.status)).length;

      const workloadToday = userTasks.filter(t => 
        t.dueDate === todayStr || (t.dueDate < todayStr && t.status !== 'Completed')
      );
      
      const actionedCount = workloadToday.filter(t => isActioned(t.status)).length;
      const total = workloadToday.length;
      
      userProgress[userName] = {
        completed: actionedCount,
        total,
        percentage: total > 0 ? Math.round((actionedCount / total) * 100) : 100,
        remaining: workloadToday.filter(t => isOutstanding(t.status)).length
      };

      let streak = 0;
      const startDate = parseISO(STREAK_START_DATE);
      const todayObj = startOfDay(new Date());
      let offset = 1;
      let daysChecked = 0;
      
      while (daysChecked < 30) {
        const checkDate = subDays(todayObj, offset);
        if (isBefore(checkDate, startDate)) break;
        
        const dayOfWeek = getDay(checkDate);
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { 
          const dateStr = format(checkDate, 'yyyy-MM-dd');
          const dayTasks = userTasks.filter(t => t.dueDate === dateStr);
          if (dayTasks.length === 0 || dayTasks.every(t => isActioned(t.status))) {
            streak++;
          } else {
            break;
          }
        }
        offset++;
        daysChecked++;
      }
      
      if (userProgress[userName].total > 0 && userProgress[userName].remaining === 0) {
        streak++;
      }
      userStreaks[userName] = streak;
    });

    return { tabCounts, userCounts, userStreaks, userProgress };
  }, [tasks, activeUser, todayStr]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (!showPastCompleted && task.status === 'Completed' && task.dueDate < todayStr) return false;
        
        const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        const matchesTab = viewMode === 'diary' || task.tab === activeTab;
        const matchesUser = task.owner === activeUser;
        
        return matchesSearch && matchesStatus && matchesTab && matchesUser;
      })
      .sort((a, b) => {
        const aScore = isActioned(a.status) ? 1 : 0;
        const bScore = isActioned(b.status) ? 1 : 0;
        if (aScore !== bScore) return aScore - bScore;
        
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks, searchQuery, statusFilter, activeTab, activeUser, viewMode, todayStr, showPastCompleted]);

  const updateTask = (updatedTask: Task) => {
    if (!db || !user || !tasksQuery) return;
    const now = new Date().toISOString();
    if (updatedTask.id === 'new') {
      const { id: _, ...data } = { ...updatedTask, updatedAt: now };
      addDocumentNonBlocking(tasksQuery, data);
    } else {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'tasks', updatedTask.id), { ...updatedTask, updatedAt: now });
    }
  };

  const moveTaskStatus = (id: string, newStatus: TaskStatus) => {
    if (!db || !user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    if (newStatus === 'Completed' && task.recurrence && task.recurrence !== 'None') {
      let nextDate: Date;
      const current = parseISO(task.dueDate);
      switch (task.recurrence) {
        case 'Daily': nextDate = addDays(current, 1); break;
        case 'Monday to Friday':
          const d = getDay(current);
          nextDate = addDays(current, d === 5 ? 3 : d === 6 ? 2 : 1);
          break;
        case 'Weekly': nextDate = addWeeks(current, 1); break;
        case 'Monthly': nextDate = addMonths(current, 1); break;
        default: nextDate = current;
      }
      const nextDateStr = format(nextDate, 'yyyy-MM-dd');
      if (!tasks.some(t => t.name === task.name && t.dueDate === nextDateStr && t.owner === task.owner && t.status !== 'Completed')) {
        const { id: _, ...newData } = { ...task, status: 'Incomplete', dueDate: nextDateStr, createdAt: new Date().toISOString() };
        addDocumentNonBlocking(tasksQuery!, newData);
      }
    }
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'tasks', id), { status: newStatus, updatedAt: new Date().toISOString() });
    
    // Auto-reload the page as requested
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const moveTaskDate = (id: string) => {
    if (!db || !user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const current = parseISO(task.dueDate);
    const d = getDay(current);
    const next = addDays(current, d === 5 ? 3 : d === 6 ? 2 : 1);
    const nextStr = format(next, 'yyyy-MM-dd');
    let newTab: TaskTab = 'Later';
    if (nextStr === todayStr) newTab = 'Today';
    else if (nextStr === tomorrowStr) newTab = 'Tomorrow';
    updateDocumentNonBlocking(doc(db, 'users', user.uid, 'tasks', id), { dueDate: nextStr, tab: newTab, updatedAt: new Date().toISOString() });
  };

  const deleteTask = (id: string) => {
    if (!db || !user) return;
    deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'tasks', id));
  };

  return {
    tasks, filteredTasks,
    tabCounts: stats.tabCounts,
    userCounts: stats.userCounts,
    userStreaks: stats.userStreaks,
    userProgress: stats.userProgress,
    isLoaded: !isUserLoading && !isTasksLoading && todayStr !== '',
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    activeTab, setActiveTab,
    activeUser, setActiveUser,
    viewMode, setViewMode,
    updateTask, deleteTask, moveTaskStatus, moveTaskDate,
    showPastCompleted, setShowPastCompleted,
    todayStr, tomorrowStr
  };
}
