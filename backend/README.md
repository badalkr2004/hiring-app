# JobFlow Backend API

A robust Node.js backend API for the JobFlow job posting platform, built with Express, MongoDB, Prisma, and TypeScript.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Support for job seekers, companies, and admins
- **Job Management**: CRUD operations for job postings with advanced filtering
- **Application System**: Complete application workflow management
- **Admin Dashboard**: Comprehensive admin controls and analytics
- **Security**: Rate limiting, input validation, password hashing
- **Database**: MongoDB with Prisma ORM for type-safe database operations
- **Logging**: Winston-based logging system
- **Error Handling**: Centralized error handling with custom error classes

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: helmet, cors, bcryptjs, express-rate-limit
- **Logging**: Winston
- **Development**: nodemon, ts-node

## 📦 Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="mongodb://localhost:27017/jobflow"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   PORT=5000
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### User Model
- Authentication and profile information
- Role-based access (USER, COMPANY, ADMIN)
- Skills, experience, and resume storage

### Company Model
- Company profiles linked to users
- Verification system for trusted companies
- Industry and size categorization

### Job Model
- Comprehensive job postings
- Advanced filtering and search capabilities
- Status management (ACTIVE, CLOSED, DRAFT)

### Application Model
- Job application workflow
- Status tracking (PENDING, REVIEWED, SHORTLISTED, REJECTED, HIRED)
- Cover letter and resume attachments

## 🔐 Authentication

The API uses JWT tokens for authentication with the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Demo Credentials

```
Admin: admin@jobflow.com / admin123
Company: company@techflow.com / company123
User: john@example.com / user123
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Jobs
- `GET /api/jobs` - Get all jobs (with filtering)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (company only)
- `PUT /api/jobs/:id` - Update job (company only)
- `DELETE /api/jobs/:id` - Delete job (company only)
- `GET /api/jobs/company/my-jobs` - Get company's jobs

### Applications
- `POST /api/applications/jobs/:jobId/apply` - Apply to job
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/company-applications` - Get company's applications
- `PATCH /api/applications/:id/status` - Update application status
- `GET /api/applications/:id` - Get application details
- `DELETE /api/applications/:id` - Withdraw application

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID
- `PUT /api/companies/profile` - Update company profile

### Users
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload avatar

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/companies` - Get all companies
- `PATCH /api/admin/users/:id/status` - Update user status
- `PATCH /api/admin/companies/:id/verify` - Verify company
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/applications` - Get all applications

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Security**: Secure token generation and validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers for Express
- **Error Handling**: No sensitive data leakage

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL="your-production-mongodb-url"
JWT_SECRET="your-production-jwt-secret"
JWT_REFRESH_SECRET="your-production-refresh-secret"
FRONTEND_URL="https://your-frontend-domain.com"
```

### Build and Start

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📊 Monitoring & Logging

- **Winston Logging**: Structured logging with different levels
- **Error Tracking**: Comprehensive error logging and handling
- **Health Check**: `/health` endpoint for monitoring
- **Request Logging**: Morgan middleware for HTTP request logging

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.