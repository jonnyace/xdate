# X Dating App

A modern dating application that leverages X (formerly Twitter) for authentic, real-time social matching. Users connect exclusively through their X accounts and are matched based on shared interests, posts, locations, and compatibility signals derived from their X activity.

## 🚀 Features

- **X OAuth Authentication**: Secure login exclusively via X.com accounts
- **Smart Matching Algorithm**: Content-based, collaborative filtering, and location-based matching
- **Real-time Messaging**: In-app chat with X-like features (280-char limit, emoji reactions)
- **Privacy-First Design**: GDPR/CCPA compliant with granular consent controls
- **Cross-Platform**: Mobile app (React Native) and web version (React.js)

## 🏗️ Architecture

### High-Level System Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   X API         │
│   (React/RN)    │◄──►│   (Node.js)     │◄──►│   (OAuth/Data)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (PostgreSQL)  │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Cache         │
                       │   (Redis)       │
                       └─────────────────┘
```

### Core Components

1. **Authentication Service**: X OAuth integration
2. **Matching Engine**: ML-based recommendation system
3. **Messaging Service**: Real-time chat functionality
4. **Profile Service**: User profile management
5. **Analytics Service**: User behavior tracking

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: X OAuth 2.0
- **ML/NLP**: OpenAI API / Hugging Face Transformers

### Frontend
- **Mobile**: React Native
- **Web**: React.js
- **State Management**: Redux Toolkit
- **Styling**: Styled Components / Tailwind CSS

### Infrastructure
- **Hosting**: AWS/GCP
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, DataDog

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- X Developer Account
- Docker (optional)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd xdate
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Mobile
cd ../mobile
npm install
```

### 3. Environment Setup
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 4. Database Setup
```bash
# Start PostgreSQL and Redis
docker-compose up -d db redis

# Run migrations
cd backend
npm run migrate
```

### 5. Start Development Servers
```bash
# Backend
cd backend
npm run dev

# Frontend
cd ../frontend
npm start

# Mobile
cd ../mobile
npm start
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/xdate
REDIS_URL=redis://localhost:6379

# X API
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
X_CALLBACK_URL=http://localhost:3000/auth/x/callback

# JWT
JWT_SECRET=your_jwt_secret

# OpenAI (for ML features)
OPENAI_API_KEY=your_openai_api_key
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_X_CLIENT_ID=your_x_client_id
```

## 📱 API Endpoints

### Authentication
- `POST /auth/x/login` - X OAuth login
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Profiles
- `GET /profiles` - Get potential matches
- `POST /profiles` - Create/update profile
- `GET /profiles/:id` - Get specific profile

### Matching
- `POST /matches/like` - Like a profile
- `POST /matches/pass` - Pass on a profile
- `GET /matches/mutual` - Get mutual matches

### Messaging
- `GET /messages` - Get conversation list
- `GET /messages/:conversationId` - Get messages
- `POST /messages` - Send message

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../frontend
npm test

# E2E tests
npm run test:e2e
```

## 📦 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build

# Frontend
cd ../frontend
npm run build
```

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Privacy & Security

- All user data is encrypted in transit and at rest
- GDPR and CCPA compliant
- Regular security audits
- No sensitive X data stored without explicit consent

## 📞 Support

For support, email support@xdate.com or join our Discord community.

## 🗺️ Roadmap

- [ ] Beta launch with 100 users
- [ ] Advanced matching algorithms
- [ ] Video calling integration
- [ ] Group events feature
- [ ] AI-powered conversation starters
- [ ] Premium subscription model

---

**Note**: This project is in active development. Please refer to the [PRD.md](PRD.md) for detailed product requirements and specifications. 