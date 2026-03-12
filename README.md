# FocusFlow - Time-Based Task Manager

Manage your tasks with ease using this intuitive, time-based dashboard. Built for Owen, Lucy, and Nick.

## Features

- **Time-Based Tabs:** Organize tasks into Today, Tomorrow, and Later.
- **Bi-directional Swiping:** Swipe left to complete, swipe right to delay.
- **Competition Leaderboard:** Track productivity with color-coded user themes (Owen: Blue, Lucy: Pink, Nick: Green).
- **Auto-Cleanup:** Completed tasks from previous days are hidden by default (toggleable).
- **Recurring Tasks:** Supports Daily, Weekly, Monthly, and Mon-Fri patterns.

## How to Move This to GitHub (Manual Copy-Paste)

If you want to manually move this code to your own GitHub account:

1.  **Create a New Repo on GitHub:** Go to [github.com/new](https://github.com/new) and create a repository named `focus-flow`.
2.  **Create Files:** In your local editor (like VS Code) or directly on GitHub, create the file structure you see in the sidebar here.
3.  **Copy-Paste Content:** Open each file in this project, copy the code, and paste it into your new repository.
4.  **Key Files to Note:** 
    - `src/firebase/config.ts`: Contains your unique database connection.
    - `package.json`: Lists the required libraries.
    - `src/app/page.tsx`: The main user interface.

## How to Make It Live (Deployment)

Once your code is in GitHub:

1.  Open the [Firebase Console](https://console.firebase.google.com/project/studio-3132529478-62a3a/overview).
2.  Click **Build** -> **App Hosting** in the left menu.
3.  Click **Get Started** and connect your GitHub account.
4.  Select your `focus-flow` repository.
5.  Click **Finish and Deploy**.

Firebase will automatically build your site and give you a permanent public link.

---
*Note: Your Firebase configuration is already initialized for this project. No further setup is required for the database to work.*
