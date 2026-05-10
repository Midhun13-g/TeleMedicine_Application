# 🏥 TeleMedicine Application

A full-stack real-time telemedicine platform enabling doctor-patient video consultations, live prescription management, appointment booking, pharmacy management, and AI-powered symptom checking.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Spring Boot 3.5, Java 17, Spring Security, JPA |
| Real-time Server | Node.js, Express, Socket.IO |
| Symptom Checker | Python, FastAPI |
| Database | H2 (dev), MySQL / PostgreSQL (prod) |
| Communication | WebRTC, WebSocket, STOMP |

---

## 🏗️ System Architecture

```
┌──────────────────────┐        ┌──────────────────────┐
│   React Frontend     │◄──────►│  Spring Boot Backend │
│   (Port 5173)        │  REST  │  (Port 8080)         │
└──────────┬───────────┘        └──────────┬───────────┘
           │                               │
           │  Socket.IO                    │  JPA
           ▼                               ▼
┌──────────────────────┐        ┌──────────────────────┐
│  Unified Call Server │        │  H2 / MySQL /        │
│  Node.js (Port 5002) │        │  PostgreSQL Database  │
└──────────────────────┘        └──────────────────────┘
           │
           │  HTTP
           ▼
┌──────────────────────┐
│  Symptom Checker API │
│  FastAPI (Port 8000) │
└──────────────────────┘
```

---

## 📁 Project Structure

```
TeleMedicine_Application/
├── project/                  # React Frontend
│   └── src/
│       ├── components/       # UI components & dashboards
│       ├── services/         # API & socket service calls
│       ├── contexts/         # Auth, Theme, Language contexts
│       ├── hooks/            # Custom React hooks
│       └── pages/            # Route pages
├── projectbackend/           # Spring Boot Backend
│   └── src/main/java/
│       ├── controller/       # REST API controllers
│       ├── service/          # Business logic
│       ├── model/            # JPA entities
│       ├── repository/       # Data access layer
│       └── config/           # Security, CORS, WebSocket config
├── Symptom_checker/          # Python FastAPI service
│   ├── backend/              # FastAPI app + dataset
│   └── frontend/             # Standalone symptom checker UI
├── unified-call-server.js    # Node.js Socket.IO call server
└── package.json              # Call server dependencies
```

---

## ✨ Features

### 👨‍⚕️ Doctor
- Go online/offline to manage availability
- Receive real-time consultation requests from patients
- Accept or reject consultation requests
- Start video/audio calls with patients
- Add prescriptions that instantly notify patients
- View and manage appointments
- Access patient health records

### 👤 Patient
- View available (online) doctors in real-time
- Request video or audio consultations
- Receive instant prescription notifications
- Book and manage appointments
- Search medicines and check availability
- View health records and reports
- AI-powered symptom checker

### 🏪 Pharmacy
- Manage medicine inventory
- View and fulfill prescriptions
- Update medicine availability

### 🔧 Admin
- Manage users (doctors, patients, pharmacies)
- System-wide oversight

### 🔄 Real-time
- Live doctor presence (online/offline)
- Instant consultation request/accept/reject flow
- Real-time prescription delivery to patient portal
- WebRTC peer-to-peer video/audio calls
- WebSocket-based signaling

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |

### Calls & Consultations
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/calls/doctor/online` | Set doctor online |
| POST | `/api/calls/doctor/offline` | Set doctor offline |
| GET | `/api/calls/doctors/available` | Get available doctors |
| POST | `/api/calls/consultation/request` | Request consultation |
| POST | `/api/calls/consultation/{id}/accept` | Accept consultation |
| POST | `/api/calls/consultation/{id}/reject` | Reject consultation |

### Prescriptions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/prescriptions` | Create prescription |
| GET | `/api/prescriptions/patient/{id}` | Get patient prescriptions |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments/patient/{id}` | Get patient appointments |
| GET | `/api/appointments/doctor/{id}` | Get doctor appointments |

### Medicines & Pharmacy
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/medicines/search` | Search medicines |
| GET | `/api/pharmacy` | List pharmacies |
| POST | `/api/pharmacy/medicines` | Add medicine |

### Health Records
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health-records/patient/{id}` | Get health records |
| POST | `/api/health-records` | Add health record |

### Symptom Checker
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/check` | Check symptoms (FastAPI) |

---

## 🔌 Socket Events

| Event | Direction | Description |
|---|---|---|
| `doctor_online` | Doctor → Server | Doctor comes online |
| `doctor_offline` | Doctor → Server | Doctor goes offline |
| `consultation_request` | Patient → Doctor | New consultation request |
| `consultation_accepted` | Doctor → Patient | Consultation accepted |
| `consultation_rejected` | Doctor → Patient | Consultation rejected |
| `prescription_added` | Doctor → Patient | New prescription notification |
| `patient_subscribe` | Patient → Server | Subscribe to doctor updates |

---

## 🔄 Workflow

### Consultation Flow
```
Patient sees online doctor
        ↓
Patient sends consultation request
        ↓
Doctor receives real-time notification
        ↓
Doctor accepts → WebRTC video call starts
Doctor rejects → Patient notified
        ↓
Doctor adds prescription during/after call
        ↓
Patient receives instant prescription notification
```

### Symptom Checker Flow
```
Patient enters symptoms
        ↓
Request sent to FastAPI service
        ↓
Fuzzy matching against disease dataset
        ↓
Top 5 possible conditions returned with match scores
```

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8+
- Python 3.9+

---

### 1. Call Server (Socket.IO)
```bash
# From root directory
npm install
node unified-call-server.js
# Runs on http://localhost:5002
```

### 2. Spring Boot Backend
```bash
cd projectbackend
mvn clean install -DskipTests
mvn spring-boot:run
# Runs on http://localhost:8080
```

### 3. React Frontend
```bash
cd project
npm install
npm run dev
# Runs on http://localhost:5173
```

### 4. Symptom Checker (optional)
```bash
cd Symptom_checker/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

---

## 🌐 Access URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Call Server | http://localhost:5002 |
| Symptom Checker | http://localhost:8000 |
| H2 Console | http://localhost:8080/h2-console |

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|---|---|---|
| Doctor | doctor@example.com | password |
| Patient | patient@example.com | password |

---

## 🔒 Security

- Spring Security with role-based access control (DOCTOR, PATIENT, PHARMACY, ADMIN)
- CORS configured for cross-origin requests
- DTLS encryption for WebRTC media streams
- Input validation on all API endpoints
- Automatic session cleanup on socket disconnect
