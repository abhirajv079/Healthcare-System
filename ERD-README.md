# Healthcare System – ER Diagram (Schedula Wireframe v2.0)

This database backs a **doctor / healthcare scheduling app** (find doctor, book appointments, pay, chat, feedback, family booking, support). The ER diagram is in **`healthcare_erd.dbml`** (open in [dbdiagram.io](https://dbdiagram.io) to view).

---

## In Easy Words

| Entity | What it is |
|--------|------------|
| **Users** | Who can log in. One account per person; role: **Admin**, **Doctor**, or **Patient**. |
| **Doctors** | Doctor profile: name, specialization, years of experience, achievement (e.g. Gold Medalist), license, photo. One user = one doctor. |
| **Patients** | Person who gets treatment: name, DOB, sex, age, weight, phone. Either “self” (linked to user) or a family member (linked to care seeker). |
| **Care seekers** | Friends & family added by a user (e.g. wife, son). Used to book appointments for them; can be “invited” to the app later. |
| **Appointments** | One booked slot: doctor + patient, date/time, token #, visit type (first time / report / follow-up), family appointment flag, status (scheduled, waiting, consulted, completed, cancelled, no_show), complaint, optional IVR app ID, cancel/refund info. |
| **Payments** | Payment for an appointment (e.g. consulting fee, refund). Amount, type, status, paid_at. |
| **Chat messages** | Patient–doctor chat in context of an appointment. Sender (doctor/patient), body, created_at. |
| **Medical records** | Doctor’s note for a patient: diagnosis, prescription, record date. |
| **Feedbacks** | Post-consultation ratings: consulting, hospital/clinic, waiting time (each 1–5), optional comment. One per appointment. |
| **Support tickets** | Patient-facing support: subject, status (open / resolved). |
| **Patient communities** | Groups by doctor (e.g. “New mothers who visit Dr. Kumar”). Doctor has many; patients join via **patient_community_members**. |
| **Review requests** | Request for patient to leave a Google review for a doctor; track requested_at and optional reviewed_at. |

---

## How It Fits Together

- **User** = single login; **Doctor** and **Patient** extend it (one-to-one).
- **Care seekers** = family members added by a user; they can get **patients** (and appointments) without having their own login until invited.
- **Appointment** = link between one doctor and one patient (date, time, token, visit type, status, complaint, IVR id, cancel/refund). One doctor / one patient can have many appointments.
- **Payment** = tied to an appointment (consultation fee or refund).
- **Chat messages** = belong to an appointment; sent by doctor or patient.
- **Medical record** = one patient, one doctor; diagnosis + prescription.
- **Feedback** = one per appointment (3 ratings + comment).
- **Support ticket** = one per patient (open/resolved).
- **Patient community** = per doctor; patients join via **patient_community_members** (e.g. copatient collaboration).
- **Review request** = one per doctor–patient pair for Google review flow.

---

## Relationships (Technical)

| From | To | Type |
|------|----|------|
| User | Doctor | One-to-One |
| User | Patient | One-to-One (for “self”) |
| User | Care seeker | One-to-Many (added by) |
| Care seeker | Patient | One-to-One (when family member has profile) |
| Doctor | Appointment | One-to-Many |
| Patient | Appointment | One-to-Many |
| Appointment | Payment | One-to-Many |
| Appointment | Chat message | One-to-Many |
| Appointment | Feedback | One-to-One |
| Doctor | Medical record | One-to-Many |
| Patient | Medical record | One-to-Many |
| Patient | Support ticket | One-to-Many |
| Doctor | Patient community | One-to-Many |
| Patient community | Patient (members) | Many-to-Many |
| Doctor + Patient | Review request | One-to-Many per side |

---

## Screens from Wireframes (mapped to entities)

- **Add Patient details / Patient details** → patients (name, age, sex, weight, complaint), doctors (for context).
- **Visit type, Family appointment, Make payment** → appointments (visit_type, is_family_appointment), payments.
- **Patient chat** → chat_messages (per appointment).
- **My Appt** (Upcoming / Past / Cancelled) → appointments (status, list by doctor + patient + time).
- **Appointment details** → appointments (token, status Waiting/Consulted, Reschedule, Cancel, Live tracking), payments (Make payment).
- **Appointment cancel / reschedule** → appointments (status, cancelled_by, refund_days, reschedule flow).
- **Consulting feedback** → feedbacks (consulting_rating, hospital_rating, waiting_time_rating).
- **Appointment Reminders** → appointments (filter by date/time).
- **Appointment Reschedule by doctor** → appointments (cancelled_by, refund_days), payments (refund).
- **Patient reengagement** → follow-up flow (can use chat_messages or a separate follow-up table if needed).
- **Seamless appointment (IVR)** → appointments (ivr_app_id).
- **Copatient – collaboration** → patient_communities, patient_community_members.
- **Patient – Customer Support** → support_tickets (Open / Resolved, New support).
- **Friends & Family** → care_seekers (name, gender, age, relationship), invite + book for them.
- **Google Review Requested** → review_requests.

---

## Design Notes

- **Normalization**: 3NF; minimal redundancy; clear FKs.
- **Single auth**: All roles use one **users** table; role-specific data in **doctors** / **patients**.
- **Care seekers vs patients**: “Self” = patient with user_id. Family = care_seeker; when booking for them, use a patient row linked by care_seeker_id (or create one when needed).
- **Appointment lifecycle**: scheduled → waiting → consulted → completed; or cancelled / no_show; cancel by doctor can trigger refund (refund_days).
- **ORM-friendly**: Easy to map to TypeORM or similar with the refs above.

---

## Key Fields Quick Reference

- **Appointment status**: `scheduled`, `waiting`, `consulted`, `completed`, `cancelled`, `no_show`
- **Appointment visit_type**: `first_time`, `report`, `follow_up`
- **Payment payment_type**: `consultation_fee`, `refund`
- **Support ticket status**: `open`, `resolved`
