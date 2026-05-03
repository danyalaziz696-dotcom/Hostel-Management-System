# Hostel Management System

An object-oriented hostel management web application developed for the Software Design and Analysis course. The system digitizes hostel operations including room allocation, complaints, notices, reports, payments, users, and mess management.

## Project Overview

Manual hostel management is inefficient because of poor room allocation, unmanaged complaints, scattered notices, and inaccurate fee tracking. This project provides a centralized platform where each role can perform its assigned responsibilities through a clean dashboard.

The system follows SDA principles by keeping business logic in backend service classes. MongoDB is used only for persistence and CRUD operations. No SQL stored procedures, triggers, or database-driven business rules are used.

## Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Architecture: Layered object-oriented backend with Models, Routes, and Services

## Repository Structure

```text
Hostel-Management-System/
  backend/
    config/              Database connection
    models/              Mongoose schemas
    routes/              Express API routes
    services/            Business logic classes
    server.js            Backend entry point
    seed.js              Sample data script
    .env.example         Environment variable template
  frontend/
    public/              Static public assets
    src/
      api.js             Frontend API helper
      App.js             React routes
      components/        Shared dashboard UI
      pages/             Role-based dashboards
  activity diagram/      SDA activity diagrams
  design class diagram/  SDA design class diagrams
  sequence diagram/      SDA sequence diagrams
  state diagram/         SDA state diagrams
  use case diagram/      SDA use case diagrams
  use case description/  SDA use case descriptions
  README.md
```

## Main Features

### Admin: Reporting and Notices

- Manage notices
- Publish notices as internal notifications
- Generate reports
- View revenue report
- View occupancy report
- View complaint report
- Manage users

### Warden: Room Management

- Manage rooms
- Allocate rooms
- Check room availability
- Deallocate rooms
- Manage student records
- Resolve complaints

### Student: Complaint and Student Operations

- Submit complaints
- View complaint history
- View room details
- View notices
- View fee status

### Payment Clerk: Finance Module

- Add and update payment records
- Track paid, partial, and unpaid fee status
- View payment records

### Mess Staff: Mess Module

- Mark meal attendance
- View mess student list
- View mess charges
- Manage weekly mess menu

## Team Responsibilities

| Member | Responsibility | Main Files |
| --- | --- | --- |
| Wattoo / Ghulam Ahmad | Reporting and Notices | `AdminDashboard.jsx`, `NoticeService.js`, `ReportService.js`, notice/report routes and models |
| Faizan Ali | Room Management | `WardenDashboard.jsx`, `RoomService.js`, `AllocationService.js`, `StudentService.js`, room/allocation/student routes and models |
| Furqan Adnan | Complaint and Student Operations | `StudentDashboard.jsx`, `ComplaintService.js`, `PaymentService.js`, complaint/payment routes and models |
| Danyal Aziz | Finance, Login, Logout, Users | `LoginPage.jsx`, `FinanceDashboard.jsx`, `AuthService.js`, `UserService.js`, `PaymentService.js`, auth/user/payment routes and models |
| Ahmed Aziz | Mess Module | `MessDashboard.jsx`, `MessService.js`, mess attendance/charge/enrollment/menu models and routes |

Shared integration files include `frontend/src/api.js`, `frontend/src/App.js`, `frontend/src/components/DashboardLayout.jsx`, `frontend/src/components/ui.js`, `backend/server.js`, `backend/config/db.js`, and `backend/seed.js`.

## Backend Architecture

The backend is divided into clear layers:

- Models define database schemas only.
- Routes receive HTTP requests and forward them to services.
- Services contain business rules and validations.
- The database performs only immediate CRUD operations.

Example:

```text
Frontend Dashboard -> Express Route -> Service Class -> Mongoose Model -> MongoDB
```

This keeps business logic separate from database logic and supports SRP, cohesion, and separation of concerns.

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/danyalaziz696-dotcom/Hostel-Management-System.git
cd Hostel-Management-System
```

### 2. Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm start
```

Update `.env` with your MongoDB connection string.

Backend runs on:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

## Environment Variables

Create `backend/.env` using `backend/.env.example`.

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Never commit the real `.env` file.

## Testing Checklist

Run the backend and frontend, then test all role dashboards:

- Admin: add notice, confirm notice content displays, view reports, manage users.
- Warden: add room, allocate room, deallocate room, view students, resolve complaint.
- Student: view room details, view notices, submit complaint, view fee status.
- Payment Clerk: add payment record and verify fee status.
- Mess Staff: mark attendance, view mess students, view charges, update weekly menu.

Build verification:

```bash
cd frontend
npm run build
```

Expected result:

```text
Compiled successfully.
```

## API Smoke Tests

With the backend running:

```powershell
Invoke-RestMethod http://localhost:5000/api/students
Invoke-RestMethod http://localhost:5000/api/notices/published
Invoke-RestMethod http://localhost:5000/api/complaints
Invoke-RestMethod http://localhost:5000/api/mess
```

## SDA Compliance Statement

This project is built as an object-oriented system. Business rules are implemented in service classes such as `AllocationService`, `ComplaintService`, `MessService`, `PaymentService`, `ReportService`, and `UserService`. MongoDB and Mongoose models are used only for data persistence and CRUD. The system does not use database stored procedures for business logic.
