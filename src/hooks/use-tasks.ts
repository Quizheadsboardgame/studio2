
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskTab, TaskUser, PRIORITY_ORDER } from '@/types/task';
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

export function useTasks() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [activeTab, setActiveTab] = useState<TaskTab>('Today');
  const [activeUser, setActiveUser] = useState<TaskUser>('Owen');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

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

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        const matchesTab = task.tab === activeTab;
        const matchesUser = task.owner === activeUser;
        return matchesSearch && matchesStatus && matchesTab && matchesUser;
      })
      .sort((a, b) => {
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [tasks, searchQuery, statusFilter, activeTab, activeUser]);

  const addTask = () => {
    if (!db || !user || !tasksQuery) return;
    
    const newTaskData = {
      name: 'New Task',
      status: 'Incomplete' as TaskStatus,
      priority: 'Medium' as any,
      dueDate: new Date().toISOString().split('T')[0],
      notes: '',
      tab: activeTab,
      owner: activeUser,
      createdAt: Date.now(),
      userId: user.uid // Denormalized for security rules as per backend.json
    };
    
    addDocumentNonBlocking(tasksQuery, newTaskData);
  };

  const updateTask = (updatedTask: Task) => {
    if (!db || !user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', updatedTask.id);
    updateDocumentNonBlocking(taskRef, { ...updatedTask, updatedAt: Date.now() });
  };

  const deleteTask = (id: string) => {
    if (!db || !user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    deleteDocumentNonBlocking(taskRef);
  };

  const moveTaskStatus = (id: string, newStatus: TaskStatus) => {
    if (!db || !user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    updateDocumentNonBlocking(taskRef, { status: newStatus, updatedAt: Date.now() });
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
