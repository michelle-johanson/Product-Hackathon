# Technical Specification: Collaborative Study Notes Platform

## Project Overview
A web application that helps students form study groups and collaborate on class notes with AI-powered assistance. Students can autonomously create groups, share notes, ask questions in a "Doubt Dictionary," and get AI-generated summaries and study tools.

## Architecture & File Structure
The project uses a separated Client/Server architecture within a single repository:
* `/client`: Frontend built with React (Vite) and standard CSS.
* `/server`: Backend built with Node.js/Express, utilizing a modular routing system (`/routes`, `/middleware`).
* `/prisma`: Database configuration and schema (PostgreSQL).
* Root `package.json`: Uses `concurrently` to run both client and server simultaneously via `npm run dev:all`.

## Core Features to Build

### 1. Group Management System

**User Authentication**
* Requirements:
  * Simple email/password signup and login
  * User profile with name, email
  * Session management via JWT

**Group Creation & Joining**
* Requirements:
  * Users can create a new study group (group name, class name, optional description)
  * Group creator gets unique invite link/code (e.g., x7z9q2)
  * Anyone with the code can join the group
  * Users can be in multiple groups
  * Group members list visible to all members
  * Ability to leave a group

**Database Schema (Prisma format):**
```sql
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String
  passwordHash String
  createdAt    DateTime @default(now())
}

model Group {
  id          String   @id @default(uuid())
  name        String
  className   String
  description String?
  inviteCode  String   @unique
  createdBy   String   // Foreign key -> User
  createdAt   DateTime @default(now())
}

model GroupMember {
  id        String   @id @default(uuid())
  groupId   String   // Foreign key -> Group
  userId    String   // Foreign key -> User
  joinedAt  DateTime @default(now())
  
  // @@unique([groupId, userId])
}
```

### 2. Shared Notes System

**Collaborative Note Editor**
* Requirements:
  * Simple rich text editor or basic textarea
  * Auto-save every few seconds or manual "Save" button
  * Notes are scoped to a specific group

**AI Summary Generation**
* Requirements:
  * "Summarize Notes" button
  * Sends current note content to AI API (OpenAI/Anthropic/Gemini)
  * Display summary in a modal or side panel

**Database Schema:**
```sql
model Note {
  id           String   @id @default(uuid())
  groupId      String   // Foreign key -> Group
  title        String
  content      String   @db.Text
  lastEditedBy String   // Foreign key -> User
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### 3. Doubt Dictionary (Q&A System)

**Question Posting**
* Requirements:
  * Users can post questions in a group
  * Questions have title and optional detailed description
  * Questions are scoped to a specific group

**AI-Generated Answers**
* Requirements:
  * When a question is posted, automatically trigger AI response using group notes as context.
  * Display AI answer immediately below the question
  * Mark AI answers visually (robot icon, different background color)

**Human Responses & Interaction**

* Requirements:
  * Group members can add their own answers/comments
  * Both questions and answers can be upvoted

**Database Schema:**
```sql
model Question {
  id          String   @id @default(uuid())
  groupId     String   // Foreign key -> Group
  userId      String?  // Foreign key -> User
  isAnonymous Boolean  @default(false)
  title       String
  description String?
  upvoteCount Int      @default(0)
  createdAt   DateTime @default(now())
}

model Answer {
  id            String   @id @default(uuid())
  questionId    String   // Foreign key -> Question
  userId        String?  // Foreign key -> User (nullable for AI)
  isAiGenerated Boolean  @default(false)
  content       String   @db.Text
  upvoteCount   Int      @default(0)
  createdAt     DateTime @default(now())
}
```

## Technology Stack

**Frontend (`/client`)**
* React (Vite)
* Standard CSS (`index.css`) for layout and styling (Tailwind was removed for simplicity)
* React Router for navigation (to be implemented)
* Fetch API (custom `api.js` helper) for API calls

**Backend (`/server`)**
* Node.js + Express (Modular REST API)
* PostgreSQL (Database)
* Prisma (ORM)
* Bcrypt for password hashing
* jsonwebtoken for Auth

**AI Integration**
* OpenAI API (or Anthropic/Gemini)
* Store API key in `.env`

## MVP Implementation Priority

### Phase 1: Core Functionality

1. ✅ User signup/login
2. ✅ Create group + generate invite code
3. ✅ Join group via invite code
4. ✅ Global Layout (Sidebar, Header) using Standard CSS
5. ⬜ Basic shared notes (textarea that saves to DB)
6. ⬜ Doubt Dictionary: Post question + AI answer

### Phase 2: Polish

7. ⬜ Upvoting on questions/answers
8. ⬜ Human responses to questions
9. ⬜ AI note summarization

## API Endpoints Reference

### Authentication (`/api/auth`)
* `POST /signup` - Create new user
* `POST /login` - Login user (returns JWT)
* `GET /me` - Get current user info

### Groups (`/api/groups`)
* `GET /` - Get all groups for current user
* `POST /` - Create new group
* `POST /join` - Join group (requires invite code)

### Notes (`/api/notes`) (To Be Built)
* `GET /:groupId` - Get notes for a group
* `POST /:groupId` - Create/Update note content

## Quick Start Prompts for AI Coding Assistants

For adding a new Backend Feature:
```
I have a Node/Express backend using Prisma ORM. 
Please create a new route file in `server/routes/` for [Feature]. 
Use `authMiddleware` to protect the routes. 
Here is the Prisma schema for reference: [Paste relevant schema].
```

For adding a new Frontend Component:
```
I have a React (Vite) application using standard CSS. 
Create a new component in `client/src/components/` for [Feature].
Use the `apiRequest` helper from `lib/api.js` to fetch data from the backend.
Do not use Tailwind classes, please provide standard CSS to put in my `index.css`.
```

For building Doubt Dictionary:
```
Build a React component for a "Doubt Dictionary" Q&A system.
Use standard CSS for styling.
When a question is clicked, show all answers (AI and human).
Assume the backend API endpoints are `/api/questions` and `/api/answers`.
```