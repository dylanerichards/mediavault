# BookVault - Full-Stack Interview Application

A full-stack inventory management system built for technical interviews with Rails 8 API backend and React v19 + TypeScript frontend.

## Architecture

- **Backend**: Rails 8 API-only application with SQLite database
- **Frontend**: React v19 + TypeScript + Vite + Tailwind CSS v4
- **Testing**: RSpec (backend) + React Testing Library (frontend)

## Setup

### Prerequisites
- [Mise](https://mise.jdx.dev/) for version management (Ruby 3.4, Node 22)
- SQLite 3

### Quick Start
```bash
# Versions auto-activate when entering directory (if mise is configured in shell)
# If versions aren't installed yet: mise install

# Backend setup
cd backend
bundle install
rails server

# Frontend setup (in another terminal)
cd frontend
npm install
npm run dev
```

## Testing

### Backend
```bash
cd backend
bundle exec rspec
bundle exec rubocop
```

### Frontend
```bash
cd frontend
npm run lint
```

## Project Structure

```
fsapp/
├── backend/                 # Rails 8 API
│   ├── app/
│   │   ├── controllers/     # API controllers
│   │   └── models/          # ActiveRecord models
│   ├── config/              # Rails configuration
│   ├── db/                  # Database files & migrations
│   ├── spec/                # RSpec tests
│   └── Gemfile
├── frontend/                # React + TypeScript
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   └── vite.config.ts
├── .mise.toml               # Version management
├── TODO.md                  # Development progress
└── README.md
```

## Coding Challenge Task

### Objective: Implement User Action Tracking System

This application currently manages a book inventory system. Your task is to implement a comprehensive user action tracking system that records user interactions with the platform.

### Requirements

Build a user action tracking system that captures:
- **Book Views**: When a user clicks on or views a specific book (User X viewed Book Y at timestamp)
- **Search Activity**: When a user performs a search (User Z searched for "mystery novels" at timestamp)
- **Additional Actions**: Any other user interactions you deem valuable to track

The system should store these actions with full context including user, action type, target resource, search terms, and precise timestamps.

### Evaluation Criteria

1. **System Design** - How well you abstract the domain model
2. **Code Quality** - Clean, maintainable, and testable code
3. **Database Design** - Efficient schema and migration strategy
4. **API Design** - RESTful, consistent, and extensible endpoints
5. **Testing** - Comprehensive test coverage for new functionality
6. **Performance** - Efficient queries and minimal N+1 problems
7. **Error Handling** - Robust error handling and validation

### Bonus Points

- **Analytics Dashboard**: Create endpoints to retrieve user behavior analytics (most viewed books, popular search terms, user activity patterns)
- **Real-time Tracking**: Implement WebSocket or Server-Sent Events for real-time action streaming
- **Action Aggregation**: Build summary tables for efficient reporting (daily/weekly/monthly stats)
- **Privacy Controls**: Add user consent management and data retention policies
- **Performance Optimization**: Implement background job processing for heavy analytics calculations

### Getting Started

The codebase currently has some failing tests that need to be fixed before beginning the refactoring. Run `bundle exec rspec` in the backend directory to see the current test failures - these will guide you toward the issues that need addressing.

---

## Development Status

Work in progress. See TODO.md for current development status and planned features.
