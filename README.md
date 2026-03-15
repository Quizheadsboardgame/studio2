# FocusFlow - Time-Based Task Manager

Manage your tasks with ease using this intuitive, time-based dashboard. Built for Owen, Lucy, and Nick.

## Features

- **Time-Based Tabs:** Organize tasks into Today, Tomorrow, and Later.
- **Bi-directional Swiping:** Swipe left to complete, swipe right to delay.
- **Competition Leaderboard:** Track productivity with color-coded user themes (Owen: Blue, Lucy: Pink, Nick: Green).
- **Auto-Cleanup:** Completed tasks from previous days are hidden by default (toggleable).
- **Recurring Tasks:** Supports Daily, Weekly, Monthly, and Mon-Fri patterns.
- **Smart Statuses:** Uses professional statuses like "Awaiting Information" (counts as progress) and "Follow up Required".

## How to Make It Live (24/7 Public Access)

The current preview URL is temporary for development. To make the app accessible to anyone at anytime:

1.  **Create a GitHub Repo:** Go to [github.com/new](https://github.com/new) and create a repository named `focus-flow`.
2.  **Push Your Code:** Upload all the files from this project to your new GitHub repository.
3.  **Deploy to Firebase App Hosting:**
    - Open the [Firebase Console](https://console.firebase.google.com/).
    - Go to **Build** > **App Hosting**.
    - Click **Get Started** and connect your GitHub account.
    - Select your `focus-flow` repository.
    - Click **Finish and Deploy**.

Once deployed, Firebase will provide a permanent URL (e.g., `focus-flow.web.app`) that stays active even when you aren't logged in.

---
*Note: Your Firebase configuration is already initialized for this project. No further setup is required for the database to work.*
