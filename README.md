# AI-Powered Debate Platform

A comprehensive debate platform with real-time AI analysis, competitive rankings, and community features.

## 🏗️ Architecture

### Frontend (Next.js 15 + React 19)
- **Framework**: Next.js 15 with App Router
- **UI**: Radix UI components + Tailwind CSS + Framer Motion
- **State**: React Context for authentication
- **Features**: Real-time debates, analytics dashboard, tournaments, leaderboards

### Backend Node.js (Express.js + MongoDB)
- **API**: RESTful endpoints with JWT authentication
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io for live debate updates
- **Security**: Rate limiting, input validation, CORS

### Backend ML (FastAPI + Python)
- **AI Models**: DistilBERT for sentiment analysis, sentence transformers
- **Scoring**: Multi-metric argument analysis (sentiment, clarity, vocabulary)
- **Endpoints**: Real-time analysis and debate finalization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)

### Environment Setup

1. **Frontend Environment**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your API URLs
```

2. **Backend Node.js Environment**
```bash
cd backend_node
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. **Backend ML Environment**
```bash
cd backend_ml
cp .env.example .env
# Edit .env if needed
```

### Installation & Running

1. **Install Dependencies**
```bash
# Frontend
cd frontend && npm install

# Backend Node.js
cd ../backend_node && npm install

# Backend ML
cd ../backend_ml && pip install -r requirements.txt
```

2. **Start Services**
```bash
# Terminal 1: ML Backend (Port 8000)
cd backend_ml && python main.py

# Terminal 2: Node.js Backend (Port 5000)
cd backend_node && npm run dev

# Terminal 3: Frontend (Port 3000)
cd frontend && npm run dev
```

3. **Access Application**
- Frontend: http://localhost:3000
- Node.js API: https://debate-app-1.onrender.com
- ML API: https://debate-app-ml.hf.space

## 📁 Project Structure

```
debate-app/
├── frontend/                 # Next.js React application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable UI components
│   ├── context/            # React context providers
│   ├── lib/                # Utilities and API functions
│   └── .env.example        # Environment template
├── backend_node/           # Express.js API server
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, validation, rate limiting
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API route definitions
│   └── .env.example       # Environment template
├── backend_ml/            # FastAPI ML service
│   ├── utils/             # ML utilities
│   ├── advanced_ai.py     # AI analysis logic
│   ├── main.py           # FastAPI application
│   └── requirements.txt   # Python dependencies
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=https://debate-app-1.onrender.com
NEXT_PUBLIC_ML_API_URL=https://debate-app-ml.hf.space
```

**Backend Node.js (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/debate-app
JWT_SECRET=your-super-secret-jwt-key-here
ML_API_URL=https://debate-app-ml.hf.space
```

**Backend ML (.env)**
```
# Optional ML-specific configurations
```

## 🚀 Deployment

### Production Environment Variables

**Frontend**
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_ML_API_URL=https://your-ml-api-domain.com
```

**Backend Node.js**
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/debate-app
JWT_SECRET=your-production-jwt-secret
ML_API_URL=https://your-ml-api-domain.com
```

## 🎯 Features

- **Real-time Debates**: Live argument submission with instant AI scoring
- **AI Analysis**: Advanced sentiment analysis and argument quality scoring
- **User Authentication**: Secure JWT-based authentication system
- **Leaderboards**: Global and category-based rankings
- **Tournaments**: Structured competitive debate tournaments
- **Analytics Dashboard**: Comprehensive performance tracking
- **Private Debates**: Invite-only debate rooms
- **Responsive Design**: Mobile-first UI with dark theme

## 🔍 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Debates
- `GET /debates/open` - List open debates
- `POST /debates` - Create new debate
- `POST /debates/:id/join` - Join debate
- `POST /debates/:id/arguments` - Add argument
- `POST /debates/:id/finalize` - Finalize debate

### ML Analysis
- `POST /analyze` - Analyze single argument
- `POST /finalize` - Complete debate analysis

## 🛠️ Development

### Code Style
- Frontend: ESLint + Prettier
- Backend: Standard JavaScript conventions
- Python: PEP 8 compliance

### Testing
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend_node && npm test
```

## 📝 License

MIT License - see LICENSE file for details.
