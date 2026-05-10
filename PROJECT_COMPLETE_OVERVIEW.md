# 🏥 TeleMedicine Application - Complete Project Overview

**Last Updated**: February 25, 2026

---

## 📋 Table of Contents
1. [Project Summary](#project-summary)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Backend Structure](#backend-structure)
5. [Frontend Structure](#frontend-structure)
6. [Database Models](#database-models)
7. [User Roles & Features](#user-roles--features)
8. [API Endpoints](#api-endpoints)
9. [Real-time Features](#real-time-features)
10. [Key Dashboards](#key-dashboards)
11. [Setup & Running](#setup--running)

---

## 🎯 Project Summary

**TeleMedicine Application** is a comprehensive healthcare platform enabling remote consultations, appointment booking, prescription management, and medicine distribution. It provides role-based access for patients, doctors, pharmacy staff, and administrators.

### Key Statistics
- **4 Major User Roles**: Patient, Doctor, Pharmacy, Admin
- **13 Backend Controllers**: Handling different business domains
- **9 Database Models**: Core entities in the system
- **5 Frontend Dashboards**: Role-specific interfaces
- **25+ API Endpoints**: RESTful backend services
- **Real-time WebSocket Communication**: Live updates & notifications

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Java** | 17 | Programming language |
| **Spring Boot** | 3.5.5 | Web framework & dependency injection |
| **Spring Data JPA** | 3.5.5 | ORM & database access |
| **Spring Security** | 3.5.5 | Authentication & authorization |
| **Spring WebSocket** | 3.5.5 | Real-time bidirectional communication |
| **Maven** | 3.x | Build & dependency management |
| **H2 Database** | Runtime | In-memory database (development) |
| **PostgreSQL** | - | SQL database driver (production) |
| **MySQL Connector** | - | MySQL database driver |
| **Lombok** | Latest | Code generation (getters, setters, constructors) |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **TypeScript** | Latest | Type-safe JavaScript |
| **React** | Latest | UI library |
| **Vite** | Latest | Build tool & dev server |
| **TailwindCSS** | Latest | Utility-first CSS framework |
| **React Router** | Latest | Client-side routing |
| **React Query** | Latest | Data fetching & caching |
| **Socket.IO Client** | 4.7.2 | Real-time communication |
| **Express** | 4.18.2 | Node.js web framework (call server) |
| **Socket.IO** | 4.7.2 | WebSocket library (call server) |

### Additional Services
- **MongoDB** (Optional): Embedded for development, external for production
- **WebRTC**: For video/audio calling
- **CORS**: Cross-Origin Resource Sharing enabled
- **TailwindCSS + PostCSS**: Advanced styling

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (React)                           │
│  ┌─────────────┬──────────────┬──────────────┬─────────────┐    │
│  │   Patient   │   Doctor     │   Pharmacy   │    Admin     │    │
│  │  Dashboard  │  Dashboard   │  Dashboard   │  Dashboard  │    │
│  └─────────────┴──────────────┴──────────────┴─────────────┘    │
│                 (Port: 5173 - Vite Dev Server)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼──────┐  ┌──────▼────────┐
│ REST API       │  │ WebSocket   │  │  WebRTC       │
│ (HTTP/REST)    │  │ (Socket.IO) │  │ Signaling     │
└───────┬────────┘  └──────┬──────┘  └──────┬────────┘
        │                  │                │
        └──────────────────┼────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │   Spring Boot Backend                │
        │   (Port: 8080)                       │
        │  ┌────────────────────────────────┐ │
        │  │   Controllers (13)              │ │
        │  │   Services (8)                  │ │
        │  │   Repositories (9)              │ │
        │  │   Models (9)                    │ │
        │  │   Security & Config             │ │
        │  └────────────────────────────────┘ │
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │   Call Server (Node.js)             │
        │   (Port: 5002)                      │
        │   - Socket.IO server                │
        │   - WebRTC signaling                │
        │   - Room management                 │
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │   Database Layer                    │
        │  ┌────────────────────────────────┐ │
        │  │  H2 (Development)              │ │
        │  │  PostgreSQL/MySQL (Production) │ │
        │  │  MongoDB (Optional)            │ │
        │  └────────────────────────────────┘ │
        └─────────────────────────────────────┘
```

---

## 📁 Backend Structure

```
projectbackend/
├── src/main/java/com/example/projectbackend/
│   ├── ProjectbackendApplication.java          [Main entry point]
│   │
│   ├── controller/                              [13 Controllers]
│   │   ├── AuthController.java                  [Login/Register]
│   │   ├── AppointmentController.java           [Appointment CRUD]
│   │   ├── CallController.java                  [Call management]
│   │   ├── MedicineController.java              [Medicine search]
│   │   ├── PharmacyController.java              [Pharmacy management]
│   │   ├── PrescriptionController.java          [Prescription CRUD]
│   │   ├── HealthRecordController.java          [Health records]
│   │   ├── SymptomController.java               [Symptom analysis]
│   │   ├── WebRTCController.java                [WebRTC signaling]
│   │   ├── ReportController.java                [Analytics & reports]
│   │   ├── AccessDemoController.java            [Demo access]
│   │   ├── DemoController.java                  [Demo endpoints]
│   │   └── TestController.java                  [Testing utilities]
│   │
│   ├── service/                                 [8 Services]
│   │   ├── UserService.java                     [User operations]
│   │   ├── AppointmentService.java              [Appointment logic]
│   │   ├── CallService.java                     [Video/audio calls]
│   │   ├── MedicineService.java                 [Medicine operations]
│   │   ├── PharmacyService.java                 [Pharmacy operations]
│   │   ├── PrescriptionService.java             [Prescription logic]
│   │   ├── SocketService.java                   [WebSocket handling]
│   │   └── SignalingHandler.java                [WebRTC signaling]
│   │
│   ├── model/                                   [9 Database Models]
│   │   ├── User.java                            [Users (role-based)]
│   │   ├── Appointment.java                     [Appointments]
│   │   ├── Call.java                            [Call records]
│   │   ├── Medicine.java                        [Medicines]
│   │   ├── Pharmacy.java                        [Pharmacies]
│   │   ├── Prescription.java                    [Prescriptions]
│   │   ├── HealthRecord.java                    [Health data]
│   │   ├── DoctorAvailability.java              [Doctor schedules]
│   │   └── Report.java                          [System reports]
│   │
│   ├── repository/                              [JPA Repositories]
│   │   ├── UserRepository.java
│   │   ├── AppointmentRepository.java
│   │   ├── CallRepository.java
│   │   ├── MedicineRepository.java
│   │   ├── PharmacyRepository.java
│   │   ├── PrescriptionRepository.java
│   │   └── [Others...]
│   │
│   └── config/
│       ├── SecurityConfig.java                  [Spring Security]
│       ├── CorsConfig.java                      [CORS settings]
│       └── DataInitializer.java                 [Sample data]
│
├── src/main/resources/
│   ├── application.properties                   [Main config]
│   ├── application-dev.properties               [Dev config]
│   └── application-prod.properties              [Prod config]
│
└── pom.xml                                      [Maven dependencies]
```

### Backend Key Dependencies
```xml
<!-- Spring Boot Starters -->
spring-boot-starter-web
spring-boot-starter-data-jpa
spring-boot-starter-security
spring-boot-starter-websocket

<!-- Databases -->
h2 (in-memory)
mysql-connector-java
postgresql

<!-- Tools -->
lombok (code generation)
spring-boot-devtools (live reload)
```

---

## 🎨 Frontend Structure

```
project/
├── src/
│   ├── pages/                                   [Main Pages]
│   │   ├── Index.tsx                            [Landing page]
│   │   ├── AppointmentsPage.tsx                 [Appointments listing]
│   │   ├── SymptomCheckerPage.tsx               [Symptom analysis page]
│   │   └── NotFound.tsx                         [404 page]
│   │
│   ├── components/
│   │   ├── dashboards/                          [5 Role-based Dashboards]
│   │   │   ├── PatientDashboard.tsx
│   │   │   ├── DoctorDashboard.tsx
│   │   │   ├── PharmacyDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── SimplePharmacyDashboard.tsx
│   │   │
│   │   ├── ui/                                  [UI Components]
│   │   │   ├── Button, Input, Card, Modal, etc.
│   │   │   └── [Shadcn UI components]
│   │   │
│   │   └── shared/                              [Shared Components]
│   │       ├── LoginPage.tsx                    [Auth]
│   │       ├── SignUpPage.tsx                   [Registration]
│   │       ├── Header.tsx
│   │       ├── Navbar.tsx
│   │       ├── Layout.tsx
│   │       ├── AppointmentBooking.tsx
│   │       ├── AppointmentCard.tsx
│   │       ├── MedicineSearch.tsx
│   │       ├── HealthRecords.tsx
│   │       ├── SymptomChecker.tsx
│   │       ├── VideoCall.tsx
│   │       ├── CallNotification.tsx
│   │       ├── DoctorSelect.tsx
│   │       ├── LanguageSelector.tsx
│   │       ├── ThemeSelector.tsx
│   │       └── TestComponent.tsx
│   │
│   ├── contexts/                                [Global State]
│   │   ├── AuthContext.tsx                      [Authentication]
│   │   ├── LanguageContext.tsx                  [i18n support]
│   │   └── ThemeContext.tsx                     [Dark/Light mode]
│   │
│   ├── services/                                [API Services]
│   │   ├── api.ts                               [Base API config]
│   │   ├── authService.ts                       [Auth API calls]
│   │   ├── appointmentService.ts                [Appointment API]
│   │   ├── callService.ts                       [Call API]
│   │   ├── medicineService.ts                   [Medicine API]
│   │   ├── pharmacyService.ts                   [Pharmacy API]
│   │   ├── prescriptionService.ts               [Prescription API]
│   │   ├── symptomService.ts                    [Symptom API]
│   │   └── realtimeService.ts                   [Real-time sync]
│   │
│   ├── hooks/                                   [Custom React Hooks]
│   │   └── [useAuth, useAppointments, etc.]
│   │
│   ├── lib/                                     [Utilities]
│   │   └── utils.ts
│   │
│   ├── types/                                   [TypeScript Interfaces]
│   │   └── index.ts
│   │
│   ├── data/                                    [Mock Data]
│   │   └── [Sample doctors, medicines, etc.]
│   │
│   ├── App.tsx                                  [Root component]
│   ├── main.tsx                                 [Entry point]
│   ├── index.css                                [Global styles]
│   └── App.css                                  [App styles]
│
├── public/                                      [Static assets]
│
├── tsconfig.json                                [TypeScript config]
├── vite.config.ts                               [Vite config]
├── tailwind.config.ts                           [TailwindCSS config]
└── package.json                                 [Dependencies]
```

---

## 💾 Database Models

### 1. **User Entity**
```
- id (String/Long)                    [Primary Key]
- email (String, Unique)              [Login credential]
- password (String, Encrypted)        [Login credential]
- name (String)                       [User name]
- role (Enum)                         [PATIENT, DOCTOR, PHARMACY, ADMIN]
- phone (String)                      [Contact number]
- address (String)                    [Physical address]
- specialization (String)             [For doctors - field]
- license_number (String)             [For doctors/pharmacies]
- pharmacy_name (String)              [For pharmacies]
- created_at (Timestamp)
- updated_at (Timestamp)
```

### 2. **Appointment Entity**
```
- id (Long)                           [Primary Key]
- patient_id (Long)                   [Foreign Key to User]
- doctor_id (Long)                    [Foreign Key to User]
- appointment_date (LocalDateTime)    [Scheduled time]
- status (Enum)                       [PENDING, APPROVED, COMPLETED, CANCELLED]
- symptoms (String)                   [Patient complaints]
- notes (String)                      [Doctor notes]
- consultation_type (String)          [VIDEO, AUDIO, IN_PERSON]
- created_at (Timestamp)
- updated_at (Timestamp)
```

### 3. **Call Entity**
```
- id (Long)                           [Primary Key]
- initiator_id (Long)                 [Who started call]
- receiver_id (Long)                  [Who received call]
- call_type (String)                  [VIDEO, AUDIO]
- status (Enum)                       [RINGING, ACCEPTED, REJECTED, ENDED]
- started_at (Timestamp)
- ended_at (Timestamp)
- room_id (String)                    [WebRTC room identifier]
- duration (Long)                     [In seconds]
```

### 4. **Prescription Entity**
```
- id (Long)                           [Primary Key]
- patient_id (Long)                   [Foreign Key to User]
- doctor_id (Long)                    [Foreign Key to User]
- medicine_id (Long)                  [Foreign Key to Medicine]
- dosage (String)                     [e.g., "1 tablet twice daily"]
- duration (String)                   [e.g., "7 days"]
- instructions (String)               [Special instructions]
- status (Enum)                       [ACTIVE, COMPLETED, CANCELLED]
- created_at (Timestamp)
- expires_at (Timestamp)
```

### 5. **Medicine Entity**
```
- id (Long)                           [Primary Key]
- name (String)                       [Medicine name]
- generic_name (String)               [Scientific name]
- manufacturer (String)               [Company]
- dosage_form (String)                [Tablet, Liquid, etc.]
- dosage_strength (String)            [e.g., "500mg"]
- price (Double)                      [Per unit]
- availability (Boolean)              [In stock]
- pharmacy_id (Long)                  [Foreign Key to Pharmacy]
- side_effects (String)               [Adverse effects]
- description (String)
```

### 6. **Pharmacy Entity**
```
- id (Long)                           [Primary Key]
- user_id (Long)                      [Foreign Key to User]
- pharmacy_name (String)              [Business name]
- address (String)                    [Physical location]
- latitude (Double)                   [Geolocation]
- longitude (Double)                  [Geolocation]
- phone (String)                      [Business phone]
- opening_hours (String)              [Operating hours]
- license_number (String)             [Registration number]
- rating (Double)                     [Customer rating 0-5]
- created_at (Timestamp)
```

### 7. **HealthRecord Entity**
```
- id (Long)                           [Primary Key]
- patient_id (Long)                   [Foreign Key to User]
- record_type (String)                [TEST, SCAN, REPORT, etc.]
- description (String)
- file_url (String)                   [Document link]
- created_at (Timestamp)
- doctor_notes (String)               [Doctor's observations]
```

### 8. **DoctorAvailability Entity**
```
- id (Long)                           [Primary Key]
- doctor_id (Long)                    [Foreign Key to User]
- day_of_week (String)                [MON-SUN]
- start_time (LocalTime)
- end_time (LocalTime)
- is_available (Boolean)              [Currently online]
- last_updated (Timestamp)
```

### 9. **Report Entity**
```
- id (Long)                           [Primary Key]
- report_type (String)                [CONSULTATION, PRESCRIPTION, etc.]
- total_count (Long)                  [Number of records]
- generated_at (Timestamp)
- data (JSON)                         [Report details]
```

---

## 👥 User Roles & Features

### 🏥 **PATIENT Role**

**Login Credentials** (Sample):
- Email: `patient1@teleasha.com`
- Password: `password123`

**Features Available**:
1. **Dashboard Overview**
   - Health metrics (heart rate, blood pressure, temp, weight)
   - Today's reminders (medicines, appointments, checkups)
   - Quick actions (Book appointment, View prescriptions, Video call, Find pharmacy)

2. **Appointment Booking**
   - View available doctors
   - Instant booking (immediate consultation)
   - Scheduled booking (select date/time)
   - Track appointment status (Pending, Approved, Completed)

3. **Consultations**
   - Request video/audio call with available doctors
   - Real-time status updates
   - Receive consultation request responses

4. **Prescriptions**
   - View active prescriptions from doctors
   - See medicine details, dosage, duration
   - Mark medicines as taken
   - Real-time notifications when new prescriptions added

5. **Medicine Search**
   - Search medicines by name
   - Check availability at nearby pharmacies
   - View dosage forms and pricing
   - Get side effects and warnings

6. **Pharmacy Finder**
   - Find nearby pharmacies (geolocation)
   - View pharmacy details and hours
   - Check medicine stock levels
   - Get directions

7. **Symptom Checker**
   - Input symptoms for AI analysis
   - Get possible condition matches with confidence scores
   - Get health guidance
   - Book appointment based on symptoms
   - Track symptom history

8. **Health Records**
   - Upload medical reports
   - View historical health data
   - Share with doctors

---

### 👨‍⚕️ **DOCTOR Role**

**Login Credentials** (Sample):
- Email: `dr.sharma@teleasha.com`
- Password: `password123`

**Features Available**:
1. **Dashboard Overview**
   - Today's performance stats (consultations count, prescriptions, emergencies)
   - Recent patients list with status
   - Quick actions (Approve appointments, Write prescriptions, Start consultation)

2. **Doctor Availability**
   - Go online/offline toggle
   - Set availability status
   - Real-time status broadcast to all patients

3. **Appointment Management**
   - View appointment requests from patients
   - Approve/reject appointments
   - View patient symptoms and history
   - Schedule consultations

4. **Consultations**
   - Accept/reject consultation requests
   - Initiate video/audio calls with patients
   - Real-time patient notifications
   - WebRTC-based video communication

5. **Prescription Management**
   - Create prescriptions for patients
   - Specify medicine, dosage, duration
   - Add special instructions
   - Real-time notification to patient and pharmacy

6. **Patient Management**
   - View patient consultation history
   - Access patient health records
   - Track patient prescriptions
   - View appointment history

7. **Reports & Analytics**
   - View consultation statistics
   - Track prescription trends
   - Monitor patient feedback

---

### 💊 **PHARMACY Role**

**Login Credentials** (Sample):
- Email: `pharmacy@teleasha.com`
- Password: `pharmacy123`

**Features Available**:
1. **Dashboard Overview**
   - Pharmacy statistics
   - Inventory status
   - Recent prescriptions
   - Quick actions (Add medicine, Check low stock, Export inventory)

2. **Medicine Inventory**
   - Add/update medicines
   - Manage stock levels
   - Set pricing
   - Mark availability status
   - Track inventory by location

3. **Prescription Management**
   - Receive prescriptions from doctors (real-time notification)
   - Verify medicines available
   - Mark prescription as fulfilled
   - Notify patient on fulfillment

4. **Medicine Availability**
   - Track stock levels for each medicine
   - Receive low stock alerts
   - Update availability status
   - See medicine purchase history

5. **Inventory Management**
   - View all medicines in stock
   - Track expiry dates
   - Manage supplier information
   - Generate inventory reports
   - Export data to CSV

6. **Real-time Notifications**
   - New prescriptions from doctors
   - Medicine availability updates
   - Inventory alerts
   - Patient medicine taken notifications

---

### 🔐 **ADMIN Role**

**Login Credentials**:
- Email: `admin@teleasha.com`
- Password: `admin123`

**Features Available**:
1. **Dashboard Overview**
   - System-wide statistics
   - User management overview
   - Activity analytics

2. **User Management**
   - View all users (patients, doctors, pharmacies)
   - Manage user roles and permissions
   - Enable/disable accounts
   - View user activity logs

3. **System Monitoring**
   - System health status
   - Database connectivity
   - Server performance metrics
   - Error log tracking

4. **Reports & Analytics**
   - Total consultations
   - Revenue reports
   - User activity trends
   - System usage statistics

5. **Data Management**
   - Export system data
   - Manage backups
   - Clear/reset test data
   - Database maintenance

---

## 📡 API Endpoints

### **Authentication Endpoints** (`/api/auth/`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/current-user` | Get logged-in user info | Yes |

### **Appointment Endpoints** (`/api/appointments/`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/appointments/doctors` | Get all available doctors | Yes |
| POST | `/api/appointments/book` | Book new appointment | Yes |
| GET | `/api/appointments/patient/{id}` | Get patient's appointments | Yes |
| GET | `/api/appointments/doctor/{id}` | Get doctor's appointments | Yes |
| GET | `/api/appointments/available-slots/{doctorId}` | Get available time slots | Yes |
| PUT | `/api/appointments/{id}/approve` | Approve appointment (doctor) | Yes |
| PUT | `/api/appointments/{id}/reject` | Reject appointment (doctor) | Yes |
| PUT | `/api/appointments/{id}/complete` | Mark appointment complete | Yes |
| DELETE | `/api/appointments/{id}` | Cancel appointment | Yes |

### **Call Endpoints** (`/api/calls/`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/calls/initiate` | Start video/audio call | Yes |
| PUT | `/api/calls/{id}/accept` | Accept incoming call | Yes |
| PUT | `/api/calls/{id}/reject` | Reject incoming call | Yes |
| PUT | `/api/calls/{id}/end` | End active call | Yes |
| GET | `/api/calls/incoming/{userId}` | Get incoming calls | Yes |
| GET | `/api/calls/history/{userId}` | Get call history | Yes |
| POST | `/api/calls/doctor/online` | Doctor comes online | Yes |
| POST | `/api/calls/doctor/offline` | Doctor goes offline | Yes |
| GET | `/api/calls/doctors/available` | Get online doctors | Yes |
| POST | `/api/calls/consultation/request` | Request consultation | Yes |
| POST | `/api/calls/consultation/{id}/accept` | Accept consultation | Yes |
| POST | `/api/calls/consultation/{id}/reject` | Reject consultation | Yes |

### **Prescription Endpoints** (`/api/prescriptions/`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/prescriptions/create` | Create prescription (doctor) | Yes |
| GET | `/api/prescriptions/patient/{id}` | Get patient prescriptions | Yes |
| GET | `/api/prescriptions/doctor/{id}` | Get doctor's prescriptions | Yes |
| PUT | `/api/prescriptions/{id}` | Update prescription | Yes |
| DELETE | `/api/prescriptions/{id}` | Cancel prescription | Yes |
| PUT | `/api/prescriptions/{id}/mark-taken` | Mark medicine as taken | Yes |

### **Medicine Endpoints** (`/api/medicines/`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/medicines/search?q={query}` | Search medicines by name | No |
| GET | `/api/medicines/popular` | Get most prescribed medicines | No |
| GET | `/api/medicines/availability/{name}` | Check medicine availability | No |
| GET | `/api/medicines/{id}` | Get medicine details | No |
| POST | `/api/medicines/create` | Add new medicine (pharmacy) | Yes |
| PUT | `/api/medicines/{id}` | Update medicine info | Yes |
| PUT | `/api/medicines/{id}/update-stock` | Update stock level | Yes |

### **Pharmacy Endpoints** (`/api/pharmacies/`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/pharmacies/nearby` | Get nearby pharmacies | Yes |
| GET | `/api/pharmacies/search` | Search pharmacies | Yes |
| GET | `/api/pharmacies/{id}` | Get pharmacy details | No |
| GET | `/api/pharmacies/{id}/medicines` | Get medicines at pharmacy | No |
| POST | `/api/pharmacies/register` | Register new pharmacy | Yes |
| PUT | `/api/pharmacies/{id}` | Update pharmacy info | Yes |
| GET | `/api/pharmacies/{id}/inventory` | Get pharmacy inventory | Yes |

### **Health Records Endpoints** (`/api/health-records/`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/health-records/upload` | Upload health record | Yes |
| GET | `/api/health-records/patient/{id}` | Get patient health records | Yes |
| DELETE | `/api/health-records/{id}` | Delete health record | Yes |

### **Symptom Endpoints** (`/api/symptoms/`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/symptoms/check` | Analyze symptoms (AI) | No |
| GET | `/api/symptoms/common` | Get common symptoms list | No |

### **WebRTC Endpoints** (`/api/webrtc/`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/webrtc/signal` | Send WebRTC signal | Yes |
| GET | `/api/webrtc/signal/{userId}` | Get pending signals | Yes |
| POST | `/api/webrtc/join-room` | Join video call room | Yes |
| POST | `/api/webrtc/offer` | Send WebRTC offer | Yes |
| POST | `/api/webrtc/answer` | Send WebRTC answer | Yes |
| POST | `/api/webrtc/ice-candidate` | Send ICE candidate | Yes |

### **Report Endpoints** (`/api/reports/`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/reports/consultations` | Consultation reports | Yes |
| GET | `/api/reports/prescriptions` | Prescription reports | Yes |
| GET | `/api/reports/revenue` | Revenue reports | Yes |
| GET | `/api/reports/user-activity` | User activity logs | Yes |

### **Demo/Test Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/demo/health` | System health check | No |
| POST | `/api/demo/test-login` | Test login | No |

---

## 🔌 Real-time Features (WebSocket/Socket.IO)

### **Doctor Presence Events**
```
Socket Event: doctor_online
├── Triggered When: Doctor clicks "Go Online"
├── Broadcast To: All connected patients
├── Data: {doctorId, name, specialization, availableTime}
└── Action: Patients see doctor as available

Socket Event: doctor_offline
├── Triggered When: Doctor clicks "Go Offline" or disconnects
├── Broadcast To: All connected patients
├── Data: {doctorId}
└── Action: Doctor removed from available list
```

### **Consultation Flow Events**
```
Socket Event: consultation_request
├── Triggered When: Patient requests consultation
├── Sent To: Specific doctor
├── Data: {patientId, patientName, requestTime, symptoms}
└── Action: Doctor receives real-time notification

Socket Event: consultation_accepted
├── Triggered When: Doctor accepts consultation
├── Sent To: Patient + Pharmacy (if needed)
├── Data: {consultationId, roomId, startTime}
└── Action: Video call initiated

Socket Event: consultation_rejected
├── Triggered When: Doctor rejects consultation
├── Sent To: Patient
├── Data: {consultationId, reason}
└── Action: Patient notified, can request another
```

### **Prescription Notification Events**
```
Socket Event: prescription_added
├── Triggered When: Doctor creates prescription
├── Sent To: Patient + Pharmacy
├── Data: {prescriptionId, medicines, dosage, duration}
└── Action: 
    ├── Patient: See new prescription in dashboard
    └── Pharmacy: Receive prescription alert

Socket Event: prescription_fulfilled
├── Triggered When: Pharmacy marks prescription as fulfilled
├── Sent To: Patient + Doctor
├── Data: {prescriptionId, pharmacy, availableDate}
└── Action: All parties notified of fulfillment
```

### **Video Call Signaling Events**
```
Socket Event: join-room
├── Purpose: Patient/Doctor join video call room
├── Data: {userId, roomId, userName}

Socket Event: offer
├── Purpose: Send WebRTC offer (video/audio setup)
├── Data: {from, to, offer}

Socket Event: answer
├── Purpose: Accept WebRTC connection
├── Data: {from, to, answer}

Socket Event: ice-candidate
├── Purpose: Send ICE candidate for NAT traversal
├── Data: {from, to, candidate}

Socket Event: end-call
├── Purpose: Terminate video/audio call
├── Data: {roomId, callId}
```

### **Real-time Synchronization Events**
```
Socket Event: inventory_updated
├── Triggered When: Pharmacy updates medicine stock
├── Broadcast To: All connected users
├── Data: {medicineId, newStock, pharmacy}

Socket Event: appointment_status_changed
├── Triggered When: Appointment status updates
├── Sent To: Patient + Doctor
├── Data: {appointmentId, newStatus}

Socket Event: medicine_taken
├── Triggered When: Patient marks medicine as taken
├── Broadcast To: Doctor + Pharmacy
├── Data: {prescriptionId, medicine, timestamp}
```

---

## 🎨 Key Dashboards

### 1. **Patient Dashboard**
```
┌─────────────────────────────────────────────────┐
│            PATIENT DASHBOARD                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Health Metrics Section:                        │
│  ├─ Heart Rate: 72 bpm                         │
│  ├─ Blood Pressure: 120/80 mmHg                │
│  ├─ Temperature: 98.6°F                        │
│  └─ Weight: 70 kg                              │
│                                                 │
│  Today's Reminders:                             │
│  ├─ Medicine: Aspirin - 1 tablet (10:00 AM)   │
│  ├─ Appointment: Dr. Sharma - 2:00 PM         │
│  └─ Checkup: Routine checkup - Tomorrow       │
│                                                 │
│  Quick Actions (Tabs):                          │
│  ├─ Book Appointment → Appointment booking    │
│  ├─ View Prescriptions → Active prescriptions │
│  ├─ Video Call → Available doctors            │
│  └─ Find Pharmacy → Nearby pharmacies         │
│                                                 │
│  Additional Tabs:                               │
│  ├─ Appointments                                │
│  ├─ Prescriptions                               │
│  ├─ Health Records                             │
│  ├─ Medicines                                   │
│  ├─ Pharmacy Finder                            │
│  └─ Symptoms Checker                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. **Doctor Dashboard**
```
┌─────────────────────────────────────────────────┐
│            DOCTOR DASHBOARD                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  Status: [Online]/[Offline] Toggle             │
│  Connection: Connected ✓                       │
│                                                 │
│  Today's Performance:                           │
│  ├─ Consultations: 5                           │
│  ├─ Prescriptions: 12                          │
│  ├─ Emergencies: 1                            │
│  └─ Revenue: $250                              │
│                                                 │
│  Recent Patients:                               │
│  ├─ Ramesh Kumar (Cardiac Issues) [Video Call]│
│  ├─ Sunita Devi (Fever) [Video Call]          │
│  └─ Kiran Patel (Checkup) [Video Call]        │
│                                                 │
│  Quick Actions (Tabs):                          │
│  ├─ Approve Appointments → Pending requests   │
│  ├─ Write Prescriptions → Add prescription    │
│  ├─ Start Consultation → Available patients   │
│  └─ Patient Messages → Coming soon            │
│                                                 │
│  Additional Tabs:                               │
│  ├─ Appointments                                │
│  ├─ Consultations                               │
│  ├─ Prescriptions                               │
│  └─ Patient History                            │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3. **Pharmacy Dashboard**
```
┌─────────────────────────────────────────────────┐
│           PHARMACY DASHBOARD                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Pharmacy Stats:                                │
│  ├─ Total Medicines: 1250                      │
│  ├─ Low Stock Items: 28                        │
│  ├─ Today's Prescriptions: 7                  │
│  └─ Revenue: $1800                             │
│                                                 │
│  Quick Actions (Tabs):                          │
│  ├─ Add Medicine → New medicine entry          │
│  ├─ Low Stock → Items below threshold          │
│  ├─ Export → Export inventory to CSV           │
│  └─ Refresh → Reload inventory data            │
│                                                 │
│  Recent Prescriptions:                          │
│  ├─ Dr. Sharma → Aspirin 500mg x 3            │
│  ├─ Dr. Patel → Amoxicillin 250mg x 1         │
│  └─ Dr. Mehta → Paracetamol 500mg x 2         │
│                                                 │
│  Additional Tabs:                               │
│  ├─ Add Medicine                                │
│  ├─ Inventory                                   │
│  ├─ Prescriptions                               │
│  └─ Settings                                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4. **Admin Dashboard** (Placeholder)
```
┌─────────────────────────────────────────────────┐
│            ADMIN DASHBOARD                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  System Statistics:                             │
│  ├─ Total Users: 1,250                        │
│  ├─ Total Consultations: 3,421                │
│  ├─ Total Prescriptions: 8,921                │
│  ├─ System Uptime: 99.9%                      │
│  └─ Database: Healthy                         │
│                                                 │
│  User Management:                               │
│  ├─ Patients: 650                             │
│  ├─ Doctors: 120                              │
│  ├─ Pharmacies: 45                            │
│  └─ Admins: 5                                 │
│                                                 │
│  Quick Actions:                                 │
│  ├─ View User Logs                            │
│  ├─ Export Reports                            │
│  ├─ System Settings                           │
│  └─ Database Maintenance                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Setup & Running

### **Prerequisites**
```
✓ Java 17 or higher
✓ Node.js 16+ and npm
✓ Maven 3.6+
✓ Git
✓ Any of: MySQL, PostgreSQL, H2 (embedded)
```

### **Backend Setup**

1. **Navigate to backend**
```bash
cd projectbackend
```

2. **Install dependencies** (Maven wrapper)
```bash
mvn clean install
# Or on Windows
mvnw clean install
```

3. **Configure database** (Edit: `src/main/resources/application.properties`)
```properties
# For H2 (embedded - development)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# Or for PostgreSQL (production)
spring.datasource.url=jdbc:postgresql://localhost:5432/telemedicine
spring.datasource.username=postgres
spring.datasource.password=password
```

4. **Run the backend**
```bash
# Using Maven wrapper
mvnw spring-boot:run

# Or using Java directly (after building)
java -jar target/projectbackend-0.0.1-SNAPSHOT.jar
```

**Backend URL**: `http://localhost:8080`

### **Frontend Setup**

1. **Navigate to frontend**
```bash
cd project
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

**Frontend URL**: `http://localhost:5173`

### **Call Server Setup** (Optional)

1. **Navigate to root directory**
```bash
cd <root>  # Back to project root
```

2. **Install dependencies**
```bash
npm install
```

3. **Start call server**
```bash
npm start
# or for development with auto-reload
npm run dev
```

**Call Server URL**: `http://localhost:5002`

### **Quick Start (All in One)**

```bash
# Windows
INSTALL_AND_FIX.bat

# Or run services in separate terminals:

# Terminal 1: Backend
cd projectbackend
mvnw spring-boot:run

# Terminal 2: Frontend
cd project
npm run dev

# Terminal 3: Call Server (Optional)
npm start
```

### **Access Application**

1. Open browser: `http://localhost:5173`
2. **Quick Login Options**:
   - Patient: `patient1@teleasha.com` / `password123`
   - Doctor: `dr.sharma@teleasha.com` / `password123`
   - Pharmacy: `pharmacy@teleasha.com` / `pharmacy123`
   - Admin: `admin@teleasha.com` / `admin123`

---

## 📊 Project Statistics

| Metric | Count |
|--------|-------|
| **Controllers** | 13 |
| **Services** | 8 |
| **Database Models** | 9 |
| **API Endpoints** | 50+ |
| **Frontend Pages** | 4 |
| **Dashboards** | 5 |
| **Components** | 20+ |
| **Real-time Events** | 15+ |
| **User Roles** | 4 |
| **Core Features** | 25+ |

---

## 🎯 Key Features Summary

✅ **Complete User Authentication** - Role-based login/registration
✅ **Appointment System** - Book instant or scheduled appointments
✅ **Video/Audio Calls** - WebRTC-based real-time communication
✅ **Prescription Management** - Doctor creates, Pharmacy fulfills, Patient tracks
✅ **Medicine Search** - Search & check availability
✅ **Pharmacy Finder** - Location-based pharmacy discovery
✅ **Symptom Checker** - AI-powered health analysis
✅ **Real-time Notifications** - WebSocket-based instant updates
✅ **Health Records** - Upload & track medical documents
✅ **Doctor Availability** - Online/offline status management
✅ **Admin Dashboard** - System monitoring & user management
✅ **Responsive Design** - Works on all devices
✅ **Dark/Light Theme** - Customizable interface
✅ **Multi-language Support** - i18n ready

---

## 🔐 Security Features

- **Spring Security** - Authentication & authorization
- **Password Encryption** - BCrypt hashing
- **CORS Configuration** - Cross-origin resource sharing
- **Role-based Access Control** - Feature access by user role
- **Input Validation** - Server-side data validation
- **JWT Support** - Token-based authentication
- **WebSocket Security** - Secured real-time communication

---

## 📝 Notes

- All endpoints return JSON format
- Timestamps are in ISO-8601 format
- IDs are incremental numbers (Long)
- Roles are case-sensitive (UPPERCASE)
- Database supports H2 (development), PostgreSQL, MySQL (production)
- WebRTC requires STUN/TURN servers for NAT traversal
- Real-time features require Socket.IO connection

---

**Generated**: February 25, 2026
**Project Status**: Production-Ready ✅
