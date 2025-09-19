# MongoDB Setup for TeleMedicine Application

## 🚀 Quick Setup

### 1. Install MongoDB
**Windows:**
```bash
# Download from https://www.mongodb.com/try/download/community
# Or use chocolatey
choco install mongodb
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
```

### 2. Start MongoDB Service
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
mongod --dbpath /path/to/data/directory
```

### 3. Verify MongoDB is Running
```bash
# Connect to MongoDB shell
mongosh
# or older versions
mongo

# Should connect to mongodb://localhost:27017
```

## 📋 Configuration Changes Made

### Backend Changes:
- **Dependencies**: Replaced `spring-boot-starter-data-jpa` with `spring-boot-starter-data-mongodb`
- **Database Config**: Updated `application.properties` to use MongoDB URI
- **Entities**: Converted JPA entities to MongoDB documents
- **Repositories**: Changed from JpaRepository to MongoRepository
- **ID Types**: Changed from Long to String for MongoDB ObjectId

### Frontend Changes:
- **Service Layer**: Updated ID types from number to string
- **Components**: Modified to work with string-based MongoDB IDs

## 🔧 Database Configuration

### application.properties
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/teleasha
spring.data.mongodb.database=teleasha
```

### Collections Created:
- **users** - User accounts with roles
- **appointments** - Appointment bookings

## 🎯 Benefits of MongoDB

### Advantages:
- **Schema Flexibility**: Easy to add new fields without migrations
- **JSON-like Documents**: Natural fit for REST APIs
- **Horizontal Scaling**: Better for distributed systems
- **No Complex Joins**: Simplified data relationships
- **Rich Query Language**: Powerful aggregation framework

### Use Cases:
- **User Profiles**: Flexible user data with role-specific fields
- **Appointment Data**: Variable appointment metadata
- **Medical Records**: Unstructured health data
- **Real-time Features**: Better for live updates

## 🚀 Running the Application

### 1. Start MongoDB
```bash
mongod
```

### 2. Start Backend
```bash
cd projectbackend
./mvnw spring-boot:run
```

### 3. Start Frontend
```bash
cd project
npm run dev
```

## 📊 MongoDB Operations

### View Data:
```javascript
// Connect to MongoDB shell
mongosh

// Switch to teleasha database
use teleasha

// View users
db.users.find().pretty()

// View appointments
db.appointments.find().pretty()

// Count documents
db.users.countDocuments()
db.appointments.countDocuments()
```

### Sample Queries:
```javascript
// Find all doctors
db.users.find({role: "DOCTOR"})

// Find appointments for a specific patient
db.appointments.find({patient: ObjectId("...")})

// Find pending appointments
db.appointments.find({status: "PENDING"})
```

## 🔄 Data Migration (if needed)

If migrating from existing SQL database:
```javascript
// Example migration script
db.users.insertMany([
  {
    email: "patient@teleasha.com",
    password: "$2a$10$...", // bcrypt hash
    name: "John Patient",
    role: "PATIENT",
    phone: "+91 9876543210",
    address: "123 Village Road, Gujarat",
    createdAt: new Date(),
    updatedAt: new Date()
  }
  // ... more users
])
```

## 🛠️ Development Tools

### MongoDB Compass (GUI):
- Download from https://www.mongodb.com/products/compass
- Connect to `mongodb://localhost:27017`
- Visual database management

### VS Code Extensions:
- **MongoDB for VS Code** - Official MongoDB extension
- **MongoDB Snippets** - Code snippets for MongoDB

## 🔒 Security Considerations

### Production Setup:
```properties
# Enable authentication
spring.data.mongodb.uri=mongodb://username:password@localhost:27017/teleasha?authSource=admin

# SSL/TLS
spring.data.mongodb.uri=mongodb://username:password@localhost:27017/teleasha?ssl=true
```

### Best Practices:
- Enable authentication in production
- Use connection pooling
- Implement proper indexing
- Regular backups
- Monitor performance

## 📈 Performance Optimization

### Indexing:
```javascript
// Create indexes for better performance
db.users.createIndex({email: 1}, {unique: true})
db.appointments.createIndex({patient: 1})
db.appointments.createIndex({doctor: 1})
db.appointments.createIndex({appointmentDate: 1})
```

### Connection Pooling:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/teleasha?maxPoolSize=20&minPoolSize=5
```

The system is now fully configured to use MongoDB! 🎉