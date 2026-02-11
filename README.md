# Product-Hackathon

## 🏗️ Tech Stack

- **Frontend**: React + Vite (in `client/`)
- **Backend**: Node.js + Express (in `server/`)
- **Database**: PostgreSQL (hosted on Railway)
- **ORM**: Prisma
- **Auth**: JWT tokens


## 🚀 Getting Started

Open your terminal and run the following to get the project running on your local machine:

```bash
# Clone the Repository
git clone https://github.com/michelle-johanson/Product-Hackathon.git
cd Product-Hackathon

# Install Dependencies
npm install

# Setup .env file
cp .env.example .env
# Check with Michelle for Session Secrets
```

## 🏃 Running the App

### Development Mode (Recommended)
Hot-reloading for both frontend and backend:

```bash
npm run dev:all
```

- Frontend: `http://localhost:5173` (Vite dev server)
- Backend API: `http://localhost:3000/api/*`

### Production Mode (For Testing)
```bash
npm run build
npm start
```
- Full app: `http://localhost:3000`


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


**If you have conflicts:**
```bash
git stash              # Save your local changes
git pull origin main
git stash pop          # Reapply your changes
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

---

## 🛠️ Common Commands

```bash
# Database
npx prisma studio              # View database in browser
npx prisma generate            # Regenerate Prisma Client after schema changes

# Development
npm run dev:all                # Start both frontend and backend
npm run dev                    # Backend only
cd client && npm run dev       # Frontend only

# Production
npm run build                  # Build frontend for production
npm start                      # Start production server
```

## 🆘 Troubleshooting

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Port 3000 already in use"
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Backend changes not showing up
- Make sure you're running `npm run dev:all` (not just `npm start`)
- Restart the dev server

---

## 📁 Project Structure

```
Product-Hackathon/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── dist/            # Built frontend (ignored in git)
├── server/              # Express backend
│   ├── routes/
│   │   ├── auth.js      # Auth endpoints (/api/auth/*)
│   │   └── groups.js    # Group endpoints (/api/groups/*)
│   ├── middleware/
│   │   └── auth.js      # JWT verification
│   └── server.js        # Main server file
├── prisma/
│   └── schema.prisma    # Database schema
├── .env                 # Environment variables (NOT in git)
├── .env.example         # Template for .env
└── package.json
```


## 🗄️ Database Schema

We have 8 main tables:
- **User** - User accounts
- **Group** - Study groups
- **GroupMember** - Group membership
- **Note** - Shared notes per group
- **Question** - Questions in Doubt Dictionary
- **Answer** - Answers to questions (human + AI)
- **Upvote** - Votes on questions/answers
- **Message** - Group chat messages

See `prisma/schema.prisma` for full details.


## 🔑 API Endpoints (Current)

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Get current user (requires auth)

### Groups (Work in Progress)
- `POST /api/groups` - Create group
- `POST /api/groups/join` - Join via invite code
- `GET /api/groups/:id` - Get group details
- More coming soon...
