# 🎭 AI-Powered Debate Platform

A comprehensive, full-stack debate platform with real-time AI analysis, competitive tournaments, and advanced community features. Built with modern web technologies and AI-powered argument analysis.

## ✨ Key Features

### 🚀 Core Functionality
- **Real-time Debates**: Live argument submission with instant AI scoring and feedback
- **Tournament System**: User and admin-created tournaments with bracket management
- **AI Analysis**: Advanced sentiment analysis, clarity scoring, and vocabulary richness assessment  
- **Leaderboards**: Global rankings and category-based performance tracking
- **Admin Dashboard**: Comprehensive management interface with analytics and controls
- **Achievement System**: Gamified progression with badges and rewards
- **Social Features**: User profiles, debate history, and community interaction

### 🎨 User Experience
- **Responsive Design**: Mobile-first UI optimized for all devices
- **Dark/Light Themes**: Customizable appearance preferences
- **Skeleton Loading**: Performance-optimized lazy loading throughout the app
- **Real-time Updates**: WebSocket-powered live debate updates and notifications
- **Accessibility**: WCAG-compliant components with keyboard navigation support

### 🔐 Security & Performance
- **JWT Authentication**: Secure token-based authentication system
- **Rate Limiting**: API protection against abuse and spam
- **Input Validation**: Comprehensive data sanitization and validation
- **Error Handling**: Graceful error boundaries and user feedback
- **Connection Monitoring**: Network status tracking and offline support

## 🏗️ Technical Architecture

### Frontend (Next.js 15 + React 19)
- **Framework**: Next.js 15 with App Router and Server Components
- **UI Components**: Radix UI primitives with Tailwind CSS styling
- **Animations**: Framer Motion for smooth transitions and interactions
- **State Management**: React Context for global state and authentication
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React icon library

### Backend Node.js (Express.js + MongoDB)
- **API Architecture**: RESTful endpoints with comprehensive error handling
- **Database**: MongoDB with Mongoose ODM and schema validation
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-time**: Socket.io for live debate updates and notifications
- **Security**: Helmet.js, CORS, rate limiting, and input validation
- **AI Integration**: Google Generative AI (Gemini) and ML API services

### Key Technologies
```json
Frontend Dependencies:
- Next.js 15.5.2 (React 19.1.0)
- Radix UI Components (Accessible primitives)
- Tailwind CSS 4 (Utility-first styling)
- Framer Motion 12.23 (Animations)
- Socket.io Client 4.8 (Real-time)
- Recharts 3.2 (Data visualization)
- Zod 3.25 (Schema validation)

Backend Dependencies:
- Express.js 4.18 (Web framework)
- Mongoose 7.0 (MongoDB ODM)
- Socket.io 4.8 (WebSocket server)
- JSON Web Token 9.0 (Authentication)
- Bcrypt.js 2.4 (Password hashing)
- Express Rate Limit 7.1 (API protection)
- Google Generative AI 0.24 (AI services)
```

## 📁 Detailed Project Structure

```
debate-app/
├── frontend/                    # Next.js React Application
│   ├── app/                    # App Router Pages
│   │   ├── about/              # About page
│   │   ├── admin/              # Admin management
│   │   │   ├── dashboard/      # Admin dashboard with analytics
│   │   │   └── login/          # Admin authentication
│   │   ├── analytics/          # User analytics dashboard
│   │   ├── contact/            # Contact information
│   │   ├── debates/            # Debate management
│   │   │   ├── [id]/           # Individual debate view
│   │   │   └── create/         # Debate creation
│   │   ├── home/               # Landing page
│   │   ├── leaderboard/        # Rankings and statistics
│   │   ├── login/              # User authentication
│   │   ├── profile/            # User profile management
│   │   ├── register/           # User registration
│   │   └── tournaments/        # Tournament system
│   ├── components/             # Reusable UI Components
│   │   ├── ui/                 # Base UI components (50+ components)
│   │   ├── animated-background.tsx
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   ├── faq.tsx             # FAQ component
│   │   ├── footer.tsx          # Site footer
│   │   ├── navigation.tsx      # Main navigation
│   │   └── ProtectedRoute.tsx  # Route protection
│   ├── context/                # React Context Providers
│   │   └── AuthContext.tsx     # Authentication state
│   ├── lib/                    # Utilities and Services
│   │   ├── api.ts              # API configuration
│   │   ├── apiFetch.ts         # API client with error handling
│   │   ├── auth.ts             # Authentication helpers
│   │   ├── connectionMonitor.ts # Network monitoring
│   │   ├── errorHandler.ts     # Error management
│   │   ├── socket.ts           # WebSocket client
│   │   └── utils.ts            # General utilities
│   └── .env.example            # Environment template
├── backend_node/               # Express.js API Server
│   ├── ai/                     # AI Integration
│   │   └── debate-analysis.js  # Argument analysis logic
│   ├── config/                 # Configuration
│   │   └── db.js              # MongoDB connection
│   ├── controllers/            # Route Handlers
│   │   ├── achievementController.js # Achievement management
│   │   ├── adminController.js       # Admin operations
│   │   ├── analyticsController.js   # Analytics data
│   │   ├── authController.js        # Authentication logic
│   │   ├── debateController.js      # Debate operations
│   │   ├── leaderboardController.js # Rankings logic
│   │   ├── tournamentController.js  # Tournament management
│   │   └── userController.js        # User management
│   ├── middleware/             # Express Middleware
│   │   ├── adminAuth.js        # Admin authentication
│   │   ├── auth.js             # User authentication
│   │   ├── errorHandler.js     # Global error handling
│   │   ├── errorLogger.js      # Error logging
│   │   ├── healthCheck.js      # Health monitoring
│   │   ├── rateLimiter.js      # Rate limiting
│   │   └── validation.js       # Input validation
│   ├── models/                 # MongoDB Schemas
│   │   ├── Achievement.js      # Achievement data model
│   │   ├── Debate.js           # Debate structure
│   │   ├── Result.js           # Debate results
│   │   ├── Tournament.js       # Tournament schema
│   │   └── User.js             # User profile model
│   ├── routes/                 # API Route Definitions
│   │   ├── achievementRoutes.js # Achievement endpoints
│   │   ├── adminRoutes.js       # Admin API routes
│   │   ├── analyticsRoutes.js   # Analytics endpoints
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── debateRoutes.js      # Debate API routes
│   │   ├── leaderboardRoutes.js # Leaderboard endpoints
│   │   ├── miscRoutes.js        # Utility routes
│   │   ├── tournamentRoutes.js  # Tournament API routes
│   │   └── userRoutes.js        # User management routes
│   ├── services/               # Business Logic Services
│   │   ├── debateAnalysisService.js # Debate analysis
│   │   ├── geminiService.js         # Google AI integration
│   │   └── mlAnalysisService.js     # ML model integration
│   ├── socket/                 # WebSocket Handlers
│   │   └── socketHandlers.js   # Real-time event handling
│   ├── sockets/                # Socket Logic
│   │   └── debateSocket.js     # Debate-specific sockets
│   ├── utils/                  # Utility Functions
│   │   └── generateColor.js    # Color generation utilities
│   ├── server.js               # Main server file
│   └── .env.example            # Environment template
└── README.md                   # This documentation
```

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: 18.0+ (LTS recommended)
- **MongoDB**: Local instance or MongoDB Atlas account
- **Git**: For version control

### 1. Clone and Setup
```bash
git clone https://github.com/Sanidhya14321/Debate-App-1.git
cd Debate-App-1
```

### 2. Environment Configuration

**Frontend Environment Setup**
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ML_API_URL=https://debate-app-ml.hf.space

# Route Configuration
NEXT_PUBLIC_AUTH_ROUTE=/auth
NEXT_PUBLIC_DEBATES_ROUTE=/debates
NEXT_PUBLIC_USERS_ROUTE=/users
NEXT_PUBLIC_ANALYTICS_ROUTE=/analytics

# UI Customization
NEXT_PUBLIC_APP_NAME=AI Debate Platform
NEXT_PUBLIC_PRIMARY_COLOR=#2563eb
NEXT_PUBLIC_SECONDARY_COLOR=#10b981
NEXT_PUBLIC_ACCENT_COLOR=#f59e0b
```

**Backend Environment Setup**
```bash
cd backend_node
cp .env.example .env
```

Edit `.env`:
```bash
# Server Configuration
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/debate-app
# For production: mongodb+srv://username:password@cluster.mongodb.net/debate-app

# External Services
ML_API_URL=https://debate-app-ml.hf.space
CORS_ORIGIN=http://localhost:3000

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@debateapp.com
```

### 3. Installation

**Install Frontend Dependencies**
```bash
cd frontend
npm install
```

**Install Backend Dependencies**
```bash
cd backend_node
npm install
```

### 4. Start Development Servers

**Terminal 1: Backend Server (Port 5000)**
```bash
cd backend_node
npm run dev
```

**Terminal 2: Frontend Server (Port 3000)**
```bash
cd frontend
npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:3000/admin/login (admin/admin123)

## 📊 Comprehensive API Documentation

### Authentication Endpoints
```
POST /auth/register          # User registration
POST /auth/login            # User login
GET  /auth/me               # Get current user
POST /auth/logout           # User logout
```

### Debate Management
```
GET    /debates             # List all debates
GET    /debates/open        # List open debates
GET    /debates/:id         # Get debate details
POST   /debates             # Create new debate
POST   /debates/:id/join    # Join existing debate
POST   /debates/:id/arguments # Add argument to debate
POST   /debates/:id/finalize  # Finalize debate and calculate results
DELETE /debates/:id         # Delete debate (admin/creator only)
```

### Tournament System
```
GET    /tournaments         # List all tournaments
GET    /tournaments/user    # List user-created tournaments
POST   /tournaments         # Create tournament (admin)
POST   /tournaments/user    # Create tournament (user)
PUT    /tournaments/:id     # Update tournament
PUT    /tournaments/user/:id # Update user tournament
DELETE /tournaments/user/:id # Delete user tournament
POST   /tournaments/:id/join # Join tournament
```

### User Management
```
GET    /users/profile       # Get user profile
PUT    /users/profile       # Update user profile
GET    /users/stats         # Get user statistics
GET    /users/debates       # Get user's debates
GET    /users/achievements  # Get user achievements
```

### Leaderboards & Analytics
```
GET /leaderboard/global     # Global leaderboard
GET /leaderboard/monthly    # Monthly rankings
GET /analytics/user         # User analytics
GET /analytics/platform     # Platform statistics
```

### Admin Endpoints
```
POST /admin/login           # Admin authentication
GET  /admin/dashboard/stats # Dashboard statistics
GET  /admin/users           # Manage users
GET  /admin/debates         # Manage debates
GET  /admin/tournaments     # Manage tournaments
```

### Achievement System
```
GET /achievements           # List all achievements
GET /achievements/user      # User's achievements
POST /achievements/unlock   # Unlock achievement
```

## 🎨 Frontend Features Deep Dive

### Page Structure & Functionality

#### 🏠 **Home & Landing**
- **Hero Section**: Animated background with call-to-action
- **Feature Showcase**: Interactive feature demonstrations
- **Statistics**: Real-time platform statistics
- **Testimonials**: User feedback and success stories

#### 🎯 **Debate System**
- **Browse Debates**: Filter by category, status, difficulty
- **Create Debates**: Rich text editor with topic suggestions
- **Live Debates**: Real-time argument submission and voting
- **Debate Results**: AI-powered analysis and winner determination
- **Argument Analysis**: Sentiment, clarity, vocabulary scoring

#### 🏆 **Tournament Management**
- **Tournament Browser**: Public and private tournaments
- **User Tournaments**: Create and manage your own tournaments
- **Admin Tournaments**: Official platform tournaments
- **Bracket System**: Visual tournament progression
- **Prize Management**: Reward distribution system

#### 📊 **Analytics Dashboard**
- **Performance Metrics**: Win/loss ratios, argument quality
- **Progress Tracking**: Skill development over time
- **Comparison Charts**: Benchmark against other users
- **Achievement Progress**: Visual achievement tracking
- **Debate History**: Comprehensive activity log

#### 🏅 **Leaderboard System**
- **Global Rankings**: Top performers across all categories
- **Category Leaders**: Specialized topic rankings
- **Monthly Champions**: Time-based competitions
- **Regional Leaderboards**: Location-based rankings
- **Achievement Showcases**: Badge and reward displays

#### 👤 **User Profile & Settings**
- **Profile Customization**: Avatar, bio, preferences
- **Debate History**: Complete activity timeline
- **Statistics Overview**: Performance summaries
- **Settings Management**: Privacy and notification controls
- **Account Security**: Password and authentication settings

#### 🛡️ **Admin Dashboard**
- **User Management**: User roles and permissions
- **Content Moderation**: Debate and comment oversight
- **Platform Analytics**: Comprehensive usage statistics
- **Tournament Management**: Official tournament creation
- **System Health**: Server status and performance metrics

### UI Component Library (50+ Components)

#### Form Controls
- Input, TextArea, Select, RadioGroup, Checkbox
- Form validation with real-time feedback
- Multi-step forms with progress indicators

#### Navigation
- Responsive navigation bar with mobile menu
- Breadcrumb navigation for deep pages
- Tab systems for content organization

#### Data Display
- Interactive charts and graphs (Recharts)
- Data tables with sorting and pagination
- Card layouts with hover effects
- Badge and status indicators

#### Feedback
- Toast notifications with different types
- Loading states with skeleton screens
- Progress bars and spinners
- Error boundaries with retry options

#### Layout
- Responsive grid systems
- Modal dialogs and overlays
- Accordion and collapsible sections
- Sidebar navigation with collapsing

## 🔧 Backend Architecture Deep Dive

### Database Models & Relationships

#### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  profile: {
    bio: String,
    avatar: String,
    location: String
  },
  stats: {
    totalDebates: Number,
    wins: Number,
    losses: Number,
    argumentsSubmitted: Number,
    averageScore: Number
  },
  achievements: [AchievementID],
  preferences: Object,
  createdAt: Date,
  lastActive: Date
}
```

#### Debate Model
```javascript
{
  topic: String,
  description: String,
  category: String,
  status: Enum['open', 'active', 'completed'],
  creator: UserID,
  participants: [UserID],
  arguments: [{
    user: UserID,
    content: String,
    side: Enum['pro', 'con'],
    timestamp: Date,
    scores: {
      sentiment: Number,
      clarity: Number,
      vocabulary: Number
    }
  }],
  results: {
    winner: UserID,
    winnerSide: String,
    scores: Object
  },
  settings: {
    maxParticipants: Number,
    timeLimit: Number,
    isPrivate: Boolean
  }
}
```

#### Tournament Model
```javascript
{
  title: String,
  description: String,
  format: Enum['single-elimination', 'round-robin'],
  createdBy: UserID,
  createdByType: Enum['admin', 'user'],
  participants: [UserID],
  debates: [DebateID],
  bracket: Object,
  prizes: [String],
  status: Enum['upcoming', 'active', 'completed'],
  settings: {
    maxParticipants: Number,
    registrationDeadline: Date,
    startDate: Date
  }
}
```

### Service Layer Architecture

#### AI Analysis Service
- **Sentiment Analysis**: Emotional tone detection
- **Clarity Scoring**: Argument coherence assessment
- **Vocabulary Assessment**: Language richness evaluation
- **Fallback Systems**: Graceful degradation when AI unavailable

#### Authentication Service
- **JWT Token Management**: Secure token generation and validation
- **Password Security**: Bcrypt hashing with salt rounds
- **Session Management**: Token refresh and revocation
- **Role-Based Access**: Admin and user permission systems

#### Real-time Communication
- **WebSocket Management**: Socket.io connection handling
- **Room Management**: Debate-specific chat rooms
- **Event Broadcasting**: Live updates and notifications
- **Connection Recovery**: Automatic reconnection handling

### Security Implementation

#### API Security
- **Rate Limiting**: Configurable limits per endpoint
- **Input Validation**: Comprehensive data sanitization
- **CORS Configuration**: Secure cross-origin handling
- **Helmet Protection**: Security headers implementation

#### Data Protection
- **Password Hashing**: Bcrypt with configurable rounds
- **JWT Security**: Secret rotation and expiration
- **Database Validation**: Mongoose schema enforcement
- **Error Handling**: Secure error messages without data leaks

## 🌐 Deployment & Production

### Environment Variables (Production)

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_ML_API_URL=https://your-ml-api-domain.com
NEXT_PUBLIC_APP_NAME=AI Debate Platform
```

**Backend (.env)**
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/debate-app
JWT_SECRET=your-super-secure-production-jwt-secret-256-bit
ML_API_URL=https://your-ml-api-domain.com
CORS_ORIGIN=https://your-frontend-domain.com

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_EMAIL=admin@yourdomain.com
```

### Build Commands

**Frontend Production Build**
```bash
cd frontend
npm run build
npm run start
```

**Backend Production**
```bash
cd backend_node
npm install --production
npm start
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas connection established
- [ ] JWT secrets generated and secured
- [ ] CORS origins configured for production
- [ ] Rate limits adjusted for production traffic
- [ ] SSL certificates installed
- [ ] Domain names configured
- [ ] Health check endpoints tested
- [ ] Error logging configured
- [ ] Performance monitoring enabled

## 🧪 Development & Testing

### Code Quality Standards

**Frontend**
- ESLint configuration with Next.js rules
- Prettier for consistent code formatting
- TypeScript strict mode enabled
- Component testing with React Testing Library

**Backend**
- ESLint with Node.js best practices
- Joi schema validation for API endpoints
- Unit tests with Jest
- Integration tests for API routes

### Development Commands

```bash
# Frontend Development
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation

# Backend Development
npm run dev          # Start with nodemon
npm start            # Production server
npm test             # Run test suite
npm run lint         # Code quality check
```

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Include detailed commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Sanidhya14321/Debate-App-1/issues)
- **Documentation**: This README and inline code comments
- **Email**: support@debateplatform.com

---

Built with ❤️ by [Sanidhya Vats](https://github.com/Sanidhya14321)
