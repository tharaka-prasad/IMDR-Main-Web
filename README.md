# IMDR Integrated Institute Management System

Laravel + Inertia.js + React + MySQL + Tailwind CSS. One application, one login screen: the public
website and the secure staff/student portal are both served by this project.

## What's inside

- **Public website** — home, about, courses, news/events/research/media, contact, online registration,
  certificate verification.
- **Secure portal** — role-based dashboards for Super Admin, Admin, Accountant, Lecturer and Student.
- **Academic** — course types, courses with fee/installment plans, subjects, batches, enrollments,
  teaching assignments, timetable (with double-booking checks), attendance, results.
- **LMS** — notes/PDFs/slides/videos (private files, permission-checked), assignments, quizzes
  (auto-marked, one attempt).
- **Finance & payments** — invoices, the payment gateway (PayHere adapter + a built-in Sandbox gateway
  for testing), manual cash/bank payments, refunds, a full audit trail. Payments are **only** credited
  from a verified gateway notification — the browser is never trusted.
- **Payment-linked LMS access** — if a student's payment goes overdue, the LMS (materials, assignments,
  quizzes) pauses automatically and shows why, with a "Pay now" button. Admins can grant a temporary
  override.
- **WhatsApp receipts** — every payment (online or manual) tries to send a receipt link on WhatsApp.
  Ships with a safe `log` driver (records the attempt + gives a click-to-chat link) and adapters for
  the Meta Cloud API and Twilio.
- **Student records** — searchable student directory with a student ID, login (username/password set
  by the office), documents (birth certificate, result sheets, NIC, etc., private and permission-checked),
  attendance, results, invoices, payments.
- **Payroll** — monthly / hourly / per-session, calculated from held classes on the timetable.
- **Expenses, certificates (with a public verification page), audit log, settings.**

## Requirements

- PHP 8.2+, Composer
- MySQL 8+ (or MariaDB)
- Node.js 18+ and npm

## Setup

```bash
# 1. Install PHP dependencies
composer install

# 2. Copy the environment file and generate the app key
cp env.imdr .env
php artisan key:generate

# 3. Create an empty MySQL database, e.g.:
#      CREATE DATABASE imdr CHARACTER SET utf8mb4;
#    then edit .env: DB_DATABASE, DB_USERNAME, DB_PASSWORD

# 4. Run migrations and seed real course content (+ demo people outside production)
php artisan migrate --seed

# 5. Link the private storage disk isn't public — nothing to symlink for LMS/document files.
#    (If you ever add public image uploads, run: php artisan storage:link)

# 6. Install JS dependencies and build the frontend
npm install
npm run build      # production build
# or, while developing:
php artisan serve  # in one terminal
npm run dev        # in another terminal (hot reload)
```

Open the app and log in with the seeded super admin:

- **Username:** whatever you set as `ADMIN_USERNAME` in `.env` (default `admin`)
- **Password:** whatever you set as `ADMIN_PASSWORD` in `.env` (default `ChangeMe@123` — change it
  immediately from Profile → Change password)

If you kept the demo seed data (non-production), it also creates:

| Role | Username | Password |
|---|---|---|
| Admin | `office` | `Demo@12345` |
| Accountant | `accounts` | `Demo@12345` |
| Lecturer | `lecturer1` | `Demo@12345` |
| Student (fully paid, LMS open) | `student1` | `Demo@12345` |
| Student (overdue payment, LMS paused) | `student2` | `Demo@12345` |
| Student (awaiting approval) | `student3` | `Demo@12345` |

## Payments

`PAYMENT_GATEWAY` in `.env` controls the active gateway:

- **`sandbox`** (default) — a built-in fake gateway for development and demos. No real money moves.
  A logged-in student can walk through the full pay → verify → credit → receipt flow safely.
- **`payhere`** — the real [PayHere](https://www.payhere.lk) gateway. Set `PAYHERE_MERCHANT_ID`,
  `PAYHERE_MERCHANT_SECRET`, `PAYHERE_SANDBOX` (true while testing on PayHere's own sandbox) and
  `PAYHERE_NOTIFY_URL` (a public HTTPS URL PayHere can reach — use a tunnel like ngrok while developing
  locally). **Re-check the current field names and hash rules in PayHere's developer docs before going
  live** — payment gateway APIs change.

Adding another gateway later: implement `App\Services\Payments\GatewayInterface` and register it in
`App\Services\Payments\GatewayManager`. Nothing else in the finance code needs to change.

## WhatsApp receipts

`WHATSAPP_DRIVER` in `.env`:

- **`log`** (default) — nothing is actually sent. Every attempt is recorded in the WhatsApp log
  (Finance → WhatsApp receipts) with a "wa.me" click-to-chat link the office can use manually.
- **`cloud`** — Meta's WhatsApp Cloud API. Set `WHATSAPP_CLOUD_TOKEN` and
  `WHATSAPP_CLOUD_PHONE_NUMBER_ID`. Outside a 24-hour customer-service window you'll need an approved
  message template — set `WHATSAPP_TEMPLATE`.
- **`twilio`** — Twilio's WhatsApp API. Set `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_WHATSAPP_FROM`.

A WhatsApp failure never blocks or reverses a payment — it's logged and can be retried from the
WhatsApp log screen.

## Notes for going to production

- Set `APP_ENV=production`, `APP_DEBUG=false`, run `php artisan config:cache route:cache view:cache`.
- Set a real `PAYMENT_GATEWAY` and `WHATSAPP_DRIVER`.
- Run `php artisan migrate --seed` once — the demo people/classes are skipped automatically in
  production; only the real course catalogue and website content are seeded.
- Put a queue worker + scheduler in place if you later add background jobs (e.g. bulk notifications).
- The private disk (`storage/app/private`) holds all LMS files, student documents and expense receipts.
  Back it up along with the database.

## Tests

```bash
php artisan test
```

Covers the payment-gateway idempotency rules (duplicate callbacks, invalid signatures, wrong amounts,
out-of-order success/failure), WhatsApp receipt dispatch, the payment-delay LMS lock (including grace
days and admin overrides), and student registration/search/document access.
