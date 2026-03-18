
"use client";

import * as React from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useUser, useAuth } from "@/firebase";
import { TaskDialog } from "@/components/task-dialog";
import { AuthDialog } from "@/components/auth-dialog";
import { TaskListView } from "@/components/task-list-view";
import { TaskBoardView } from "@/components/task-board-view";
import { TaskDiaryView } from "@/components/task-diary-view";
import { UserStats } from "@/components/user-stats";
import { Task, TAB_OPTIONS, STATUS_OPTIONS, USER_OPTIONS, TaskTab, TaskUser } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  LayoutList, 
  LayoutGrid, 
  CalendarRange,
  Moon, 
  Sun, 
  Filter,
  CheckCircle2,
  Loader2,
  RefreshCw,
  LogOut,
  History,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut } from "firebase/auth";
import { addDays, format } from "date-fns";

export default function Home() {
  const { user } = useUser();
  const auth = useAuth();
  const {
    filteredTasks,
    tabCounts,
    userCounts,
    userStreaks,
    userProgress,
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
    updateTask,
    deleteTask,
    moveTaskStatus,
    moveTaskDate,
    showPastCompleted,
    setShowPastCompleted,
    todayStr,
    tomorrowStr
  } = useTasks();

  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);

  // Automatically switch to dark mode for Owen
  React.useEffect(() => {
    if (activeUser === 'Owen') {
      setIsDarkMode(true);
    }
  }, [activeUser]);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleCreateNewTask = () => {
    if (!user || !todayStr) return;
    
    let defaultDueDate = todayStr;
    if (activeTab === 'Tomorrow') defaultDueDate = tomorrowStr;
    else if (activeTab === 'Later') defaultDueDate = format(addDays(new Date(), 2), 'yyyy-MM-dd');

    const template: Task = {
      id: 'new',
      name: '',
      status: 'Incomplete',
      priority: 'Medium',
      dueDate: defaultDueDate,
      notes: '',
      tab: activeTab,
      owner: activeUser,
      createdBy: activeUser,
      recurrence: 'None',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user.uid,
      startTime: '',
      endTime: ''
    };
    setEditingTask(template);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">Waking up FocusFlow...</p>
        </div>
      </div>
    );
  }

  const userBgTint = {
    'Owen': 'bg-blue-950/5 dark:bg-blue-900/10',
    'Lucy': 'bg-emerald-950/5 dark:bg-emerald-900/10'
  }[activeUser];

  return (
    <div className={cn(
      "min-h-screen transition-all duration-700 font-body pb-20",
      userBgTint || "bg-slate-50 dark:bg-slate-900"
    )}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold font-headline text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <CheckCircle2 className="text-blue-600 h-8 w-8" />
              FocusFlow
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Organize your time, master your tasks.</p>
          </div>

          <div className="flex items-center gap-3">
            {user?.isAnonymous === false ? (
              <div className="flex items-center gap-2 mr-2">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{user.email}</span>
                  <span className="text-[10px] text-green-500 flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Synced</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => signOut(auth)} title="Log Out">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsAuthOpen(true)}
                className="rounded-full border-blue-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Sync Across Devices
              </Button>
            )}

            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full h-10 w-10 shadow-sm"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button 
              onClick={handleCreateNewTask}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 shadow-lg shadow-blue-600/20"
            >
              <Plus className="h-5 w-5 mr-1" /> New Task
            </Button>
          </div>
        </header>

        <UserStats 
          activeUser={activeUser} 
          streaks={userStreaks} 
          progress={userProgress} 
        />

        <div className="flex flex-col items-center mb-10">
          <Tabs value={activeUser} onValueChange={(val) => setActiveUser(val as any)} className="w-full max-w-sm">
            <TabsList className="grid w-full grid-cols-2 h-16 p-1 bg-white dark:bg-slate-800 shadow-lg border dark:border-slate-700 rounded-2xl">
              {USER_OPTIONS.map((userName) => {
                const count = userCounts[userName] || 0;
                const streak = userStreaks[userName] || 0;
                const isActive = activeUser === userName;
                
                return (
                  <TabsTrigger 
                    key={userName} 
                    value={userName}
                    className={cn(
                      "relative rounded-xl font-bold transition-all data-[state=active]:text-white h-14",
                      userName === 'Owen' && "data-[state=active]:bg-blue-900",
                      userName === 'Lucy' && "data-[state=active]:bg-emerald-900"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center gap-0">
                      <span className="relative z-10 text-base">{userName}</span>
                      {streak > 0 && (
                        <span className={cn(
                          "text-[10px] flex items-center gap-0.5",
                          isActive ? "text-white" : "text-orange-500"
                        )}>
                          <Flame className="h-3 w-3 fill-current" /> {streak}d
                        </span>
                      )}
                    </div>
                    {count > 0 && (
                      <span className={cn(
                        "absolute -top-2 -right-2 h-6 min-w-[24px] px-2 flex items-center justify-center rounded-full text-[11px] font-black border-2",
                        isActive ? "bg-white border-white" : "bg-slate-900 text-white border-white dark:border-slate-800",
                        isActive && userName === 'Owen' && "text-blue-900",
                        isActive && userName === 'Lucy' && "text-emerald-900"
                      )}>
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Time Frames</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border dark:border-slate-700 inline-flex items-center gap-1">
                {TAB_OPTIONS.map((tab) => {
                  const count = tabCounts[tab] || 0;
                  const isActive = activeTab === tab && viewMode !== 'diary';
                  
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "relative px-6 py-2.5 text-sm font-bold rounded-lg transition-all min-w-[110px]",
                        isActive ? "bg-blue-600 text-white shadow-md scale-105" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50",
                        viewMode === 'diary' && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span>{tab}</span>
                      {count > 0 && (
                        <span className={cn(
                          "absolute -top-1.5 -right-1.5 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold border-2",
                          isActive ? "bg-white text-blue-600 border-blue-600" : "bg-blue-600 text-white border-white dark:border-slate-800"
                        )}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border dark:border-slate-700 flex items-center h-12">
              <button 
                onClick={() => setViewMode('list')}
                title="List View"
                className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-slate-100 dark:bg-slate-700 text-blue-600" : "text-slate-400")}
              >
                <LayoutList className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('board')}
                title="Board View"
                className={cn("p-2 rounded-lg transition-all", viewMode === 'board' ? "bg-slate-100 dark:bg-slate-700 text-blue-600" : "text-slate-400")}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('diary')}
                title="Diary View"
                className={cn("p-2 rounded-lg transition-all", viewMode === 'diary' ? "bg-slate-100 dark:bg-slate-700 text-blue-600" : "text-slate-400")}
              >
                <CalendarRange className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-1 flex-col md:flex-row items-center gap-3 w-full lg:max-w-3xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search tasks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
                  <SelectTrigger className="h-11 bg-white dark:bg-slate-800 border-slate-200 rounded-xl md:min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5 text-slate-400" />
                      <SelectValue placeholder="All Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowPastCompleted(!showPastCompleted)}
                  className={cn(
                    "h-11 rounded-xl px-4",
                    showPastCompleted ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600" : "bg-white dark:bg-slate-800"
                  )}
                >
                  <History className="h-4 w-4 mr-2" />
                  {showPastCompleted ? "Hide Past Done" : "Show Past Done"}
                </Button>
              </div>
            </div>
          </div>

          <main className="pt-4 min-h-[600px]">
            {viewMode === 'list' ? (
              <TaskListView 
                tasks={filteredTasks} 
                onEdit={setEditingTask} 
                onDelete={deleteTask}
                onStatusChange={moveTaskStatus}
                onMoveDate={moveTaskDate}
              />
            ) : viewMode === 'board' ? (
              <TaskBoardView 
                tasks={filteredTasks} 
                onEdit={setEditingTask} 
                onDelete={deleteTask}
                onStatusChange={moveTaskStatus}
                onMoveDate={moveTaskDate}
              />
            ) : (
              <TaskDiaryView 
                tasks={filteredTasks} 
                onEdit={setEditingTask} 
                onDelete={deleteTask}
                onStatusChange={moveTaskStatus}
                onMoveDate={moveTaskDate}
              />
            )}
          </main>
        </div>
      </div>

      <TaskDialog 
        task={editingTask} 
        isOpen={!!editingTask} 
        onClose={() => setEditingTask(null)} 
        onSave={updateTask}
      />

      <AuthDialog 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </div>
  );
}
