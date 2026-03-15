# FocusFlow - Time-Based Task Manager

Manage your tasks with ease using this intuitive, time-based dashboard. Built for Owen, Lucy, and Nick.

## Features

- **Time-Based Tabs:** Organize tasks into Today, Tomorrow, and Later.
- **Weekend-Aware Scheduling:** Moves to the next working day (Friday jumps to Monday).
- **Bi-directional Swiping:** Swipe left to complete, swipe right to delay.
- **Competition Leaderboard:** Track productivity with color-coded user themes (Owen: Blue, Lucy: Pink, Nick: Green).
- **Awaiting Information Status:** Tasks that have progress are excluded from "To Do" counts but count toward your daily completion percentage and streaks.
- **Follow up Required Status:** Professional labeling for tasks that need attention.
- **Auto-Cleanup:** Completed tasks from previous days are hidden by default (toggleable).
- **Recurring Tasks:** Supports Daily, Weekly, Monthly, and Mon-Fri patterns.

## Important: Preview vs. Live

The **Preview URL** you are currently using is a temporary development environment. 
- **Session Duration:** It stays active as long as you are working in Firebase Studio. If you are inactive for ~20-30 minutes or close the tab, the URL will go offline.
- **Public Access:** While anyone with the link can see it *while your session is active*, it is not a permanent home for the app.

### How to Make It Live (24/7 Permanent Access)

To make FocusFlow accessible to anyone at anytime:

1.  **Create a GitHub Repo:** Go to [github.com/new](https://github.com/new) and create a repository named `focus-flow`.
2.  **Push Your Code:** Upload all the files from this project to your new GitHub repository.
3.  **Deploy to Firebase App Hosting:**
    - Open the [Firebase Console](https://console.firebase.google.com/).
    - Go to **Build** > **App Hosting**.
    - Click **Get Started** and connect your GitHub account.
    - Select your `focus-flow` repository.
    - Click **Finish and Deploy**.

Once deployed, Firebase will provide a permanent URL (e.g., `focus-flow.web.app`) that stays active 24/7.

---
*Note: Your Firebase configuration is already initialized for this project. No further setup is required for the database to work.*
