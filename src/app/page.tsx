
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
import Image from "next/image";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-sm font-bold text-blue-500/50 uppercase tracking-[0.2em] animate-pulse">Initializing Harley OS...</p>
        </div>
      </div>
    );
  }

  // Gradient background based on active user
  const pageGradient = activeUser === 'Owen' 
    ? "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-50 to-white dark:from-blue-950 dark:via-slate-950 dark:to-black"
    : "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-50 to-white dark:from-emerald-950 dark:via-slate-950 dark:to-black";

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-1000 font-body pb-20",
      pageGradient
    )}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 group">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/40 transition-all duration-500"></div>
              <Image 
                src="https://i.ibb.co/LWHWb1d/Untitled-2.png" 
                alt="Harley Logo" 
                fill 
                className="object-contain relative z-10"
              />
            </div>
            <div>
              <h1 className="text-4xl font-black font-headline text-slate-900 dark:text-white tracking-tighter uppercase italic">
                FocusFlow
              </h1>
              <p className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mt-0.5">
                POWERED BY HARLEY: WORK SMARTER
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user?.isAnonymous === false ? (
              <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-2xl border dark:border-slate-800">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{user.email}</span>
                  <span className="text-[8px] text-blue-500 flex items-center gap-1 font-black uppercase tracking-widest"><RefreshCw className="h-2 w-2" /> Synced</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => signOut(auth)} className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsAuthOpen(true)}
                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 transition-all font-bold text-xs uppercase tracking-widest"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-2" /> Cloud Sync
              </Button>
            )}

            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-xl h-10 w-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-blue-600" />}
            </Button>
            <Button 
              onClick={handleCreateNewTask}
              className="bg-slate-900 dark:bg-blue-600 hover:scale-105 active:scale-95 text-white font-black uppercase tracking-widest text-xs rounded-xl px-8 h-10 shadow-xl shadow-blue-500/20 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" /> New Node
            </Button>
          </div>
        </header>

        <UserStats 
          activeUser={activeUser} 
          streaks={userStreaks} 
          progress={userProgress} 
        />

        <div className="flex flex-col items-center mb-12">
          <Tabs value={activeUser} onValueChange={(val) => setActiveUser(val as any)} className="w-full max-w-sm">
            <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
              {USER_OPTIONS.map((userName) => {
                const count = userCounts[userName] || 0;
                const streak = userStreaks[userName] || 0;
                const isActive = activeUser === userName;
                
                return (
                  <TabsTrigger 
                    key={userName} 
                    value={userName}
                    className={cn(
                      "relative rounded-xl font-black uppercase tracking-[0.2em] transition-all h-12 text-[10px]",
                      userName === 'Owen' && "data-[state=active]:bg-blue-900 data-[state=active]:text-white shadow-blue-900/20",
                      userName === 'Lucy' && "data-[state=active]:bg-emerald-900 data-[state=active]:text-white shadow-emerald-900/20"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span>{userName}</span>
                      {streak > 0 && (
                        <span className={cn(
                          "text-[8px] flex items-center gap-0.5 mt-0.5",
                          isActive ? "text-white/80" : "text-orange-500"
                        )}>
                          <Flame className="h-2 w-2 fill-current" /> {streak}d
                        </span>
                      )}
                    </div>
                    {count > 0 && (
                      <span className={cn(
                        "absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-lg text-[9px] font-black border",
                        isActive ? "bg-white text-slate-900 border-white" : "bg-slate-900 text-white border-slate-700",
                        isActive && userName === 'Owen' && "text-blue-950",
                        isActive && userName === 'Lucy' && "text-emerald-950"
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

        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 dark:text-blue-400">Temporal Frames</span>
              </div>
              <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl inline-flex items-center">
                {TAB_OPTIONS.map((tab) => {
                  const count = tabCounts[tab] || 0;
                  const isActive = activeTab === tab && viewMode !== 'diary';
                  
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "relative px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all min-w-[120px]",
                        isActive ? "bg-slate-900 dark:bg-blue-600 text-white shadow-lg scale-105 z-10" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                        viewMode === 'diary' && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      <span>{tab}</span>
                      {count > 0 && (
                        <span className={cn(
                          "absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-md text-[8px] font-black border",
                          isActive ? "bg-white text-slate-900 border-white" : "bg-blue-600 text-white border-blue-400/20"
                        )}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center h-12">
              <button 
                onClick={() => setViewMode('list')}
                title="Protocol List"
                className={cn("p-2.5 rounded-xl transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
              >
                <LayoutList className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('board')}
                title="Strategic Board"
                className={cn("p-2.5 rounded-xl transition-all", viewMode === 'board' ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('diary')}
                title="Temporal Chronicle"
                className={cn("p-2.5 rounded-xl transition-all", viewMode === 'diary' ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
              >
                <CalendarRange className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-1 flex-col md:flex-row items-center gap-4 w-full lg:max-w-4xl">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Query system nodes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200 dark:border-slate-800 rounded-2xl text-[13px] font-medium"
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
                  <SelectTrigger className="h-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200 dark:border-slate-800 rounded-2xl md:min-w-[180px] text-[11px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5 text-blue-500" />
                      <SelectValue placeholder="System Filter" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Protocols</SelectItem>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowPastCompleted(!showPastCompleted)}
                  className={cn(
                    "h-12 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest",
                    showPastCompleted ? "bg-blue-500 text-white border-blue-500 shadow-lg" : "bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200 dark:border-slate-800"
                  )}
                >
                  <History className="h-4 w-4 mr-2" />
                  {showPastCompleted ? "Purge Archive" : "Access Archive"}
                </Button>
              </div>
            </div>
          </div>

          <main className="pt-6 min-h-[600px]">
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
