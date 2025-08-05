# X Dating App - Architecture Documentation

## Overview

The X Dating App is a modern, scalable dating application that leverages X (formerly Twitter) for authentic social matching. This document outlines the technical architecture, design decisions, and implementation details.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Web App (React)  │  Mobile App (React Native)  │  PWA         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Load Balancer  │  Rate Limiting  │  Authentication  │  CORS   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Auth Service  │  Profile Service  │  Matching Service  │      │
│  Chat Service  │  Analytics Service │  Notification Service    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  Elasticsearch  │  S3 (Media)         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                          │
├─────────────────────────────────────────────────────────────────┤
│  X API  │  OpenAI API  │  AWS SES  │  Twilio  │  Stripe        │
└─────────────────────────────────────────────────────────────────┘
```

## Core Services

### 1. Authentication Service

**Purpose**: Handle X OAuth authentication and user session management.

**Key Components**:
- X OAuth 2.0 integration
- JWT token management
- Session storage (Redis)
- Rate limiting
- Security middleware

**API Endpoints**:
```
POST /auth/x/login          # Initiate X OAuth flow
GET  /auth/x/callback       # Handle OAuth callback
POST /auth/logout           # Logout user
GET  /auth/me               # Get current user
POST /auth/refresh          # Refresh JWT token
```

### 2. Profile Service

**Purpose**: Manage user profiles and X data integration.

**Key Components**:
- Profile CRUD operations
- X data synchronization
- Media upload handling
- Privacy controls
- Age verification

**API Endpoints**:
```
GET    /profiles            # Get potential matches
POST   /profiles            # Create/update profile
GET    /profiles/:id        # Get specific profile
PUT    /profiles/:id        # Update profile
DELETE /profiles/:id        # Delete profile
POST   /profiles/verify     # Age verification
```

### 3. Matching Service

**Purpose**: Core matching algorithm and recommendation engine.

**Key Components**:
- Content-based filtering
- Collaborative filtering
- Location-based matching
- ML model integration
- Preference management

**API Endpoints**:
```
GET  /matches               # Get potential matches
POST /matches/like          # Like a profile
POST /matches/pass          # Pass on a profile
GET  /matches/mutual        # Get mutual matches
POST /matches/boost         # Boost profile visibility
```

### 4. Chat Service

**Purpose**: Real-time messaging and conversation management.

**Key Components**:
- WebSocket connections
- Message persistence
- Media sharing
- Typing indicators
- Message encryption

**API Endpoints**:
```
GET    /conversations       # Get conversation list
GET    /conversations/:id   # Get conversation
POST   /conversations/:id/messages  # Send message
PUT    /conversations/:id/read      # Mark as read
DELETE /conversations/:id           # Delete conversation
```

### 5. Analytics Service

**Purpose**: User behavior tracking and business metrics.

**Key Components**:
- Event tracking
- User engagement metrics
- Match success rates
- Performance monitoring
- A/B testing

## Database Design

### PostgreSQL Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  x_user_id VARCHAR(255) UNIQUE NOT NULL,
  x_username VARCHAR(255) NOT NULL,
  x_access_token TEXT,
  x_refresh_token TEXT,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE
);
```

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  bio TEXT,
  age INTEGER CHECK (age >= 18),
  gender VARCHAR(50),
  sexual_orientation VARCHAR(50),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_name VARCHAR(255),
  interests TEXT[],
  photos TEXT[],
  x_posts TEXT[],
  privacy_settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Matches Table
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, liked, passed, mutual
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, matched_user_id)
);
```

#### Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- text, image, x_post
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Redis Usage

#### Session Storage
```
Key: session:{user_id}
Value: {token, expires_at, user_data}
TTL: 24 hours
```

#### Match Cache
```
Key: matches:{user_id}
Value: [potential_match_ids]
TTL: 1 hour
```

#### Rate Limiting
```
Key: rate_limit:{user_id}:{action}
Value: count
TTL: varies by action
```

## Security Considerations

### Authentication & Authorization
- JWT tokens with short expiration (15 minutes)
- Refresh token rotation
- X OAuth 2.0 with PKCE
- Rate limiting on all endpoints
- CORS configuration

### Data Protection
- All data encrypted in transit (HTTPS/TLS)
- Sensitive data encrypted at rest
- GDPR/CCPA compliance
- Data retention policies
- User consent management

### Privacy Controls
- Granular privacy settings
- Ghost mode for location hiding
- Selective X data sharing
- Easy data deletion
- Audit logging

## Performance Optimization

### Caching Strategy
- Redis for session data
- Match results caching
- CDN for static assets
- Database query optimization
- Connection pooling

### Scalability
- Horizontal scaling with load balancers
- Database read replicas
- Microservices architecture
- Auto-scaling groups
- Message queues for async processing

## Monitoring & Observability

### Metrics
- User engagement rates
- Match success rates
- API response times
- Error rates
- Database performance

### Logging
- Structured logging (JSON)
- Centralized log aggregation
- Error tracking with Sentry
- Performance monitoring with DataDog

### Health Checks
- Service health endpoints
- Database connectivity
- External API status
- Automated alerting

## Deployment Strategy

### Environment Setup
- Development: Local Docker Compose
- Staging: AWS/GCP with staging data
- Production: Multi-region deployment

### CI/CD Pipeline
- Automated testing
- Security scanning
- Blue-green deployments
- Rollback capabilities
- Feature flags

### Infrastructure
- Container orchestration (Kubernetes)
- Auto-scaling
- Load balancing
- CDN integration
- Backup strategies

## Future Considerations

### Scalability Improvements
- Event-driven architecture
- GraphQL API
- Real-time analytics
- Machine learning pipeline
- Microservices decomposition

### Feature Enhancements
- Video calling
- Group events
- AI conversation starters
- Advanced matching algorithms
- Premium features

### Technical Debt
- Code refactoring
- Performance optimization
- Security hardening
- Documentation updates
- Test coverage improvement 