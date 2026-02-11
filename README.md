# Product-Hackathon

This repository contains a **Node.js + Express** backend and a **React (Vite)** frontend located in `client/`. The API is exposed at `/api/hello`, and the server serves the built React app from `client/dist`.

## 🚀 Getting Started

Open your terminal and run the following to get the project running on your local machine:

```bash
# Clone the Repository
git clone https://github.com/michelle-johanson/Product-Hackathon.git
cd Product-Hackathon

# Install Dependencies
npm install
```

## 🏃 Running the App

### Option A: Run in Development
Features hot-reloading for instant feedback.
```bash
# Start the API server and the React dev server
npm run dev:all
```
Open Browser: Go to http://localhost:5173. You can edit files in client/src and see changes instantly.

### Option B: Run Locally
Simulates how the app runs in a production environment.

```bash
# Build the React app and start the server:
npm run build
npm run start
```
Open Browser: Go to http://localhost:3000.

## 📂 Project Structure
* `server.js` – Express server: serves `client/dist` (or `public/` if no build) and provides `/api/hello`.
* `package.json` – Root scripts and dependencies.
* `client/` – React + Vite app.
	* `client/src/` – React components and styles.
	* `client/dist/` – Built output (generated after npm run build).
* `public/` – Legacy static frontend (used only if `client/dist` is missing).


## 🐙 Git Workflow & Contribution

### Getting started
```bash
git checkout main # Open main branch
git pull origin main # Update main branch locally

git checkout -b yourbranch # Create a new branch for yourself
```

### Make your edits
```bash
git add . # Stage all files to commit
git status # View your edits (Optional)

git commit -m "Describe your change"

git push origin yourbranch
```

### Open a Pull Request

1. Go to the GitHub repo in your browser
2. Click Compare & pull request
3. Add a short description (optional)
4. Click Create pull request
5. Other team members would review and merge it.

### Keep Your Local Copy Updated

Before starting any new work:
```bash
git checkout main
git pull origin main
```

If you have any local changes that prevent you from pulling from the repo,

you can wipe your local changes with:
```bash
git restore .
git pull origin main
```

Then create a new branch again for your next task:
```bash
# Check current branch
git branch

# Delete your old branch (optional)
git branch -d yourbranch

# Create a new branch
git checkout -b yourbranch
```
This keeps everyone’s code up-to-date and avoids merge conflicts.