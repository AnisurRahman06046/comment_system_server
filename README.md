# Comment System - MERN Stack Backend

A scalable, production-ready comment system built with MongoDB, Express.js, and Node.js featuring real-time updates via Socket.io.

## Features

### Core Functionality
- User authentication with JWT
- Create, read, update, delete comments
- Like/dislike comments with toggle functionality
- Reply to comments (nested structure)
- Real-time updates via WebSocket
- Cursor-based pagination for efficiency
- Multiple sorting options (newest, most liked, most disliked)

### Security
- JWT authentication for all protected endpoints
- Password hashing with bcrypt
- Input validation with Zod
- Authorization checks (only author can edit/delete)
- Protected WebSocket connections
- Soft delete for data retention

### Architecture
- Modular structure following best practices
- TypeScript for type safety
- Reusable utilities
- Clean code principles
- Scalable design

---

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Real-time:** Socket.io
- **Password Hashing:** bcryptjs
- **Logging:** Winston
- **Testing:** Jest
- **Dev Tools:** ts-node-dev, ESLint, Prettier

---

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**
Create a `.env` file in the backend directory:
```env
PORT=5000
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/commentdb
JWT_SECRET=your-super-secret-key
CORS_ORIGIN=*
```

4. **Seed Database (Optional)**
Create 100 test users:
```bash
npm run seed
```

Test credentials:
- Email: `user1@test.com` to `user100@test.com`
- Password: `password123`

5. **Start Development Server**
```bash
npm run dev
```

Server runs on: `http://localhost:5000`

---

## Project Structure

```
backend/
├── src/
│   ├── app/
│   │   ├── config/              # Configuration
│   │   ├── Errors/              # Error handling
│   │   ├── middlewares/         # Auth, validation, error handlers
│   │   ├── modules/             # Feature modules
│   │   │   ├── Auth/            # Authentication
│   │   │   ├── User/            # User management
│   │   │   └── Comment/         # Comment system
│   │   │       ├── Comment.constants.ts
│   │   │       ├── Comment.interfaces.ts
│   │   │       ├── Comment.schema.ts
│   │   │       ├── Comment.types.ts
│   │   │       ├── Comment.validation.ts
│   │   │       ├── Comment.services.ts
│   │   │       ├── Comment.controllers.ts
│   │   │       └── Comment.routes.ts
│   │   ├── routes/              # Route aggregation
│   │   ├── socket/              # Socket.io configuration
│   │   │   ├── index.ts
│   │   │   ├── socket.middleware.ts
│   │   │   ├── socket.events.ts
│   │   │   ├── socket.types.ts
│   │   │   └── handlers/
│   │   │       └── connection.handler.ts
│   │   ├── types/               # Global type definitions
│   │   └── utils/               # Reusable utilities
│   │       ├── catchAsync.ts
│   │       ├── sendApiResponse.ts
│   │       ├── pagination.ts
│   │       └── socketEmitter.ts
│   ├── scripts/                 # Utility scripts
│   │   ├── seedUsers.ts
│   │   ├── dropOldIndexes.ts
│   │   └── testSocket.ts
│   ├── app.ts                   # Express app configuration
│   ├── server.ts                # Server initialization
│   └── logger.ts                # Winston logger
├── logs/                        # Log files
├── .env                         # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

---

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Database
npm run seed             # Seed 100 test users

# Testing
npm run test             # Run Jest tests
npm run test:socket      # Test Socket.io client

# Code Quality
npm run lint             # Run ESLint
npm run lint-fix         # Fix ESLint errors
npm run prettier         # Format code with Prettier
npm run prettier-fix     # Fix formatting

# Production
npm run build            # Compile TypeScript to JavaScript
npm start                # Start production server
```

---

## API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation.

**Quick Reference:**

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### User
- `GET /api/v1/users/me` - Get current user profile

### Comments
- `POST /api/v1/comments` - Create comment
- `GET /api/v1/comments` - Get all comments (with pagination & sorting)
- `GET /api/v1/comments/:id` - Get single comment
- `PATCH /api/v1/comments/:id` - Update comment
- `DELETE /api/v1/comments/:id` - Delete comment
- `GET /api/v1/comments/:id/replies` - Get replies
- `POST /api/v1/comments/:id/reaction` - Like/dislike comment

---

## Real-time Updates

### Socket.io Integration

**Client Connection:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected!');
});

// Listen for events
socket.on('comment:new', (data) => {
  console.log('New comment:', data.comment);
});

socket.on('comment:reaction', (data) => {
  console.log('Reaction updated:', data.comment);
});
```

**Available Events:**
- `comment:new` - New comment created
- `comment:reply` - Reply created
- `comment:update` - Comment updated
- `comment:delete` - Comment deleted
- `comment:reaction` - Like/dislike toggled

---

## Key Features Explained

### 1. Cursor-based Pagination
Efficient pagination for large datasets using cursors instead of skip/limit.

**Benefits:**
- Consistent results even when data changes
- Better performance for large collections
- No skipped or duplicate items

**Implementation:**
- Simple cursor (_id) for `newest` sorting
- Compound cursor (count_id) for `mostLiked`/`mostDisliked` sorting

### 2. Reaction System
Single API endpoint handles both like and dislike with toggle logic.

**Rules:**
- One user can have only ONE reaction per comment
- Toggle same reaction = remove
- Toggle different reaction = switch

### 3. Soft Delete
Comments are marked as deleted but not removed from database.

**Benefits:**
- Data retention for analytics
- Can restore if needed
- Maintains referential integrity

---

## Security Considerations

### Implemented
- JWT token expiration (7 days)
- Password complexity requirements
- Email normalization (lowercase)
- Password field excluded from queries
- Generic error messages (prevent user enumeration)
- Authorization checks on sensitive operations

### Production Recommendations
- Configure `CORS_ORIGIN` to specific frontend URL
- Use HTTPS
- Add rate limiting
- Implement refresh tokens
- Add request logging
- Set up monitoring

---

## Database Schema

### User
```typescript
{
  firstName: string
  lastName: string
  email: string (unique, lowercase)
  password: string (hashed, select: false)
  createdAt: Date
  updatedAt: Date
}
```

### Comment
```typescript
{
  content: string (1-2000 chars)
  author: ObjectId → User
  reactions: [{
    userId: ObjectId
    type: 'like' | 'dislike'
  }]
  parentComment: ObjectId → Comment (null for root)
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `author` (for user's comments)
- `parentComment` (for replies)
- `createdAt` (for sorting)
- `isDeleted` (for filtering)

---

## Testing

### Manual Testing with Postman
Import the `postman_collection.json` file into Postman.

### Socket.io Testing
```bash
npm run test:socket
```

### Unit Tests
```bash
npm run test
```

---

## Development Workflow

1. **Create Feature Module**
   - Constants, Interfaces, Types
   - Schema (Mongoose model)
   - Services (business logic)
   - Controllers (request handlers)
   - Validation (Zod schemas)
   - Routes

2. **Add Tests**
3. **Update Documentation**

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for signing JWT | `supersecretkey` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |

---

## Deployment

### Build for Production
```bash
npm run build
```

Compiled files in `dist/` directory.

### Start Production Server
```bash
npm start
```

### Environment Setup
Ensure all environment variables are set in production environment.

---

## Troubleshooting

### MongoDB Connection Error
- Check `DB_URI` in `.env`
- Verify MongoDB Atlas IP whitelist
- Check network connection

### Socket.io Not Connecting
- Verify JWT token is valid
- Check CORS configuration
- Ensure server is running

### Validation Errors
- Check request body matches schema
- Verify password requirements
- Check MongoDB ObjectId format (24 hex chars)

---

## Contributing

1. Follow existing code structure
2. Use TypeScript strict mode
3. Add Zod validation for new endpoints
4. Write tests for new features
5. Update documentation

---

## License

ISC

---

## Contact

For issues or questions, please open an issue on GitHub.
