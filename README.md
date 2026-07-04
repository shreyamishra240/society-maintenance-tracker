# 🏠 Society Maintenance Tracker
## 🔑 Demo Login Credentials

**Admin Login:**
- Email: admin@society.com
- Password: password

**Live URL:** https://society-maintenance-tracker-five.vercel.app

---

A complete platform for apartment societies to manage maintenance complaints, with photo uploads, status tracking, an admin dashboard, a notice board, and automatic email notifications.

---

## 📖 START HERE — Step by Step Guide

Follow these steps **in order**. Don't skip any step.

### STEP 1 — Install the tools you need (one time only)

You need 2 things on your computer:

1. **Node.js** — download from [nodejs.org](https://nodejs.org) (choose the "LTS" version) and install it like any normal software.
2. **PostgreSQL** (the database) — easiest way is to make a **free account** on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com). They give you a free online database — you don't need to install anything on your computer for this.
   - After signing up, create a new project/database.
   - They will give you a **connection string** that looks like:
     `postgresql://username:password@host/dbname`
   - **Copy this and save it somewhere** — you'll need it in Step 4.

To check Node.js installed correctly, open a terminal (Command Prompt on Windows, Terminal on Mac) and type:
```
node -v
```
You should see something like `v18.20.0`. If you see an error, reinstall Node.js and restart your computer.

---

### STEP 2 — Download this project to your computer

If you received this as a ZIP file:
1. Find the ZIP file (probably in your Downloads folder)
2. Right-click → "Extract All" (Windows) or double-click (Mac) to unzip it
3. You'll now have a folder called `society-app` with two folders inside: `backend` and `frontend`

---

### STEP 3 — Put it on GitHub

1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Click the **"+"** icon (top right) → **"New repository"**
3. Name it `society-maintenance-tracker`, keep it **Public**, click **"Create repository"**
4. GitHub will show you commands — ignore them, instead do this easier way:
   - On the new repository page, click **"uploading an existing file"**
   - Drag your whole `society-app` folder contents into the browser window
   - Scroll down, click **"Commit changes"**

✅ Your code is now on GitHub! This is what you submit as your "Zip file with source code" deliverable too (you can also just zip the `society-app` folder).

---

### STEP 4 — Set up the Database

1. Go to your Neon/Supabase project (from Step 1)
2. Find the **SQL Editor** or **Query** tab
3. Open the file `backend/schema.sql` from this project (open it in Notepad or any text editor)
4. **Copy ALL the text** from that file
5. **Paste it** into the Neon/Supabase SQL editor and click **Run**
6. This creates all the tables you need, plus a default admin login:
   - Email: `admin@society.com`
   - Password: `admin123`

---

### STEP 5 — Set up the Backend (the server)

1. Open a terminal/command prompt
2. Navigate into the backend folder by typing:
   ```
   cd path/to/society-app/backend
   ```
   (replace `path/to/` with wherever you unzipped it — you can also just type `cd ` with a space, then drag the `backend` folder into the terminal window and press Enter)

3. Install all required packages:
   ```
   npm install
   ```
   (this downloads everything the backend needs — takes 1-2 minutes)

4. Create your environment file:
   - Find the file `.env.example` inside `backend` folder
   - Make a **copy** of it and rename the copy to exactly `.env` (no .example)
   - Open `.env` in a text editor and fill in:
     - `DATABASE_URL` = the connection string you saved in Step 1
     - `JWT_SECRET` = type any random long text, e.g. `mySuperSecretKey123!@#`
     - `EMAIL_USER` = your Gmail address
     - `EMAIL_PASS` = see "Setting up Gmail" section below
     - Leave the rest as is

5. Start the backend:
   ```
   npm start
   ```
   If it works, you'll see: `🚀 Server running on port 5000`

   **Keep this terminal window open** — closing it stops your server.

---

### STEP 6 — Set up the Frontend (what users see)

1. Open a **new** terminal window (keep the backend one running)
2. Navigate to the frontend folder:
   ```
   cd path/to/society-app/frontend
   ```
3. Install packages:
   ```
   npm install
   ```
4. Create `.env` file the same way (copy `.env.example` → rename to `.env`) — defaults are usually fine for local testing.
5. Start the frontend:
   ```
   npm start
   ```
6. Your browser will automatically open `http://localhost:3000` — this is your app! 🎉

---

### STEP 7 — Setting up Gmail for emails (free)

1. Go to your Google Account → Security → **2-Step Verification** → turn it ON
2. Then go to **App Passwords** (search "app password" in your Google Account settings)
3. Create a new app password, name it "Society App"
4. Google gives you a 16-character code like `abcd efgh ijkl mnop`
5. Put this (without spaces) as `EMAIL_PASS` in your backend `.env` file

---

### STEP 8 — Deploy it online (so others can use it without your computer running)

**Backend → Render.com**
1. Sign up at [render.com](https://render.com) with your GitHub account
2. Click **New → Web Service**, choose your GitHub repo
3. Set **Root Directory** to `backend`
4. Build Command: `npm install` | Start Command: `npm start`
5. Add all your `.env` variables under "Environment"
6. Click Deploy — you'll get a URL like `https://your-app.onrender.com`

**Frontend → Vercel.com**
1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. Click **Add New → Project**, choose your repo
3. Set **Root Directory** to `frontend`
4. Add environment variable `REACT_APP_API_URL` = your Render backend URL from above
5. Click Deploy — you'll get a URL like `https://your-app.vercel.app`

That final Vercel URL is your **"Hosted application URL"** deliverable.

---

## 🗂️ What's in this project

```
society-app/
├── backend/          → Server (Node.js + Express + PostgreSQL)
│   ├── routes/        → API endpoints (auth, complaints, notices, dashboard)
│   ├── middleware/     → Login security checks
│   ├── schema.sql      → Database structure (run this in Step 4)
│   ├── mailer.js        → Sends emails
│   └── index.js          → Main server file + overdue auto-detection
└── frontend/         → What users see (React)
    └── src/pages/      → Login, Register, Dashboard, Complaint forms, Admin views, Notice board
```

## 🔑 Login Credentials

- **Admin**: `admin@society.com` / `admin123`
- **Resident**: Register a new account from the app's Register page

## 📚 API Documentation

| Method | Endpoint | Who | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Anyone | Create resident account |
| POST | `/api/auth/login` | Anyone | Login |
| POST | `/api/complaints` | Resident | Raise a complaint (with optional photo) |
| GET | `/api/complaints/mine` | Resident | View own complaints |
| GET | `/api/complaints` | Admin | View all complaints (filters: status, category, date_from, date_to) |
| GET | `/api/complaints/:id` | Both | View one complaint + full history |
| PATCH | `/api/complaints/:id` | Admin | Update status/priority (logs to history, sends email) |
| GET | `/api/notices` | Both | View notice board |
| POST | `/api/notices` | Admin | Post a notice (emails residents if marked important) |
| DELETE | `/api/notices/:id` | Admin | Delete a notice |
| GET | `/api/dashboard` | Admin | Stats: totals, by status, by category, overdue count |

## 🧠 System Design Summary

**Complaint History Model**: Every status change (including the initial "Open" creation) is saved as a new row in `complaint_history`, recording the actor, old status, new status, note, and timestamp — instead of overwriting the complaint. This gives a full audit trail per complaint.

**Overdue Detection**: A scheduled job (`node-cron`) runs daily, marking any non-Resolved complaint older than `OVERDUE_DAYS` (configurable in `.env`) as overdue. Overdue complaints are sorted to the top of the admin's complaint list.

**Photo Handling**: Uses `multer` middleware to accept one image per complaint (max 5MB, jpg/png/webp only), stored on disk under `/uploads` and served as static files.

**Notification Flow**: `nodemailer` with a free Gmail account sends an email whenever a complaint's status changes, and to all residents when an admin posts an "important" notice.

---

## ❓ Troubleshooting

- **"npm: command not found"** → Node.js isn't installed correctly. Reinstall from nodejs.org and restart your computer.
- **Backend won't start / database error** → Double check your `DATABASE_URL` in `.env` is correct and you ran `schema.sql` in Step 4.
- **Frontend shows blank page** → Make sure backend is running first, and check `REACT_APP_API_URL` in frontend `.env`.
- **Emails not sending** → Re-check Gmail App Password setup (Step 7); normal Gmail password won't work.
