# Technical Specification: Collaborative Study Notes Platform

## Project Overview
A web application that helps students form study groups and collaborate on class notes with AI-powered assistance. Students can autonomously create groups, share notes, ask questions in a "Doubt Dictionary," and get AI-generated summaries and study tools.

---

## Core Features to Build

### 1. Group Management System

#### User Authentication
- **Requirements:**
  - Simple email/password signup and login
  - User profile with name, email
  - Session management
  
#### Group Creation & Joining
- **Requirements:**
  - Users can create a new study group (group name, class name, optional description)
  - Group creator gets unique invite link (e.g., `/join/abc123xyz`)
  - Anyone with the link can join the group
  - Users can be in multiple groups
  - Group members list visible to all members
  - Ability to leave a group
  - Group creator can remove members

**Database Schema:**
```
Users
- id (primary key)
- email (unique)
- name
- password_hash
- created_at

Groups
- id (primary key)
- name
- class_name
- description (optional)
- invite_code (unique, used in URL)
- created_by (foreign key -> Users)
- created_at

GroupMembers
- id (primary key)
- group_id (foreign key -> Groups)
- user_id (foreign key -> Users)
- joined_at
```

---

### 2. Shared Notes System

#### Collaborative Note Editor
- **Requirements:**
  - Simple rich text editor (headings, bold, italic, bullet points)
  - Real-time collaboration (multiple people can edit at once)
  - Auto-save every few seconds
  - Notes are scoped to a specific group
  - Optional: Show who's currently editing (colored cursor indicators)

**Note:** Consider using an existing library like:
- Quill.js or TipTap for rich text
- Yjs or ShareDB for real-time collaboration
- OR just use a simple textarea with periodic saves if real-time is too complex

#### AI Summary Generation
- **Requirements:**
  - "Summarize Notes" button
  - Sends current note content to AI API (OpenAI/Anthropic)
  - Prompt: "Summarize these lecture notes concisely, highlighting key concepts and important details"
  - Display summary in a modal or side panel
  - Option to copy summary or append to notes

**Database Schema:**
```
Notes
- id (primary key)
- group_id (foreign key -> Groups)
- title
- content (text, can be large)
- last_edited_by (foreign key -> Users)
- created_at
- updated_at
```

---

### 3. Doubt Dictionary (Q&A System)

#### Question Posting
- **Requirements:**
  - Users can post questions in a group
  - Questions have title and optional detailed description
  - Questions can be posted anonymously OR with user's name (toggle)
  - Questions are scoped to a specific group

#### AI-Generated Answers
- **Requirements:**
  - When question is posted, automatically trigger AI response
  - AI prompt template:
    ```
    You are a helpful study assistant. Answer this question based on the class notes provided.
    
    Class Notes:
    {group_notes_content}
    
    Student Question:
    {question_text}
    
    Provide a clear, concise answer that references specific concepts from the notes when relevant.
    ```
  - Display AI answer immediately below question
  - Mark AI answers visually (robot icon, different background color)

#### Human Responses & Interaction
- **Requirements:**
  - Group members can add their own answers/comments
  - Both questions and answers can be upvoted
  - Display upvote count next to each item
  - Users can only upvote once per item
  - Sort questions by: Recent, Most Upvoted, Unanswered
  - Search functionality (search question titles/content)

**Database Schema:**
```
Questions
- id (primary key)
- group_id (foreign key -> Groups)
- user_id (foreign key -> Users, nullable if anonymous)
- is_anonymous (boolean)
- title
- description (optional)
- created_at
- upvote_count (default 0)

Answers
- id (primary key)
- question_id (foreign key -> Questions)
- user_id (foreign key -> Users, nullable for AI)
- is_ai_generated (boolean)
- content
- created_at
- upvote_count (default 0)

Upvotes
- id (primary key)
- user_id (foreign key -> Users)
- votable_type (enum: 'question' or 'answer')
- votable_id (id of question or answer)
- created_at

// Composite unique constraint on (user_id, votable_type, votable_id)
```

---

### 4. Group Chat (Simple)

#### Basic Chat Interface
- **Requirements:**
  - Simple chat room for each group
  - Users can send text messages
  - Messages display with sender name and timestamp
  - Auto-scroll to latest message
  - Optional: "User is typing..." indicator
  - Optional: Real-time updates (or just refresh every 5 seconds)

**Database Schema:**
```
Messages
- id (primary key)
- group_id (foreign key -> Groups)
- user_id (foreign key -> Users)
- content
- created_at
```

---

### 5. AI-Powered Features (Future/Optional)

#### Deadline Extraction (If Time Permits)
- **Requirements:**
  - File upload for syllabus (PDF)
  - AI extracts exam dates and major deadlines
  - Creates simple calendar view with countdown
  - AI prompt: "Extract all exam dates, assignment due dates, and major deadlines from this syllabus. Return as JSON with format: {date: 'YYYY-MM-DD', event: 'description'}"

#### Study Session Suggestions (If Time Permits)
- **Requirements:**
  - When exam is 3 days away, show banner: "Stats exam in 3 days! Schedule a study session?"
  - Clicking opens simple poll: "When can everyone meet?"
  - Group members vote on times
  - After study session is scheduled, prompt: "Want to grab food after?"

---

## Technology Stack Recommendations

### Frontend
- **React** (or Next.js for easier routing/SSR)
- **TailwindCSS** for styling (fast, responsive)
- **React Router** for navigation
- **Axios** or Fetch for API calls

### Backend
- **Node.js + Express** (simple REST API)
  - OR **Next.js API routes** (if using Next.js)
- **PostgreSQL** (production) or **SQLite** (quick prototype)
- **Prisma** (ORM - makes database queries easy)

### Real-time (Optional)
- **Socket.io** for chat and live editing
- OR **Supabase** (provides real-time out of the box + auth + database)

### AI Integration
- **OpenAI API** (GPT-4 or GPT-3.5-turbo)
- OR **Anthropic API** (Claude models)
- Store API key in environment variable

### Authentication
- **JWT tokens** (simple)
- OR **Supabase Auth** (handles everything)
- OR **NextAuth.js** (if using Next.js)

---

## MVP Implementation Priority

### Phase 1: Core Functionality
1. ✅ User signup/login
2. ✅ Create group + generate invite link
3. ✅ Join group via invite link
4. ✅ Basic shared notes (even just a textarea that saves)
5. ✅ Doubt Dictionary: Post question + AI answer

### Phase 2: Polish
6. ✅ Upvoting on questions/answers
7. ✅ Human responses to questions
8. ✅ AI note summarization
9. ✅ Basic group chat
10. ✅ UI polish (make it not look terrible)

### Phase 3: Nice-to-Haves (If Time)
11. ⭐ Real-time collaborative editing
12. ⭐ Search in Doubt Dictionary
13. ⭐ Syllabus deadline extraction

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user (returns JWT)
- `GET /api/auth/me` - Get current user info

### Groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/join` - Join group (requires invite code)
- `DELETE /api/groups/:id/members/:userId` - Remove member
- `GET /api/groups/:id/members` - Get all group members

### Notes
- `GET /api/groups/:groupId/notes` - Get all notes for group
- `POST /api/groups/:groupId/notes` - Create new note
- `PUT /api/notes/:id` - Update note content
- `POST /api/notes/:id/summarize` - Generate AI summary

### Doubt Dictionary
- `GET /api/groups/:groupId/questions` - Get all questions (with filters)
- `POST /api/groups/:groupId/questions` - Create new question
- `POST /api/questions/:id/answers` - Add answer to question
- `POST /api/questions/:questionId/upvote` - Upvote question
- `POST /api/answers/:answerId/upvote` - Upvote answer

### Chat
- `GET /api/groups/:groupId/messages` - Get recent messages
- `POST /api/groups/:groupId/messages` - Send message
- `WS /api/groups/:groupId/chat` - WebSocket for real-time (optional)

---

## Environment Variables Needed

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Authentication
JWT_SECRET=your-secret-key-here

# AI API
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# App Config
PORT=3000
NODE_ENV=development
```

---

## Quick Start Prompts for AI Coding Assistants

### For setting up the project:
```
Create a Next.js project with TypeScript, TailwindCSS, and Prisma ORM.
Set up a PostgreSQL database with tables for Users, Groups, GroupMembers, 
Notes, Questions, Answers, and Upvotes based on the schema in TECHNICAL_SPEC.md.
Include user authentication with JWT tokens.
```

### For building Doubt Dictionary:
```
Build a React component for a "Doubt Dictionary" Q&A system:
- Display list of questions with title, upvotes, and answer count
- When question is clicked, show all answers (AI and human)
- AI answers are auto-generated when question is posted
- Users can add their own answers
- Upvote button for questions and answers
- Questions can be posted anonymously
Use the database schema from TECHNICAL_SPEC.md
```

### For AI integration:
```
Create an API endpoint that generates an AI answer to a student question
using the Anthropic Claude API. The AI should use the group's shared notes
as context. Return the generated answer and save it to the database.
```

---

## Testing Checklist

### Before Demo:
- [ ] User can sign up and log in
- [ ] User can create a group and get invite link
- [ ] Different user can join via invite link
- [ ] Both users can see shared notes
- [ ] User can post a question (anonymous and named)
- [ ] AI generates answer automatically
- [ ] User can add human answer to question
- [ ] Upvoting works on questions/answers
- [ ] AI summarize button works on notes
- [ ] Chat messages send and display correctly

### Demo Data to Prepare:
- Pre-created group with sample notes (Stats 121 content)
- 2-3 example questions already in Doubt Dictionary
- AI answers that reference the notes
- Sample upvotes on good answers

---

## Notes for Developers

### Keep It Simple
- **Don't over-engineer** - you have 30 hours
- If real-time is too complex, just use polling (refresh every 5 seconds)
- If collaborative editing is too hard, just use a simple textarea with "Save" button
- Focus on the Doubt Dictionary - that's your differentiator

### Use AI Coding Assistants Effectively
- Give them this entire TECHNICAL_SPEC.md as context
- Ask for one feature at a time
- Test each feature before moving to the next
- Use cursor/Claude Code to debug errors quickly

### Deployment (Friday Morning)
- **Vercel** (easiest for Next.js) - free tier
- **Supabase** (free PostgreSQL hosting)
- OR **Railway** (deploy full-stack apps easily)
- Make sure to set environment variables in deployment platform

---

## Success Metrics for Demo

The judges should see:
1. **Working group formation** (create → invite → join)
2. **AI-powered Doubt Dictionary** with context from notes
3. **Social layer** (upvotes, human answers, chat)
4. **Clean UI** (doesn't have to be perfect, just not broken)

Remember: A working prototype with 3 solid features beats a broken app with 10 half-finished features.

Good luck! 🚀