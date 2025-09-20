# URL Shortener System Design Document

## 1. Introduction

### 1.1 Purpose

This document outlines the system architecture, design decisions, and technical specifications for the URL Shortener application. The system provides a web-based service to shorten long URLs, track usage statistics, and manage user authentication.

### 1.2 Scope

The URL Shortener application consists of:

- A backend API service built with Express.js
- A frontend single-page application built with React and Tailwind CSS
- User authentication system
- URL shortening functionality with customizable parameters
- Usage statistics tracking
- Comprehensive logging system

### 1.3 Definitions and Acronyms

- **URL**: Uniform Resource Locator
- **API**: Application Programming Interface
- **SPA**: Single Page Application
- **JWT**: JSON Web Token
- **UI**: User Interface
- **REST**: Representational State Transfer

## 2. System Architecture

### 2.1 High-Level Architecture

The URL Shortener follows a client-server architecture with clear separation between frontend and backend components:

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│                 │     │                  │     │                   │
│  React Frontend │────>│  Express Backend │────>│ External Services │
│                 │     │                  │     │                   │
└─────────────────┘     └──────────────────┘     └───────────────────┘
```

#### 2.1.1 Major Components

1. **Frontend Application (React)**

   - User Interface for URL shortening, authentication, and statistics
   - Client-side routing and state management
   - Service layer for API communication

2. **Backend Server (Express.js)**

   - RESTful API endpoints for URL management and authentication
   - In-memory data storage for URL mappings
   - Authentication validation and token management
   - Logging middleware

3. **External Services**
   - Authentication service (evaluation-service/auth)
   - Logging service (evaluation-service/logs)

### 2.2 Component Diagram

```
┌─────────────────────────────────────────┐
│             Frontend (React)            │
│                                         │
│  ┌─────────────┐     ┌───────────────┐  │
│  │    Login    │     │ URL Shortener │  │
│  └─────────────┘     └───────────────┘  │
│                                         │
│  ┌─────────────┐     ┌───────────────┐  │
│  │ Navigation  │     │URL Statistics │  │
│  └─────────────┘     └───────────────┘  │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │           API Services              ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│           Backend (Express)             │
│                                         │
│  ┌─────────────┐     ┌───────────────┐  │
│  │  Auth API   │     │  URL API      │  │
│  └─────────────┘     └───────────────┘  │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │        Logging Middleware           ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │       In-Memory URL Storage         ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│           External Services             │
│                                         │
│  ┌─────────────┐     ┌───────────────┐  │
│  │  Auth API   │     │  Logging API  │  │
│  └─────────────┘     └───────────────┘  │
└─────────────────────────────────────────┘
```

## 3. Backend Design

### 3.1 API Endpoints

#### 3.1.1 Authentication Endpoints

| Endpoint | Method | Description       | Request Body                                                  | Response                                                               |
| -------- | ------ | ----------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `/login` | POST   | Authenticate user | `{ email, name, rollNo, accessCode, clientID, clientSecret }` | `{ success, message, data: { token_type, access_token, expires_in } }` |

#### 3.1.2 URL Shortening Endpoints

| Endpoint                | Method | Description              | Request Body / Parameters      | Response                                                                |
| ----------------------- | ------ | ------------------------ | ------------------------------ | ----------------------------------------------------------------------- |
| `/shorturls`            | POST   | Create shortened URL     | `{ url, validity, shortcode }` | `{ shortLink, expiry }`                                                 |
| `/shorturls/:shortcode` | GET    | Get URL statistics       | `shortcode` (path param)       | `{ shortcode, totalClicks, originalUrl, createdAt, expiry, clickData }` |
| `/:shortcode`           | GET    | Redirect to original URL | `shortcode` (path param)       | Redirect or error                                                       |

### 3.2 Data Models

#### 3.2.1 URL Data Model

```javascript
{
  originalUrl: String,   // The original long URL
  expiry: Date,          // Expiration timestamp
  createdAt: String,     // ISO timestamp of creation
  clicks: [              // Array of click events
    {
      timestamp: String, // ISO timestamp of click
      referrer: String,  // Referring URL or "Direct"
      userAgent: String  // Browser user agent
    }
  ]
}
```

### 3.3 Authentication Flow

1. User submits credentials to `/login` endpoint
2. Backend validates required fields
3. Backend forwards request to external authentication service
4. Upon successful authentication, a token is returned
5. Frontend stores the token in localStorage for subsequent API calls

### 3.4 URL Shortening Process

1. User submits URL with optional parameters (validity, custom shortcode)
2. Backend validates the URL and parameters
3. If custom shortcode is provided, system checks availability
4. If no shortcode is provided, system generates a unique 5-character code
5. System stores URL mapping with expiration time
6. System returns the shortened URL and expiry information

### 3.5 Logging System

The application uses a middleware-based logging system:

1. Each request gets access to a `logger` function
2. Logger captures: stack, level, package, and message
3. Log entries are sent to an external logging service
4. Four logging levels: debug, info, warn, error
5. Logs are categorized by component (auth, url-shortener)

## 4. Frontend Design

### 4.1 Component Structure

#### 4.1.1 Core Components

- **App**: Main application container with routing
- **Navigation**: Responsive navigation bar
- **Login**: Authentication form
- **URLShortener**: URL shortening interface
- **URLStatistics**: Statistics display component

#### 4.1.2 Service Layer

- **authService**: Handles authentication, token management
- **urlService**: Manages URL shortening and statistics retrieval

### 4.2 State Management

The application uses React's useState hook for component-level state management:

- Authentication state is managed in the App component
- Form data is managed within each respective component
- API response data is stored in component state

### 4.3 Routing

Routes are managed using React Router:

- `/`: Home page
- `/login`: Login page
- `/shorten`: URL shortening page (protected)
- `/stats`: URL statistics page (protected)

### 4.4 UI Design

The application uses Tailwind CSS for styling with:

- Responsive design for various screen sizes
- Consistent color scheme and typography
- Form validation and error handling
- Loading states for async operations
- Accessibility considerations

## 5. Data Flow

### 5.1 URL Shortening Flow

```
┌─────────┐     ┌─────────────────┐     ┌───────────────┐     ┌─────────────┐
│  User   │────>│ URLShortener    │────>│ urlService    │────>│ Backend API │
│         │     │ Component       │     │               │     │             │
└─────────┘     └─────────────────┘     └───────────────┘     └─────────────┘
                         │                                            │
                         │                                            │
                         ▼                                            ▼
                ┌────────────────────┐                       ┌────────────────┐
                │ Display shortened  │<─────────────────────┤  Process URL   │
                │ URL to user       │                       │  & generate    │
                └────────────────────┘                       │  shortcode    │
                                                           └────────────────┘
```

### 5.2 URL Redirection Flow

```
┌─────────┐     ┌───────────────┐     ┌─────────────┐     ┌─────────────────┐
│  User   │────>│ Click on      │────>│ Backend API │────>│ Validate & Find │
│         │     │ shortened URL │     │ /:shortcode │     │ original URL    │
└─────────┘     └───────────────┘     └─────────────┘     └─────────────────┘
                                                                   │
    ┌─────────────────────┐                                        │
    │ Redirected to       │<───────────────────────────────────────┘
    │ original website    │
    └─────────────────────┘
```

### 5.3 Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌───────────────┐     ┌─────────────────┐     ┌───────────────┐
│  User   │────>│ Login       │────>│ authService   │────>│ Backend API     │────>│ External      │
│         │     │ Component   │     │               │     │                 │     │ Auth Service  │
└─────────┘     └─────────────┘     └───────────────┘     └─────────────────┘     └───────────────┘
                       │                                            │                      │
                       │                                            │                      │
                       │                                            │                      │
                       ▼                                            ▼                      ▼
               ┌───────────────────┐                       ┌─────────────────┐    ┌───────────────┐
               │ Store token and   │<──────────────────────┤ Process auth    │<───┤ Validate      │
               │ update UI state   │                       │ response        │    │ credentials   │
               └───────────────────┘                       └─────────────────┘    └───────────────┘
```

## 6. Technology Stack

### 6.1 Frontend

- **Framework**: React.js
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **HTTP Client**: Native Fetch API
- **Bundler**: Vite

### 6.2 Backend

- **Framework**: Express.js
- **URL Generation**: nanoid
- **CORS Handling**: cors package
- **Data Storage**: In-memory (Map object)
- **HTTP Client**: Native Fetch API

## 7. Security Considerations

### 7.1 Authentication

- JWT-based authentication
- Token storage in localStorage
- Protected routes requiring authentication

### 7.2 API Security

- CORS configuration to restrict cross-origin requests
- Input validation for all endpoints
- Error handling that doesn't expose sensitive information

## 8. Scalability Considerations

### 8.1 Current Limitations

- In-memory storage limits URL capacity
- No persistence between server restarts
- Single server deployment

### 8.2 Future Improvements

- Database integration for URL storage
- Distributed architecture for high availability
- Caching layer for frequently accessed URLs
- Rate limiting to prevent abuse
- Analytics dashboard for system metrics

## 9. Monitoring and Logging

### 9.1 Logging Strategy

- Comprehensive logging for all operations
- Multiple log levels (debug, info, warn, error)
- Integration with external logging service
- Contextual information in log messages

### 9.2 Metrics to Track

- URL creation rate
- Redirection success rate
- Authentication success/failure rate
- Response times
- Error rates

## 10. Deployment Architecture

### 10.1 Current Deployment

- Development environment with local server
- Frontend and backend running on separate ports

### 10.2 Recommended Production Architecture

```
                       ┌─────────────────┐
                       │   Load Balancer │
                       └────────┬────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
        ┌────────▼─────────┐        ┌─────────▼────────┐
        │  Frontend Server │        │  Backend Server  │
        │  (React + Nginx) │        │  (Express)       │
        └────────┬─────────┘        └─────────┬────────┘
                 │                             │
                 │                  ┌──────────┴──────────┐
                 │                  │                     │
        ┌────────▼─────────┐ ┌─────▼───────┐    ┌────────▼────────┐
        │  CDN for static  │ │ Database    │    │ External        │
        │  assets          │ │ (Redis/     │    │ Services        │
        └──────────────────┘ │ MongoDB)    │    │                 │
                             └─────────────┘    └─────────────────┘
```

## 11. Development and Deployment Procedures

### 11.1 Development Setup

1. Clone repository
2. Install dependencies for frontend and backend
3. Configure environment variables
4. Start backend server with `npm run dev`
5. Start frontend development server with `npm run dev`

### 11.2 Deployment Process

1. Build frontend application: `npm run build`
2. Configure production environment variables
3. Deploy backend to hosting provider
4. Deploy frontend static assets to CDN or static hosting
5. Configure domain and SSL certificates

## 12. Conclusion

The URL Shortener system provides a comprehensive solution for creating, managing, and tracking shortened URLs. The architecture separates concerns between frontend and backend components, uses modern web technologies, and integrates with external services for authentication and logging.

This design allows for future scalability and feature additions while maintaining a clean, maintainable codebase.
