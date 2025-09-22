# PostgreSQL Setup Guide

## For Development (Current Setup)
- Uses H2 database (file-based, user-specific)
- No additional setup required
- Data stored in `${user.home}/.telemedicine/`

## For Production (PostgreSQL)

### 1. Install PostgreSQL
```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# Ubuntu/Debian:
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS:
brew install postgresql
```

### 2. Create Database and User
```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE telemedicine_db;

-- Create user
CREATE USER telemedicine_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE telemedicine_db TO telemedicine_user;

-- Exit
\q
```

### 3. Switch to Production Profile
```bash
# Set environment variables
export DB_USERNAME=telemedicine_user
export DB_PASSWORD=secure_password

# Run with production profile
java -jar -Dspring.profiles.active=prod projectbackend.jar
```

## Database Features

### Current Implementation:
✅ **Relational Database** (H2/PostgreSQL)
✅ **JPA/Hibernate** - Object-relational mapping
✅ **Repository Pattern** - Data access layer
✅ **Entity Relationships** - User ↔ Appointment
✅ **REST APIs** - Data exposure to frontend
✅ **Profile-based Configuration** - Dev/Prod environments

### Data Models:
- **User**: id, name, email, password, role, specialization, etc.
- **Appointment**: id, patient, doctor, date, time, status, symptoms, etc.

### Shared Data Access:
- All users can see available doctors
- Patients can book appointments with any doctor
- Doctors can see their appointments
- Data persists across sessions and users