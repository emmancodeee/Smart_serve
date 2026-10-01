# PHINMA SmartServe API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All responses follow this format:
```json
{
  "message": "Success message",
  "data": { ... }
}
```

Error responses:
```json
{
  "error": "Error message"
}
```

## Endpoints

### Authentication

#### POST /auth/send-verification
Send email verification code for registration.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Verification code sent successfully."
}
```

**Error Responses:**
- 400: Invalid email format
- 409: Email already registered
- 500: Email service unavailable

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "name": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "birthday": "2000-01-01",
  "age": 24,
  "studentNumber": "2024-12345",
  "verificationCode": "123456"
}
```

**Response (201):**
```json
{
  "message": "Registration successful. You can now log in.",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "studentNumber": "2024-12345"
  }
}
```

**Error Responses:**
- 400: Invalid input data
- 409: Email or student number already registered

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "isAdmin": false,
  "accountType": "user",
  "name": "John Doe",
  "email": "user@example.com"
}
```

**Error Responses:**
- 400: Missing credentials
- 401: Invalid email or password

#### POST /auth/forgot-password
Initiate password reset process.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset code sent successfully."
}
```

**Error Responses:**
- 400: Invalid email format
- 404: Account not found

#### POST /auth/reset-password
Reset password using verification code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful."
}
```

**Error Responses:**
- 400: Invalid input or mismatched passwords
- 400: Invalid or expired reset code

### User Account (Requires Authentication)

#### POST /auth/feedback
Submit feedback about modules, uniforms, books, or general service.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "category": "module",
  "subject": "Module quality feedback",
  "content": "The module materials are excellent but the schedule could be improved.",
  "rating": 4,
  "relatedItemId": "registration_id",
  "relatedItemType": "registration",
  "priority": "medium"
}
```

**Response (201):**
```json
{
  "message": "Feedback submitted successfully",
  "feedback": {
    "_id": "feedback_id",
    "category": "module",
    "subject": "Module quality feedback",
    "status": "pending",
    "priority": "medium",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- 400: Invalid input data
- 401: Unauthorized

#### GET /auth/feedback
Get all feedback submitted by the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "feedback_id",
    "category": "module",
    "subject": "Module quality feedback",
    "content": "The module materials are excellent...",
    "rating": 4,
    "status": "reviewed",
    "priority": "medium",
    "adminResponses": [
      {
        "adminName": "Admin User",
        "content": "Thank you for your feedback. We'll consider your suggestions.",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /auth/feedback/:id
Get specific feedback details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "feedback_id",
  "category": "module",
  "subject": "Module quality feedback",
  "content": "The module materials are excellent...",
  "rating": 4,
  "status": "reviewed",
  "priority": "medium",
  "adminResponses": [...],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /auth/feedback/:id
Update feedback (only if status is pending).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Updated feedback content",
  "rating": 5
}
```

**Response (200):**
```json
{
  "message": "Feedback updated successfully",
  "feedback": { ... }
}
```

#### DELETE /auth/feedback/:id
Delete feedback (only if status is pending).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Feedback deleted successfully"
}
```

#### POST /auth/returns
Submit a return request for modules, uniforms, or books.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "registrationId": "registration_id",
  "items": [
    {
      "type": "module",
      "name": "Module A - Mathematics",
      "condition": "good",
      "quantity": 1,
      "notes": "Minor wear on cover"
    },
    {
      "type": "uniform",
      "name": "Medium Uniform Set",
      "condition": "excellent",
      "quantity": 1
    }
  ],
  "reason": "Completed the semester, returning all materials",
  "details": "All items are in good condition, ready for return",
  "requestedReturnDate": "2024-12-15",
  "priority": "medium"
}
```

**Response (201):**
```json
{
  "message": "Return request submitted successfully",
  "returnRequest": {
    "_id": "return_request_id",
    "registrationId": "registration_id",
    "items": [...],
    "requestedReturnDate": "2024-12-15T00:00:00.000Z",
    "status": "pending",
    "priority": "medium",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- 400: Invalid input or active return request exists
- 403: Access denied
- 404: Registration not found

#### GET /auth/returns
Get all return requests for the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "return_request_id",
    "registrationId": {
      "module": "Module A",
      "uniformType": "Medium",
      "books": "Textbook 1"
    },
    "items": [...],
    "reason": "Completed the semester...",
    "requestedReturnDate": "2024-12-15T00:00:00.000Z",
    "status": "approved",
    "priority": "medium",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /auth/returns/:id
Get specific return request details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "return_request_id",
  "registrationId": { ... },
  "items": [...],
  "reason": "Completed the semester...",
  "requestedReturnDate": "2024-12-15T00:00:00.000Z",
  "actualReturnDate": "2024-12-15T14:30:00.000Z",
  "status": "completed",
  "priority": "medium",
  "adminDecision": {
    "approvedBy": "admin_id",
    "approvedAt": "2024-12-14T00:00:00.000Z",
    "adminNotes": "Approved for return"
  },
  "returnConfirmation": {
    "confirmedBy": "admin_id",
    "confirmedAt": "2024-12-15T14:30:00.000Z",
    "receivedCondition": "good",
    "notes": "All items received in good condition"
  },
  "inventoryRestored": true,
  "studentFeedback": {
    "rating": 5,
    "comments": "Smooth return process"
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /auth/returns/:id/cancel
Cancel a pending return request.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Return request cancelled successfully"
}
```

#### PUT /auth/returns/:id/feedback
Add feedback about the return process (only after return is completed).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 5,
  "comments": "The return process was smooth and efficient"
}
```

**Response (200):**
```json
{
  "message": "Feedback added successfully",
  "returnRequest": { ... }
}
```

#### GET /auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "user@example.com",
  "isAdmin": false,
  "accountType": "user",
  // ... additional user fields
}
```

#### PUT /auth/update-profile
Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "newemail@example.com",
  "fullname": "John Updated Doe",
  "age": 25,
  "course": "Computer Science",
  "yearLevel": "2nd Year",
  "studentType": "regular",
  "module": "Module A",
  "books": "Textbook 1, Textbook 2",
  "uniformType": "Medium",
  "pictureOfId": "https://example.com/id.jpg"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

#### PUT /auth/change-password
Change user password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- 400: Old password is incorrect
- 400: New password must be different from current password

#### POST /auth/extract-orf
Extract text from ORF image using OCR.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
orfImage: <file>
```

**Response (200):**
```json
{
  "text": "Extracted text from image",
  "confidence": 0.95
}
```

### Admin Endpoints (Requires Admin Authentication)

#### GET /admin/users
List all users (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
[
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "status": "pending"
  }
]
```

#### GET /admin/users/:id
Get specific user details.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "user@example.com",
  // ... additional user details
}
```

#### DELETE /admin/users/:id
Delete a user account.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

#### GET /admin/admins
List all admin accounts.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
[
  {
    "_id": "admin_id",
    "name": "Admin User",
    "email": "admin@example.com",
    "isSuperAdmin": false
  }
]
```

#### POST /admin/admins
Create a new admin account (super admin only).

**Headers:**
```
Authorization: Bearer <super_admin_token>
```

**Request Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "AdminPassword123!"
}
```

**Response (201):**
```json
{
  "message": "Admin account created successfully.",
  "admin": {
    "_id": "admin_id",
    "name": "New Admin",
    "email": "newadmin@example.com",
    "isAdmin": true,
    "isSuperAdmin": false
  }
}
```

#### DELETE /admin/admins/:id
Delete an admin account (super admin only).

**Headers:**
```
Authorization: Bearer <super_admin_token>
```

**Response (200):**
```json
{
  "message": "Admin account deleted successfully."
}
```

#### PUT /admin/change-password
Change admin's own password.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmNewPassword": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "message": "Admin password changed successfully."
}
```

### Feedback Management (Admin Only)

#### GET /admin/feedback
List all feedback with filtering and pagination.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status`: Filter by status (pending, reviewed, resolved, closed)
- `category`: Filter by category (module, uniform, books, general, service)
- `priority`: Filter by priority (low, medium, high, urgent)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response (200):**
```json
{
  "feedbacks": [
    {
      "_id": "feedback_id",
      "userId": "user_id",
      "userName": "John Doe",
      "userEmail": "user@example.com",
      "category": "module",
      "subject": "Module quality feedback",
      "content": "The module materials are excellent...",
      "rating": 4,
      "status": "pending",
      "priority": "medium",
      "adminResponses": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### GET /admin/feedback/:id
Get detailed feedback information.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "_id": "feedback_id",
  "userId": "user_id",
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "category": "module",
  "subject": "Module quality feedback",
  "content": "The module materials are excellent...",
  "rating": 4,
  "status": "pending",
  "priority": "medium",
  "adminResponses": [],
  "reviewedBy": null,
  "reviewedAt": null,
  "resolutionNotes": "",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### POST /admin/feedback/:id/response
Add admin response to feedback.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "content": "Thank you for your feedback. We'll consider your suggestions for improvement."
}
```

**Response (200):**
```json
{
  "message": "Admin response added successfully",
  "feedback": {
    "_id": "feedback_id",
    "adminResponses": [
      {
        "adminId": "admin_id",
        "adminName": "Admin User",
        "content": "Thank you for your feedback...",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "status": "reviewed",
    "reviewedBy": "admin_id",
    "reviewedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /admin/feedback/:id/status
Update feedback status.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "resolved",
  "resolutionNotes": "Issue has been resolved and implemented in latest update"
}
```

**Response (200):**
```json
{
  "message": "Feedback status updated successfully",
  "feedback": {
    "_id": "feedback_id",
    "status": "resolved",
    "reviewedBy": "admin_id",
    "reviewedAt": "2024-01-01T00:00:00.000Z",
    "resolutionNotes": "Issue has been resolved..."
  }
}
```

#### PUT /admin/feedback/:id/priority
Update feedback priority.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "priority": "high"
}
```

**Response (200):**
```json
{
  "message": "Feedback priority updated successfully",
  "feedback": {
    "_id": "feedback_id",
    "priority": "high"
  }
}
```

### Return Request Management (Admin Only)

#### GET /admin/returns
List all return requests with filtering and pagination.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status`: Filter by status (pending, approved, rejected, completed, cancelled)
- `priority`: Filter by priority (low, medium, high, urgent)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response (200):**
```json
{
  "returnRequests": [
    {
      "_id": "return_request_id",
      "userId": "user_id",
      "userName": "John Doe",
      "userEmail": "user@example.com",
      "registrationId": {
        "module": "Module A",
        "uniformType": "Medium",
        "books": "Textbook 1"
      },
      "items": [
        {
          "type": "module",
          "name": "Module A - Mathematics",
          "condition": "good",
          "quantity": 1,
          "notes": "Minor wear on cover"
        }
      ],
      "reason": "Completed the semester...",
      "requestedReturnDate": "2024-12-15T00:00:00.000Z",
      "status": "pending",
      "priority": "medium",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 30,
    "pages": 2
  }
}
```

#### GET /admin/returns/:id
Get detailed return request information.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "_id": "return_request_id",
  "userId": "user_id",
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "registrationId": { ... },
  "items": [...],
  "reason": "Completed the semester...",
  "details": "All items are in good condition...",
  "requestedReturnDate": "2024-12-15T00:00:00.000Z",
  "actualReturnDate": null,
  "status": "pending",
  "priority": "medium",
  "adminDecision": {
    "approvedBy": null,
    "approvedAt": null,
    "rejectedBy": null,
    "rejectedAt": null,
    "rejectionReason": "",
    "adminNotes": ""
  },
  "returnConfirmation": {
    "confirmedBy": null,
    "confirmedAt": null,
    "receivedCondition": null,
    "notes": ""
  },
  "inventoryRestored": false,
  "studentFeedback": {
    "rating": null,
    "comments": ""
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /admin/returns/:id/approve
Approve a return request.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "adminNotes": "Approved for return on requested date"
}
```

**Response (200):**
```json
{
  "message": "Return request approved successfully",
  "returnRequest": {
    "_id": "return_request_id",
    "status": "approved",
    "adminDecision": {
      "approvedBy": "admin_id",
      "approvedAt": "2024-12-14T00:00:00.000Z",
      "adminNotes": "Approved for return on requested date"
    }
  }
}
```

#### PUT /admin/returns/:id/reject
Reject a return request.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "rejectionReason": "Items must be returned in better condition",
  "adminNotes": "Please contact student for item inspection"
}
```

**Response (200):**
```json
{
  "message": "Return request rejected successfully",
  "returnRequest": {
    "_id": "return_request_id",
    "status": "rejected",
    "adminDecision": {
      "rejectedBy": "admin_id",
      "rejectedAt": "2024-12-14T00:00:00.000Z",
      "rejectionReason": "Items must be returned in better condition",
      "adminNotes": "Please contact student for item inspection"
    }
  }
}
```

#### PUT /admin/returns/:id/confirm
Confirm return and restore inventory.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "receivedCondition": "good",
  "notes": "All items received in good condition, no damages"
}
```

**Response (200):**
```json
{
  "message": "Return confirmed successfully",
  "returnRequest": {
    "_id": "return_request_id",
    "status": "completed",
    "actualReturnDate": "2024-12-15T14:30:00.000Z",
    "returnConfirmation": {
      "confirmedBy": "admin_id",
      "confirmedAt": "2024-12-15T14:30:00.000Z",
      "receivedCondition": "good",
      "notes": "All items received in good condition..."
    },
    "inventoryRestored": true
  }
}
```

#### PUT /admin/returns/:id/priority
Update return request priority.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "priority": "high"
}
```

**Response (200):**
```json
{
  "message": "Return request priority updated successfully",
  "returnRequest": {
    "_id": "return_request_id",
    "priority": "high"
  }
}
```

### Registration Management

#### GET /admin/registrations
List all user registrations.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
[
  {
    "_id": "registration_id",
    "userId": "user_id",
    "fullname": "John Doe",
    "course": "Computer Science",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### PUT /admin/registrations/:id/status
Update registration status.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "approved"
}
```

**Response (200):**
```json
{
  "message": "Registration approved. Auto schedule generated (5 events). Inventory deducted based on requested supplies.",
  "status": "approved",
  "autoScheduleCount": 5,
  "inventoryAllocations": [...]
}
```

### Health Check

#### GET /health
Check server and database health status.

**Response (200):**
```json
{
  "ok": true,
  "uptimeSeconds": 3600,
  "database": {
    "ready": true,
    "state": "connected",
    "connectedAt": "2024-01-01T00:00:00.000Z",
    "lastError": null,
    "lastErrorAt": null,
    "nextRetryAt": null
  }
}
```

**Response (503):**
```json
{
  "ok": false,
  "uptimeSeconds": 3600,
  "database": {
    "ready": false,
    "state": "disconnected",
    "lastError": "Connection error",
    "lastErrorAt": "2024-01-01T00:00:00.000Z",
    "nextRetryAt": "2024-01-01T00:00:05.000Z"
  }
}
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes (production), 5000 requests (development)
- **Login Endpoint**: 5 requests per 5 minutes (production), 200 requests (development)
- **Auth Endpoints**: 10 requests per 15 minutes (production), 200 requests (development)

Rate limits are bypassed for local requests in development mode.

## Error Codes

- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Missing or invalid authentication
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **409**: Conflict - Duplicate resource
- **500**: Internal Server Error - Server error
- **502**: Bad Gateway - Email provider error
- **503**: Service Unavailable - Database unavailable

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Email Requirements

- Must be valid email format
- Must be unique across both User and Admin collections
- Case-insensitive for uniqueness checking

## Environment Variables

See `.env.example` for required environment variables:
- `JWT_SECRET`: Required for token generation
- `MONGO_URI`: MongoDB connection string
- `EMAIL_USER`: Email service username
- `EMAIL_PASSWORD`: Email service password
- `LOG_LEVEL`: Logging verbosity (DEBUG, INFO, WARN, ERROR)