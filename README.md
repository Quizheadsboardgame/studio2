# FocusFlow - Time-Based Task Manager

Manage your tasks with ease using this intuitive, time-based dashboard. This app is built with Next.js, React, Tailwind CSS, and Firebase.

## Features

- **Time-Based Tabs:** Organize tasks into Today, Tomorrow, and Next Week.
- **Bi-directional Swiping:** Swipe left to complete, swipe right to delay by one day.
- **Competition Leaderboard:** Track productivity stats for Owen, Lucy, and Nick.
- **Color-Coded Status:** Visual indicators for Incomplete (Red), In Progress (Orange), and Completed (Green).
- **Multi-User Assignments:** Assign tasks to others and see "Created by" labels.

## Getting Started

1.  **Development:** Run `npm run dev` to start the local development server.
2.  **Build:** Run `npm run build` to verify the production build.

## How to Make This Live (Deployment)

Follow these steps to deploy your app to a production URL using **Firebase App Hosting**:

1.  **Push your code to GitHub:**
    - Initialize a Git repository in this folder.
    - Create a new repository on GitHub and push your code there.

2.  **Open the Firebase Console:**
    - Go to [console.firebase.google.com](https://console.firebase.google.com/).
    - Select your project: **studio-3132529478-62a3a**.

3.  **Setup App Hosting:**
    - In the left-hand menu, navigate to **Build** -> **App Hosting**.
    - Click **Get Started**.

4.  **Connect your Repository:**
    - Connect your GitHub account and select the repository you just created.
    - Choose your deployment branch (usually `main`).

5.  **Configure and Deploy:**
    - Name your backend (e.g., `focus-flow-web`).
    - Select your preferred region.
    - Click **Finish and Deploy**.

Firebase will automatically detect that you are using Next.js, run your build script, and deploy the app to a global CDN. Once finished, you will receive a public URL (e.g., `https://your-app.web.app`) that anyone can access.

---
*Note: Your Firebase configuration is already initialized in `src/firebase/config.ts`. No further configuration is required for deployment.*
