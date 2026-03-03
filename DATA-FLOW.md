## Healthcare System – Data Flow

This document explains how data flows through the Healthcare System based on the current ERD (`healthcare_erd.dbml`). It focuses on how the main entities interact during the full lifecycle of a consultation: from user onboarding, through slot creation and booking, to payment, consultation, and post-consultation activities.

---

## 1. Key Actors and Core Tables

- **Platform user**
  - Stored in `users`.
  - Has login credentials (`email`, `password_hash`) and a `role` of **admin**, **doctor**, or **patient**.

- **Doctor**
  - Stored in `doctors`, linked to `users` via `user_id`.
  - Holds clinical profile information (name, specialization, experience, achievements, license, profile image).

- **Patient**
  - Stored in `patients`, optionally linked to `users` via `user_id` when the patient has their own login.
  - Holds demographic and basic health information (name, date of birth, sex, age, weight, phone).

- **Slot**
  - Stored in `slots`.
  - Represents a **time window** in which a doctor is available.
  - Key fields:
    - `doctor_id` – which doctor the slot belongs to.
    - `slot_date`, `slot_time` – day and time of the slot.
    - `max_capacity` – maximum number of patients that can book this slot.

- **Appointment**
  - Stored in `appointments`.
  - Represents a **booking** of a slot by a patient.
  - Key fields:
    - `slot_id`, `doctor_id`, `patient_id`.
    - `appointment_date`, `appointment_time` (for convenient querying and denormalized reporting).
    - `visit_type` – `first_time`, `report`, or `follow_up`.
    - `is_family_appointment` – flags when this booking is for family context.
    - `status` – `scheduled`, `waiting`, `consulted`, `completed`, `cancelled`, `no_show`.
    - `complaint`, `notes` – clinical/operational context.
    - `ivr_app_id`, `cancelled_by`, `refund_days`.

- **Payment**
  - Stored in `payments`, tied to a single `appointment`.
  - Supports:
    - `payment_type` – `consultation_fee` or `refund`.
    - `status` – `pending`, `completed`, `refunded` (for outgoing flows).

- **Chat message**
  - Stored in `chat_messages`.
  - Each message is tied to an `appointment`, and carries `sender_role` (`doctor` or `patient`) plus message body.

- **Medical record**
  - Stored in `medical_records`.
  - Created by doctors for patients, usually in the context of an appointment, but linked directly to `patient_id` and `doctor_id`.

- **Feedback**
  - Stored in `feedbacks`.
  - One feedback record per appointment, storing multiple rating dimensions and an optional free-text comment.

- **Review request**
  - Stored in `review_requests`.
  - Manages external review workflows (e.g., Google reviews) per doctor–patient pair.

---

## 2. User Onboarding and Profile Creation

### 2.1 User registration

1. User signs up with email and password.
2. Backend:
   - Hashes the password.
   - Creates a row in `users` with:
     - `email`, `password_hash`, `role`.
3. `users.id` becomes the primary identifier for authentication and authorization.

### 2.2 Doctor profile setup

1. A user with `role = 'doctor'` completes their professional profile.
2. Backend creates or updates a row in `doctors`:
   - `user_id = users.id`.
   - Fill in `name`, `specialization`, `experience_years`, `achievement`, `license_number`, `profile_image_url`.
3. All future clinical operations that require a doctor reference point to `doctors.id`.

### 2.3 Patient profile setup

There are two main patterns:

- **Self-managed patients** (have a login):
  - `users.role = 'patient'`.
  - Backend creates a row in `patients`:
    - `user_id = users.id`.
    - Demographics filled from profile forms.

- **System-managed patients** (e.g. imported or created by staff):
  - Backend creates a row in `patients` with `user_id = null`.
  - Patient can later be linked to a `users` record by updating `patients.user_id`.

Once created, `patients.id` is used to associate appointments, medical records, feedback, and review requests.

---

## 3. Doctor Availability and Slot Management

### 3.1 Creating slots

When a doctor configures availability:

1. UI collects desired days, times, and capacities (e.g. “Monday 10:00–12:00, 10 patients per hour”).
2. Backend converts that into discrete slots (e.g. 10:00, 10:10, 10:20, etc., depending on slot duration logic),
   and inserts rows into `slots`:
   - `doctor_id = doctors.id`.
   - `slot_date`, `slot_time`.
   - `max_capacity` according to configuration.
   - `created_at`, `updated_at` timestamps.

### 3.2 Reading slots for booking

To show available options:

1. Frontend requests slots for a given doctor and date range.
2. Backend queries `slots` filtered by:
   - `doctor_id`.
   - `slot_date` (and possibly `slot_time`).
3. Backend may augment each slot with:
   - current `booked_count`:
     - `COUNT(*) FROM appointments WHERE slot_id = ? AND status NOT IN ('cancelled', 'no_show')`.
   - `remaining_capacity`:
     - `max_capacity - booked_count`.
4. Only slots with `remaining_capacity > 0` are shown as “bookable”.

---

## 4. Booking Flow (Appointment Creation)

### 4.1 Initiating a booking

1. Patient (or staff, acting on behalf of a patient) selects:
   - Doctor.
   - Slot (date/time).
   - Visit type (`first_time`, `report`, `follow_up`).
   - Whether it is a family appointment (`is_family_appointment`).
   - Primary complaint or reason for visit.
2. The client sends these details to the backend.

### 4.2 Capacity check and concurrency control

To avoid overbooking:

1. Backend loads the selected `slot`:
   - `SELECT * FROM slots WHERE id = :slot_id FOR UPDATE` (or equivalent locking/control).
2. Backend counts active appointments for this slot:
   - `SELECT COUNT(*) FROM appointments WHERE slot_id = :slot_id AND status NOT IN ('cancelled', 'no_show')`.
3. Backend compares:
   - If `count >= slots.max_capacity`:
     - Booking is rejected (slot is full).
   - Else:
     - Booking can proceed.

This logic should be executed in a **transaction** or within a well-isolated critical section to prevent race conditions when multiple patients try to book the same slot simultaneously.

### 4.3 Creating the appointment

When capacity allows:

1. Backend inserts a new row into `appointments` with:
   - `slot_id`, `doctor_id`, `patient_id`.
   - `appointment_date`, `appointment_time` (usually copied from the slot).
   - `visit_type`, `is_family_appointment`.
   - `status = 'scheduled'`.
   - `complaint`, `notes` as provided.
   - Any optional fields such as `ivr_app_id` for telephony-based flows.
2. The insert returns `appointments.id`, which is used by downstream features (payments, chat, records).

At this point, the booking exists but may or may not yet be paid for, depending on your business rules.

---

## 5. Payment Lifecycle

### 5.1 Initiating payment

On booking confirmation (or at a later step if allowed by the UX):

1. Backend creates a `payments` record with:
   - `appointment_id`.
   - `amount` (consultation fee).
   - `payment_type = 'consultation_fee'`.
   - `status = 'pending'`.
   - `created_at`, `updated_at`.
2. Payment gateway flow is started using the appointment and payment identifiers.

### 5.2 Successful payment

After the gateway confirms success:

1. Backend updates the corresponding `payments` row:
   - `status = 'completed'`.
   - `paid_at = now()`.
2. Depending on business rules, appointment status may:
   - Remain `scheduled` (if payment is just a prerequisite for the visit).
   - Or transition to another custom state (e.g. `confirmed`) if you later add that state.

### 5.3 Cancellation and refunds

If an appointment is cancelled:

1. Backend updates `appointments`:
   - `status = 'cancelled'`.
   - `cancelled_by = 'doctor' | 'patient' | 'system'`.
   - `refund_days` can be set to indicate refund window or policy used.
2. If a refund is processed:
   - A **new** `payments` row is inserted:
     - `appointment_id` – same appointment.
     - `amount` – refund amount (could be full or partial).
     - `payment_type = 'refund'`.
     - `status = 'completed'` when the refund is successful.

This structure allows a clear ledger-like view where one appointment can have multiple payment events.

---

## 6. Pre-Visit and Visit Day Flow

### 6.1 Reminder and status transitions

Before the visit:

1. Reminder jobs or services query upcoming appointments:
   - `SELECT * FROM appointments WHERE appointment_date = :tomorrow AND status = 'scheduled'`.
2. Notifications are sent (e.g. SMS, email, push).

On visit day:

1. As the patient arrives and checks in, appointment status often moves:
   - `scheduled → waiting`.
2. When the doctor begins the consultation:
   - `waiting → consulted`.
3. When the consultation is fully finished:
   - `consulted → completed`.

These updates are stored in the `appointments.status` field and timestamp columns (`updated_at`) for audit.

### 6.2 Chat during and around the visit

If chat is enabled:

1. Chat UI sends messages, each tagged with:
   - `appointment_id`, `doctor_id`, `patient_id`, `sender_role`, `body`.
2. Backend inserts each message into `chat_messages`.
3. Messages are fetched grouped by `appointment_id` to show a threaded conversation tied to a particular visit.

---

## 7. Medical Records and Clinical Data

### 7.1 Creating medical records

After or during the consultation:

1. Doctor fills out clinical notes (diagnosis, prescription, etc.).
2. Backend inserts a row into `medical_records`:
   - `patient_id`, `doctor_id`.
   - `diagnosis`, `prescription`.
   - `record_date` (usually appointment date).
3. This data can be displayed later in patient history screens or doctor dashboards.

### 7.2 Retrieving patient history

To show a longitudinal view for a patient:

1. Query `appointments` for the patient over time.
2. Join with:
   - `medical_records` by `patient_id` and `doctor_id`.
   - `feedbacks` by `appointment_id`.
3. Optionally also join `payments` to show financial history per consultation.

---

## 8. Post-Visit Feedback and Review Flow

### 8.1 Feedback on consultation and facility

After an appointment is marked `completed`:

1. System prompts the patient to leave feedback.
2. Backend inserts a row into `feedbacks`:
   - `appointment_id`.
   - `consulting_rating`, `hospital_rating`, `waiting_time_rating`.
   - Optional `comment`.
   - `created_at`.
3. Feedback can later be aggregated by doctor or facility for analytics.

### 8.2 External review requests (e.g. Google reviews)

To encourage external reviews:

1. System may create a `review_requests` row after a positive experience:
   - `doctor_id`, `patient_id`, `requested_at`.
2. When the patient confirms or the system detects that a review has been left:
   - Update the same row with `reviewed_at`.
3. This allows tracking of which patients have been asked to review and who completed the flow.

---

## 9. Slot Capacity Enforcement and Reporting

### 9.1 Enforcing `max_capacity` at booking time

The core rule is **“one slot can host up to `max_capacity` active appointments”**.

- To enforce this, every booking attempt:
  - Loads the slot row from `slots`.
  - Counts non-cancelled, non-no-show appointments for that slot.
  - Rejects the booking if the count is already at `max_capacity`.

This pattern ensures that the business constraint is adhered to even in high-concurrency environments when combined with locking or transactions.

### 9.2 Capacity and utilization reporting

For analytics and dashboards:

- **Per slot:**
  - `booked = COUNT(appointments WHERE slot_id = X AND status NOT IN ('cancelled', 'no_show'))`.
  - `utilization = booked / max_capacity`.

- **Per doctor and day:**
  - Aggregate across slots:
    - Total capacity = `SUM(slots.max_capacity)`.
    - Total booked = sum of booked counts for those slots.
    - Overall utilization % for that day.

These metrics are derived from `slots` and `appointments` without needing extra tables.

---

## 10. High-Level End-to-End Example

1. **User registration**
   - Patient signs up → row in `users`, row in `patients` linked by `user_id`.
2. **Doctor onboarding**
   - Doctor account created → row in `users`, row in `doctors` linked by `user_id`.
3. **Slot creation**
   - Doctor sets Monday 10:00 slot with capacity 5 → row in `slots` (`doctor_id = D1`, `max_capacity = 5`).
4. **Patient booking**
   - Patient selects that slot:
     - Backend verifies `booked_count < 5`.
     - Inserts `appointments` row (`slot_id = S1`, `doctor_id = D1`, `patient_id = P1`, `status = 'scheduled'`).
5. **Payment**
   - System creates a `payments` row (`type = 'consultation_fee'`, `status = 'pending'`).
   - After successful gateway payment → update to `status = 'completed'`, set `paid_at`.
6. **Visit day**
   - Patient checks in → appointment `status = 'waiting'`.
   - Doctor starts consultation → `status = 'consulted'`.
   - Consultation ends → `status = 'completed'`.
7. **Clinical documentation**
   - Doctor writes diagnosis/prescription → row in `medical_records` (`patient_id = P1`, `doctor_id = D1`).
8. **Feedback and review**
   - Patient rates the experience → row in `feedbacks` for this appointment.
   - System sends Google review link → row in `review_requests`.
   - When patient confirms review → set `reviewed_at`.

This completes one full, typical data journey through the system, touching all the major tables in a controlled and auditable way.

