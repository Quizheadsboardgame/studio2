'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, TaskTab, TaskUser, PRIORITY_ORDER } from '@/types/task';
import { 
  useUser, 
  useFirestore, 
  useAuth,
  useCollection, 
  useDoc,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
  initiateAnonymousSignIn
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDays, parseISO, format, getDay, addWeeks, addMonths } from 'date-fns';

const isActioned = (status: TaskStatus) => status === 'Completed' || status === 'Awaiting Information';
const isOutstanding = (status: TaskStatus) => status === 'Incomplete' || status === 'Follow up Required';

export function useTasks() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [activeTab, setActiveTab] = useState<TaskTab>('Today');
  const [activeUser, setActiveUser] = useState<TaskUser>('Daily chart');
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

  // Profiles management
  const profilesDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userData, isLoading: isUserDocLoading } = useDoc(profilesDocRef);
  const profiles = useMemo(() => {
    if (userData?.profiles && Array.isArray(userData.profiles)) {
      return userData.profiles as string[];
    }
    return ['Daily chart'];
  }, [userData]);

  useEffect(() => {
    if (!profiles.includes(activeUser) && profiles.length > 0) {
      setActiveUser(profiles[0]);
    }
  }, [profiles, activeUser]);

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
    if (!todayStr || profiles.length === 0) return { tabCounts: {}, userCounts: {}, userProgress: {} };

    const tabCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    const userProgress: Record<string, any> = {};

    const tasksByUser = tasks.reduce((acc, t) => {
      if (!acc[t.owner]) acc[t.owner] = [];
      acc[t.owner].push(t);
      return acc;
    }, {} as Record<string, Task[]>);

    profiles.forEach(userName => {
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
    });

    return { tabCounts, userCounts, userProgress };
  }, [tasks, activeUser, todayStr, profiles]);

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
      const { id: _, ...data } = { 
        ...updatedTask, 
        updatedAt: now 
      };
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

  const saveProfiles = (newProfiles: string[]) => {
    if (!profilesDocRef) return;
    setDocumentNonBlocking(profilesDocRef, { profiles: newProfiles, id: user?.uid }, { merge: true });
  };

  const addProfile = (name: string) => {
    if (profiles.includes(name)) return;
    saveProfiles([...profiles, name]);
  };

  const renameProfile = (oldName: string, newName: string) => {
    if (profiles.includes(newName)) return;
    const newProfiles = profiles.map(p => p === oldName ? newName : p);
    saveProfiles(newProfiles);
    
    // Update all tasks associated with this profile
    tasks.forEach(task => {
      if (task.owner === oldName) {
        updateDocumentNonBlocking(doc(db!, 'users', user!.uid, 'tasks', task.id), { owner: newName });
      }
    });

    if (activeUser === oldName) setActiveUser(newName);
  };

  const removeProfile = (name: string) => {
    if (profiles.length <= 1) return;
    const newProfiles = profiles.filter(p => p !== name);
    saveProfiles(newProfiles);
    if (activeUser === name) setActiveUser(newProfiles[0]);
  };

  return {
    tasks, filteredTasks,
    profiles, addProfile, renameProfile, removeProfile,
    tabCounts: stats.tabCounts,
    userCounts: stats.userCounts,
    userProgress: stats.userProgress,
    isLoaded: !isUserLoading && !isTasksLoading && !isUserDocLoading && todayStr !== '',
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
