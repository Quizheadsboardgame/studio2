
"use client";

import * as React from "react";
import { useTasks } from "@/hooks/use-tasks";
import { TaskDialog } from "@/components/task-dialog";
import { TaskListView } from "@/components/task-list-view";
import { TaskBoardView } from "@/components/task-board-view";
import { Task, TAB_OPTIONS, STATUS_OPTIONS } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  LayoutList, 
  LayoutGrid, 
  Moon, 
  Sun, 
  Filter,
  CheckCircle2,
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const {
    filteredTasks,
    isLoaded,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    addTask,
    updateTask,
    deleteTask,
    moveTaskStatus
  } = useTasks();

  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Sync dark mode class
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300 font-body">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-headline text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <CheckCircle2 className="text-blue-600 h-8 w-8" />
              FocusFlow
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Organize your time, master your tasks.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full h-10 w-10 shadow-sm"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button 
              onClick={addTask}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-6 shadow-lg shadow-green-600/20"
            >
              <Plus className="h-5 w-5 mr-1" /> New Task
            </Button>
          </div>
        </header>

        {/* Navigation & Controls */}
        <div className="space-y-6">
          
          {/* Time Tabs */}
          <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border dark:border-slate-700 inline-flex items-center gap-1">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                  activeTab === tab 
                    ? "bg-blue-600 text-white shadow-md scale-105" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filters and View Toggles */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-1 flex-col md:flex-row items-center gap-3 w-full lg:max-w-2xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search tasks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:min-w-[180px]">
                  <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
                    <SelectTrigger className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
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
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border dark:border-slate-700 flex items-center">
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-slate-100 dark:bg-slate-700 text-blue-600" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
                title="List View"
              >
                <LayoutList className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('board')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'board' ? "bg-slate-100 dark:bg-slate-700 text-blue-600" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
                title="Board View"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="pt-4 min-h-[600px]">
            {viewMode === 'list' ? (
              <TaskListView 
                tasks={filteredTasks} 
                onEdit={setEditingTask} 
                onDelete={deleteTask}
                onStatusChange={moveTaskStatus}
              />
            ) : (
              <TaskBoardView 
                tasks={filteredTasks} 
                onEdit={setEditingTask} 
                onDelete={deleteTask}
                onStatusChange={moveTaskStatus}
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
    </div>
  );
}
