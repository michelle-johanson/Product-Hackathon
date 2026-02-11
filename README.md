# Hackathon Project

A web app that helps students form study groups and collaborate on notes with AI assistance.

---

## 🚀 First Time Setup (Do This Once)

### 1. Get the Code on Your Computer
```bash
git clone https://github.com/michelle-johanson/Product-Hackathon.git
cd Product-Hackathon
npm install
```

### 2. Get the Secret Keys
```bash
cp .env.example .env
```

### 3. Set Up the Database Connection
```bash
npx prisma generate
```

---

## 💻 Working on the Project

### Start the App
```bash
npm run dev:all
```

This starts both the website and the server. Open your browser to:
- **Website**: http://localhost:5173
- **Backend**: http://localhost:3000

### Making Changes

**Frontend (what users see):**
- Edit files in `client/src/`
- Changes show up instantly in your browser

**Backend (server/database stuff):**
- Use AI coding tools; all essential information is in `project.md`

---

## 🐙 Saving Your Work to GitHub

### Step 1: Create Your Own Branch
```bash
git checkout -b yourname-feature
```
*Delete: `git branch -D yourname-feature`*

### Step 2: Save Your Changes
```bash
git add .
git commit -m "Brief description of what you did"
git push origin yourname-feature
```

### Step 3: Open a Pull Request
1. Go to https://github.com/michelle-johanson/Product-Hackathon
2. Click the green "Compare & pull request" button
3. Click "Create pull request"
4. Someone will review and merge it.

### Before starting any new work:
```bash
git checkout main
git pull origin main
```

---

## 🆘 Common Problems

### "I can't pull from GitHub"
```bash
git stash
git pull origin main
git stash pop
```

### "I broke something"
```bash
git restore .
git pull origin main
```
This resets everything to the last working version.

---

## 📁 Where Things Are

```
Product-Hackathon/
├── client/src/          ← Edit these for frontend (what users see)
│   ├── components/      ← Reusable UI pieces
│   ├── pages/           ← Different pages
│   └── App.jsx          ← Main app file
│
├── server/              ← Backend stuff
│   ├── routes/          ← API endpoints
│   └── middleware/      ← Auth and other helpers
│
├── project.md           ← Give this to ChatGPT/Claude for coding help
└── .env                 ← Secret keys
```

---

## 🎯 Before Demo Day (Friday)

1. Make sure `npm run dev:all` works
2. Test creating an account and logging in
3. Test creating a study group
4. Practice showing your features

---

## 💡 Tips

- **Save often**: Commit your work every hour or two
- **Pull before starting**: Always run `git pull origin main` before new work
- **Ask questions**: No question is too basic!
- **Use AI**: ChatGPT/Claude can help debug errors if you share `project.md`

