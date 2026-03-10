# **App Name**: Time-Based Task Manager

## Core Features:

- Task Creation: Allows users to create new tasks with default properties such as 'New Task' and 'Incomplete' status.
- Task Display (List & Board Views): Presents tasks in two distinct views: a traditional list view and a Kanban-style board view organized by status.
- Task Editing: Enables users to modify various task details directly, including task name, status, priority, due date, notes, and the tab it belongs to.
- Task Deletion: Provides a mechanism for users to remove individual tasks permanently.
- Task Search: Allows users to search for tasks by keywords present in their task description.
- Task Filtering by Status: Users can filter the displayed tasks based on their completion status (e.g., Incomplete, In Progress, Needs Action, Completed).
- Task Sorting: Automatically sorts tasks based on priority (High, Medium, Low) and then by their due date, ensuring important tasks are shown first.
- Tab-based Task Organization: Organizes tasks into distinct time-based tabs ('Today', 'Tomorrow', 'Next Week') for better management and focus.
- Toggle View Mode: Switches between a linear list view and a visual board (Kanban) view for task management.
- Dark Mode Toggle: Allows users to switch the application's theme between a light and a dark background for improved viewing comfort.
- Drag and Drop Task Management: In the board view, users can change a task's status by dragging and dropping task cards between different status columns.
- Local Task Persistence: Saves and loads all tasks from the browser's local storage, ensuring tasks are remembered across sessions.

## Style Guidelines:

- Main background: Light slate (`#f1f5f9`, bg-slate-100) by default, with a toggle to a dark slate (`#0f172a`, bg-slate-900) for dark mode.
- Interactive elements/accents: A vibrant blue (`#2563eb`, bg-blue-600 and `#3b82f6` for active tabs) for buttons and active states.
- Success/Creation: A strong green (`#22c55e`, bg-green-600) for the 'New Task' button.
- Danger/Deletion: A bright red (`#ef4444`, bg-red-500) for delete actions.
- Card backgrounds: Clean white (`#ffffff`, bg-white) for task cards and column containers.
- Headings: Bold (`font-bold`) and larger text size (`text-2xl`) for main titles, using the system's default sans-serif font for clarity and modernity.
- Body text and inputs: Smaller, functional sans-serif text (`text-sm`) for task details, inputs, and dropdowns, prioritizing readability.
- Overall Structure: Content is centered within a maximum width container (`max-w-7xl mx-auto`) for consistent presentation across screen sizes.
- Spacing: Uses a consistent spacing system with `gap-2`, `gap-3`, and `space-y-3` for clear separation of elements and tasks.
- Task Views: Employs a flexible box (`flex`) layout for the list view and a responsive grid (`grid md:grid-cols-4`) for the board view, adapting to different screen sizes.
- Element Styling: Task cards and columns feature rounded corners (`rounded`), subtle shadows (`shadow`), and internal padding (`p-3`) for a clean, modern aesthetic.
- Tab Transitions: Subtle `transition: all 0.2s` for tab buttons, providing a smooth visual feedback when switching tabs.