
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, TaskTab, TaskUser, TaskRecurrence, PRIORITY_ORDER, STATUS_OPTIONS, USER_OPTIONS } from '@/types/task';
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

/** 
 * Helper to identify if a task is "Actioned" (done/in progress for today).
 * As per request: "Awaiting Information" counts as progress/actioned.
 */
const isActioned = (status: TaskStatus) => status === 'Completed' || status === 'Awaiting Information';

/** 
 * Helper to identify if a task is "Outstanding" (needs to be started).
 * As per request: "Awaiting Information" is NOT outstanding/to-do.
 */
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

  // Initialize dates correctly to avoid hydration mismatch
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = getDay(today);
    
    setTodayStr(format(today, 'yyyy-MM-dd'));
    
    // Weekend-aware Tomorrow: Friday -> Monday, Saturday -> Monday, Sunday -> Monday
    let nextWorkingDay = addDays(today, 1);
    if (dayOfWeek === 5) { // Friday -> Monday
      nextWorkingDay = addDays(today, 3);
    } else if (dayOfWeek === 6) { // Saturday -> Monday
      nextWorkingDay = addDays(today, 2);
    } else if (dayOfWeek === 0) { // Sunday -> Monday
      nextWorkingDay = addDays(today, 1);
    }
    setTomorrowStr(format(nextWorkingDay, 'yyyy-MM-dd'));
  }, []);

  // Auth check
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

  // Automatic Tab Synchronization Logic
  useEffect(() => {
    if (!todayStr || !tomorrowStr || !user || !db || isTasksLoading || tasks.length === 0) return;

    tasks.forEach(task => {
      const syncKey = `${task.id}-${task.dueDate}`;
      if (syncRef.current.has(syncKey)) return;

      let correctTab: TaskTab = 'Later';
      if (task.dueDate <= todayStr) {
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

  // Consolidated Stats calculation
  const stats = useMemo(() => {
    if (!todayStr) return { tabCounts: {}, userCounts: {}, userStreaks: {}, userProgress: {} };

    const tabCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    const userStreaks: Record<string, number> = {};
    const userProgress: Record<string, any> = {};

    USER_OPTIONS.forEach(userName => {
      const userTasks = tasks.filter(t => t.owner === userName);
      
      // 1. Tab Counts for active user (only show outstanding tasks)
      if (userName === activeUser) {
        ['Today', 'Tomorrow', 'Later'].forEach(tab => {
          tabCounts[tab] = userTasks.filter(t => t.tab === tab && isOutstanding(t.status)).length;
        });
      }

      // 2. Total Outstanding User Counts (across all tabs)
      userCounts[userName] = userTasks.filter(t => isOutstanding(t.status)).length;

      // 3. Daily Progress (Based on the 'Today' tab to include overdue items)
      // Percentage calculation includes "Awaiting Information" as completed.
      const todayTabTasks = userTasks.filter(t => t.tab === 'Today');
      const actionedCount = todayTabTasks.filter(t => isActioned(t.status)).length;
      const total = todayTabTasks.length;
      userProgress[userName] = {
        completed: actionedCount,
        total,
        percentage: total > 0 ? Math.round((actionedCount / total) * 100) : 100,
        remaining: todayTabTasks.filter(t => isOutstanding(t.status)).length
      };

      // 4. Streak Calculation
      let streak = 0;
      const startDate = parseISO(STREAK_START_DATE);
      const todayObj = startOfDay(new Date());
      let offset = 1; 
      let daysChecked = 0;
      const MAX_LOOKBACK = 90;
      
      while (daysChecked < MAX_LOOKBACK) {
        const checkDate = subDays(todayObj, offset);
        if (isBefore(checkDate, startDate)) break;
        
        const dayOfWeek = getDay(checkDate);
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (!isWeekend) {
          const checkDateStr = format(checkDate, 'yyyy-MM-dd');
          const dayTasks = userTasks.filter(t => t.dueDate === checkDateStr);
          // A day is successful if all tasks for that date were actioned
          const isDaySuccessful = dayTasks.length === 0 || dayTasks.every(t => isActioned(t.status));
          
          if (isDaySuccessful) streak++;
          else break;
        }
        offset++;
        daysChecked++;
      }
      
      // Add current day if all today's tasks are actioned
      if (userProgress[userName].total > 0 && userProgress[userName].total === userProgress[userName].completed) {
        streak++;
      }
      userStreaks[userName] = streak;
    });

    return { tabCounts, userCounts, userStreaks, userProgress };
  }, [tasks, activeUser, todayStr]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Hide past completed tasks unless toggled on
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
        // Sort actioned tasks to the bottom
        const aStatusScore = isActioned(a.status) ? 1 : 0;
        const bStatusScore = isActioned(b.status) ? 1 : 0;
        if (aStatusScore !== bStatusScore) return aStatusScore - bStatusScore;

        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;

        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [tasks, searchQuery, statusFilter, activeTab, activeUser, viewMode, todayStr, showPastCompleted]);

  const updateTask = (updatedTask: Task) => {
    if (!db || !user || !tasksQuery) return;
    const now = new Date().toISOString();

    if (updatedTask.id === 'new') {
      const { id: _, ...newTaskData } = { ...updatedTask, updatedAt: now };
      // @ts-ignore
      addDocumentNonBlocking(tasksQuery, newTaskData);
    } else {
      const taskRef = doc(db, 'users', user.uid, 'tasks', updatedTask.id);
      updateDocumentNonBlocking(taskRef, { 
        ...updatedTask, 
        updatedAt: now 
      });
    }
  };

  const moveTaskStatus = (id: string, newStatus: TaskStatus) => {
    if (!db || !user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    
    // Recurrence logic
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
        const { id: _, ...dataForNewTask } = { ...task, status: 'Incomplete', dueDate: nextDueDateStr, createdAt: now, updatedAt: now };
        // @ts-ignore
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
    const dayOfWeek = getDay(currentDueDate);
    
    // Weekend-aware Jump: Fri -> Mon, Sat -> Mon
    let nextDate = addDays(currentDueDate, 1);
    if (dayOfWeek === 5) nextDate = addDays(currentDueDate, 3);
    else if (dayOfWeek === 6) nextDate = addDays(currentDueDate, 2);
    
    const nextDateStr = format(nextDate, 'yyyy-MM-dd');
    let newTab: TaskTab = 'Later';
    if (nextDateStr === todayStr) newTab = 'Today';
    else if (nextDateStr === tomorrowStr) newTab = 'Tomorrow';
    
    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    updateDocumentNonBlocking(taskRef, { 
      dueDate: nextDateStr, 
      tab: newTab, 
      updatedAt: new Date().toISOString() 
    });
  };

  const deleteTask = (id: string) => {
    if (!db || !user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    deleteDocumentNonBlocking(taskRef);
  };

  return {
    tasks,
    filteredTasks,
    tabCounts: stats.tabCounts,
    userCounts: stats.userCounts,
    userStreaks: stats.userStreaks,
    userProgress: stats.userProgress,
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
    updateTask,
    deleteTask,
    moveTaskStatus,
    moveTaskDate,
    showPastCompleted,
    setShowPastCompleted,
    todayStr,
    tomorrowStr
  };
}
