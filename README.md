# CareCompass: Multilingual Voice-First Healthcare Navigator

> **Hack IIITD · Track: AI for Healthcare Access**  
> Complete React frontend conforming strictly to `CareCompass_Frontend_Spec.md` and the 9-table Supabase/PostgreSQL schema.

---

## 🌟 Overview

**CareCompass** routes patients and family members to the right level of medical care in seconds. A user describes their health concerns in **Hindi, English, or Hinglish** using voice or text. The app determines:
1. **What kind of care fits** (`paramedic_home_visit`, `nurse`, `gp_teleconsult`, `specialist`, `emergency_referral`)
2. **How urgent it is** (`routine`, `same_day`, `immediate`)
3. **Who should go** (ranked caregivers matched by proximity, language, and clinical score)
4. **Follows up until help arrives** (post-booking active symptom check-ins with auto-escalation)

> **Clinical Routing Rule:** CareCompass routes only. It never diagnoses and never prescribes medications.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

The application will be live at: **`http://127.0.0.1:5173/`**

---

## 🗄️ Database Schema & RLS Integration

The frontend directly mirrors the provided PostgreSQL schema with Supabase Auth:

| Table | Purpose | Browser Access (RLS) | Implemented in Frontend |
|---|---|---|---|
| `profiles` | User account & preferred language | Read/Update own row | [supabase.js](file:///c:/Users/Kalash/Desktop/carecompass/src/services/supabase.js) |
| `members` | Family medical profiles (Papa, Mummy, etc.) | Full CRUD on own members | [PatientEditPage.jsx](file:///c:/Users/Kalash/Desktop/carecompass/src/pages/PatientEditPage.jsx) |
| `caregivers` | Caregiver directory (Nurse, EMT, GP) | Backend service role | Embedded via API & mock engine |
| `caregiver_availability`| Time windows for booking | Backend service role | [SlotPicker](file:///c:/Users/Kalash/Desktop/carecompass/src/pages/BookingPage.jsx) |
| `triage_sessions` | Triage conversation history | Insert/Read own | [triageEngine.js](file:///c:/Users/Kalash/Desktop/carecompass/src/services/triageEngine.js) |
| `triage_decisions` | Care type, urgency, red flags, reasoning | Via API response | [ResultPage.jsx](file:///c:/Users/Kalash/Desktop/carecompass/src/pages/ResultPage.jsx) |
| `triage_matches` | Ranked caregiver recommendations | Via API response | [CaregiversPage.jsx](file:///c:/Users/Kalash/Desktop/carecompass/src/pages/CaregiversPage.jsx) |
| `bookings` | Scheduled visits & status timeline | Read own; backend insert | [BookingPage.jsx](file:///c:/Users/Kalash/Desktop/carecompass/src/pages/BookingPage.jsx) |
| `decision_audit` | Audit log for dispatch events | Backend service role | Recorded on booking & triage events |

### Connecting Supabase
To connect to your live Supabase project, create a `.env` file in the root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
If `.env` is omitted, the built-in **High-Fidelity Local Engine** operates seamlessly with full state persistence in `localStorage`.

---

## 📱 Complete Screen & Route Inventory

1. **`/` (Landing Page)**: Trilingual switcher (हिन्दी, English, Hinglish), giant microphone button ("बोलने के लिए दबाएँ"), type-instead link, and 1-tap demo test scenarios.
2. **`/login` (Demo Login)**: Phone number entry, demo OTP hint (`1234`), 1-tap persona login (Rohit - Hinglish, Sunita - Hindi), continue without login.
3. **`/patients` (Patient Picker)**: Family cards (Papa, Mummy, Self, Child) showing derived age from `date_of_birth`, blood group, and medical notes.
4. **`/patients/new` & `/patients/:id` (Create/Edit Profile)**: Complete form matching `members` schema with voice dictation for text fields and DPDP Act 2023 consent modal.
5. **`/describe` (Intake)**: Giant mic with live audio waveform, browser speech recognition (`hi-IN` & `en-IN`), live editable transcript, client-side safety net red-flag detector.
6. **`/followup` (Clinical Follow-up)**: Stepwise question card with Yes/No/Not sure buttons, voice answer, speaker read-aloud, and skip link.
7. **`/result` (Triage Result)**: Care type headline + icon, urgency badge (Green/Amber/Red), reasoning summary, and persistent Safety-Net advice box ("Call 112 if...").
8. **`/caregivers` (Recommendations)**: Top recommended card + 2 alternatives with proximity, verified qualifications, slot, score, and match explanation.
9. **`/booking/:id` (Booking & Status)**: Large slot picker, clinical handoff preview, 1-tap confirmation, direct call caregiver button, status timeline stepper.
10. **`/checkin/:id` (Post-Booking Symptom Monitor)**: "Better / Same / Worse / Difficulty Breathing" choices. "Simulate 2 hours later" control. Worsening symptoms trigger automatic emergency escalation.
11. **`/emergency` (Emergency Screen)**: Red high-contrast full-bleed screen, giant "Call 112" link, ambulance helplines (108, 102), Tele-MANAS (14416), 4 generic "While you wait" rules, auto TTS read-aloud, and emergency family alert SMS trigger.
12. **`/dashboard` (Safety Dashboard - Judge Facing)**: Emergency recall (98.5%), under-triage rate (1.5%), over-triage rate, interactive Recall Dial sensitivity slider, Urgency Confusion Matrix (N=1,420), and live test case runner.
13. **`/call-sim` (IVR & WhatsApp Simulation)**: Interactive feature-phone IVR dialer ("Press 1 for Hindi...") with spoken voice prompts, and interactive WhatsApp chat channel.
14. **`/privacy` (DPDP Act 2023 Consent & Rights)**: Plain-language consent toggle, view stored medical records, and "Delete All My Data" full wipe.

---

## 🛡️ Clinical Safety Guarantees

1. **Emergency is never more than 1 tap away**: Global red 112 button present on all screens.
2. **Escalate on doubt**: Negation handling ensures phrases like *"saans mein koi dikkat nahi hai"* do not falsely escalate, while true red flags (*"saans nahi aa rahi"*, *"behosh"*) route to emergency immediately.
3. **No Diagnoses, No Prescriptions**: The app routes care logistics only.
