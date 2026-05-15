# TaskLink Backend API

Node.js + Express + SQLite (sql.js) backend for TaskLink.

## Setup

```bash
cd backend
npm install
node server.js
```

Server runs at `http://localhost:3000`.

## API Endpoints

### Auth
- `POST /api/auth/register` — { name, email, password, phone, country, continent }
- `POST /api/auth/login` — { email, password }
- `POST /api/auth/forgot-password` — { email }
- `GET /api/auth/me` — get current user info
- `POST /api/auth/logout`

### Jobs
- `GET /api/jobs` — list all jobs (includes approved employer jobs)
- `GET /api/jobs/:id` — job detail
- `GET /api/jobs/companies/directory` — company directory

### Tasks
- `GET /api/tasks` — list active tasks
- `POST /api/tasks/start` — { taskId }
- `POST /api/tasks/submit` — { taskId, workNote }
- `POST /api/tasks/apply-complex` — { taskId }

### Submissions
- `GET /api/submissions/my` — user's submissions
- `GET /api/submissions/all` — all submissions (admin)

### Payments
- `POST /api/payments/submit` — { plan, method }
- `GET /api/payments/status`

### Withdrawals
- `POST /api/withdrawals/request` — { amount, method, account }
- `GET /api/withdrawals/my`
- `GET /api/withdrawals/all`

### Admin
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `POST /api/admin/submissions/approve` — { submissionId }
- `POST /api/admin/submissions/reject` — { submissionId }
- `POST /api/admin/payments/confirm` — { paymentId }
- `POST /api/admin/payments/verify-otp` — { paymentId }
- `POST /api/admin/withdrawals/pay` — { withdrawalId }
- `POST /api/admin/withdrawals/reject` — { withdrawalId }
- `POST /api/admin/tasks` — create task
- `PUT /api/admin/tasks/:id` — update task
- `DELETE /api/admin/tasks/:id` — soft-delete task
- `POST /api/admin/employer-jobs/approve` — { jobId }
- `POST /api/admin/employer-jobs/reject` — { jobId }

### Employer
- `POST /api/employer/register` — { name, email, company, phone, password }
- `POST /api/employer/login` — { email, password }
- `POST /api/employer/post-job` — job object
- `GET /api/employer/my-jobs`
- `GET /api/employer/applicants`

### Profile
- `GET /api/profile`
- `POST /api/profile/save`

### Survey
- `POST /api/survey/submit` — { skills, experience, jobType, availability, goals }
- `GET /api/survey/status`

### Favorites
- `GET /api/favorites`
- `POST /api/favorites/toggle` — { jobId }

### Applications
- `POST /api/applications/apply` — { jobId, jobTitle, name, email, phone, message }
- `GET /api/applications/my`

### Dashboard
- `GET /api/dashboard` — aggregated dashboard data
