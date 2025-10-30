# API Documentation - Comment System

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints (except register/login) require JWT authentication.

**Header:**
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Pass123"
}
```

**Validation:**
- Password: min 6 chars, must contain uppercase, lowercase, and number
- Email: valid email format

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "success": true,
  "message": "User is registered successfully",
  "data": {
    "_id": "690231b074bc104e1a49aea8",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

### 2. Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Pass123"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User is logged in",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## User Endpoints

### 3. Get Current User Profile
**GET** `/users/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "690231b074bc104e1a49aea8",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "createdAt": "2025-10-29T15:24:33.100Z",
    "updatedAt": "2025-10-29T15:24:33.100Z"
  }
}
```

---

## Comment Endpoints

### 4. Create Comment
**POST** `/comments`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "This is my comment",
  "parentCommentId": "690248cccdbd1b057723d816"  // Optional: for replies
}
```

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "_id": "690248cccdbd1b057723d816",
    "content": "This is my comment",
    "author": {
      "_id": "690231b074bc104e1a49aea8",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "likesCount": 0,
    "dislikesCount": 0,
    "parentComment": null,
    "createdAt": "2025-10-29T17:03:08.026Z",
    "updatedAt": "2025-10-29T17:03:08.026Z"
  }
}
```

---

### 5. Get All Comments
**GET** `/comments`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `cursor` (optional): Pagination cursor
  - For `newest`: `"690248cccdbd1b057723d816"` (simple _id)
  - For `mostLiked`/`mostDisliked`: `"3_690248cccdbd1b057723d816"` (count_id)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sortBy` (optional): `newest` | `mostLiked` | `mostDisliked` (default: `newest`)

**Examples:**
```
GET /comments
GET /comments?limit=20
GET /comments?sortBy=mostLiked
GET /comments?sortBy=mostLiked&limit=10&cursor=3_690248cccdbd1b057723d816
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Comments retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "690248cccdbd1b057723d816",
        "content": "This is my comment",
        "author": {
          "_id": "690231b074bc104e1a49aea8",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "likesCount": 5,
        "dislikesCount": 1,
        "parentComment": null,
        "createdAt": "2025-10-29T17:03:08.026Z",
        "updatedAt": "2025-10-29T17:05:09.883Z"
      }
    ],
    "nextCursor": "690248cccdbd1b057723d816",
    "hasMore": true
  }
}
```

---

### 6. Get Single Comment
**GET** `/comments/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Comment retrieved successfully",
  "data": {
    "_id": "690248cccdbd1b057723d816",
    "content": "This is my comment",
    "author": {
      "_id": "690231b074bc104e1a49aea8",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "likesCount": 5,
    "dislikesCount": 1,
    "parentComment": null,
    "createdAt": "2025-10-29T17:03:08.026Z",
    "updatedAt": "2025-10-29T17:05:09.883Z"
  }
}
```

---

### 7. Update Comment
**PATCH** `/comments/:id`

**Headers:** `Authorization: Bearer <token>`

**Authorization:** Only the author can update their own comment

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "_id": "690248cccdbd1b057723d816",
    "content": "Updated comment content",
    ...
  }
}
```

**Error (Not Author):** `403 Forbidden`
```json
{
  "success": false,
  "message": "You can only edit your own comments"
}
```

---

### 8. Delete Comment
**DELETE** `/comments/:id`

**Headers:** `Authorization: Bearer <token>`

**Authorization:** Only the author can delete their own comment

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Comment deleted successfully",
  "data": null
}
```

**Error (Not Author):** `403 Forbidden`
```json
{
  "success": false,
  "message": "You can only delete your own comments"
}
```

---

### 9. Get Replies for a Comment
**GET** `/comments/:id/replies`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `cursor` (optional): Pagination cursor (simple _id format)
- `limit` (optional): Items per page (default: 10, max: 100)

**Example:**
```
GET /comments/690248cccdbd1b057723d816/replies
GET /comments/690248cccdbd1b057723d816/replies?limit=20&cursor=690249e5cdbd1b057723d830
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Replies retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "690249e5cdbd1b057723d830",
        "content": "This is a reply",
        "author": {
          "_id": "690231b174bc104e1a49aeaa",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane@example.com"
        },
        "likesCount": 2,
        "dislikesCount": 0,
        "parentComment": "690248cccdbd1b057723d816",
        "createdAt": "2025-10-29T17:07:49.227Z",
        "updatedAt": "2025-10-29T17:07:49.227Z"
      }
    ],
    "nextCursor": null,
    "hasMore": false
  }
}
```

---

### 10. Toggle Reaction (Like/Dislike)
**POST** `/comments/:id/reaction`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "like"
}
```
**Valid types:** `"like"` | `"dislike"`

**Behavior:**
- If user hasn't reacted: Add reaction
- If user reacted with same type: Remove reaction (toggle off)
- If user reacted with different type: Switch reaction
- **One user = One reaction only**

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Reaction updated successfully",
  "data": {
    "_id": "690248cccdbd1b057723d816",
    "content": "This is my comment",
    "likesCount": 6,
    "dislikesCount": 1,
    ...
  }
}
```

---

## WebSocket Events (Socket.io)

### Connection
**URL:** `http://localhost:5000`

**Authentication:**
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: '<your-jwt-token>'
  }
});
```

### Server-to-Client Events

#### 1. comment:new
Emitted when a new root comment is created.

**Payload:**
```json
{
  "comment": {
    "_id": "690248cccdbd1b057723d816",
    "content": "New comment",
    "author": { ... },
    "likesCount": 0,
    "dislikesCount": 0,
    "parentComment": null,
    ...
  }
}
```

#### 2. comment:reply
Emitted when a reply to a comment is created.

**Payload:**
```json
{
  "comment": { ... },
  "parentCommentId": "690248cccdbd1b057723d816"
}
```

#### 3. comment:update
Emitted when a comment is updated.

**Payload:**
```json
{
  "comment": {
    "_id": "690248cccdbd1b057723d816",
    "content": "Updated content",
    ...
  }
}
```

#### 4. comment:delete
Emitted when a comment is deleted.

**Payload:**
```json
{
  "commentId": "690248cccdbd1b057723d816"
}
```

#### 5. comment:reaction
Emitted when a like/dislike is toggled.

**Payload:**
```json
{
  "comment": {
    "_id": "690248cccdbd1b057723d816",
    "likesCount": 6,
    "dislikesCount": 1,
    ...
  }
}
```

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "path": "body.password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "You are not authorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You can only edit your own comments"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Comment not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User already exists"
}
```

---

## Cursor-based Pagination

### How it Works

**For NEWEST sorting (default):**
- Cursor format: Simple _id (24 chars)
- Example: `"690248cccdbd1b057723d816"`

**For MOST_LIKED/MOST_DISLIKED sorting:**
- Cursor format: Compound `count_id`
- Example: `"3_690248cccdbd1b057723d816"` (3 likes)

**Usage:**
1. First request: No cursor
2. Server returns `nextCursor`
3. Next request: Include `cursor=<nextCursor>`
4. Repeat until `hasMore: false`

**Example Flow:**
```
GET /comments?sortBy=mostLiked&limit=10
→ Returns: nextCursor: "3_690248cccdbd1b057723d816", hasMore: true

GET /comments?sortBy=mostLiked&limit=10&cursor=3_690248cccdbd1b057723d816
→ Returns: nextCursor: "1_690249e5cdbd1b057723d830", hasMore: true

GET /comments?sortBy=mostLiked&limit=10&cursor=1_690249e5cdbd1b057723d830
→ Returns: nextCursor: null, hasMore: false
```

---

## Rate Limits
Currently no rate limiting implemented.

## CORS
Currently configured to allow all origins (`*`).
Configure `CORS_ORIGIN` environment variable for production.
