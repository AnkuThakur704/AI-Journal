# System Architecture

## Overview

The system is designed as a simple full-stack architecture consisting of three main components:

**Frontend**
- Built using React
- Allows users to write journal entries, analyze emotions, and view insights.

**Backend API**
- Built using Node.js and Express
- Handles journal storage, emotion analysis requests, and insights generation.

**Database**
- MongoDB stores journal entries along with emotion analysis results.

**LLM Integration**
- Google Gemini (gemini-2.5-flash) analyzes journal text and returns:
  - Emotion
  - Keywords
  - Emotional summary

### System Flow

User → React Frontend → Express API → Gemini API → MongoDB

1. User writes a journal entry.
2. The frontend sends the text to `/api/journal/analyze`.
3. The backend calls the Gemini API to analyze emotions.
4. The analyzed result is returned to the frontend.
5. The journal entry and analysis are saved in the database.
6. Insights are generated from stored entries.

---

# Scaling the System to 100k Users

To support a large number of users, several improvements can be implemented.

### 1. Horizontal Scaling of Backend

The backend API is stateless and can be scaled horizontally by running multiple instances behind a load balancer.

Example infrastructure:


Load Balancer<br>
↓<br>
Multiple Node.js API instances<br>
↓<br>
MongoDB Cluster


This allows the system to handle many concurrent requests.

### 2. Database Optimization

For faster queries:

- Add indexes on frequently queried fields such as:
  - `userId`
  - `createdAt`

Example:


db.journals.createIndex({ userId: 1 })


### 3. Pagination for Journal Retrieval

Instead of returning all journal entries, results can be paginated to reduce database load.

Example:


GET /api/journal/:userId?page=1&limit=10


### 4. Background Processing

LLM analysis can be moved to background workers using job queues such as:

- Redis
- BullMQ

This prevents the API from blocking while waiting for LLM responses.

---

# Reducing LLM Cost

LLM usage is the most expensive part of the system. Several strategies can reduce cost.

### 1. Analyze Once and Store Results

Each journal entry is analyzed only once and the result is stored in the database.

Future insights are generated from stored data without calling the LLM again.

### 2. Use Lightweight Models

The system uses **Gemini Flash**, which is optimized for speed and lower cost compared to larger models.

### 3. Rate Limiting

Limit the number of analysis requests per user to prevent abuse of the LLM API.

Example:

- Max 10 analyses per minute per user.

### 4. Input Validation

Prevent unnecessary LLM calls by rejecting empty or invalid journal submissions.

---

# Caching Repeated Analysis

If identical journal text is analyzed multiple times, caching can prevent repeated LLM calls.

### Approach

1. Generate a **hash of the journal text**.
2. Check if a cached analysis already exists.
3. If it exists, return the cached result instead of calling the LLM.

Example:


hash = SHA256(journal_text)

Benefits:

- Reduced LLM cost
- Faster response time
- Lower API latency

---

# Protecting Sensitive Journal Data

Journal entries may contain personal or emotional information, so protecting this data is important.

### 1. Secure Environment Variables

Sensitive information such as API keys and database credentials are stored in `.env` files and not committed to the repository.

### 2. HTTPS Communication

All communication between frontend and backend should use HTTPS to prevent data interception.

### 3. Access Control

Each journal entry is associated with a `userId` to ensure users only access their own data.

### 4. Database Security

- Restrict database access to backend servers only.
- Use authentication and role-based access control in MongoDB.

### 5. Data Encryption

Sensitive journal data can be encrypted at rest using database encryption features.

---

# Future Architectural Improvements

- Implement authentication (JWT or OAuth)
- Add analytics dashboards for emotional trends
- Introduce background job queues for LLM analysis
- Add caching layers for improved performance
- Implement monitoring and logging for system reliability
