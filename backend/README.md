# Claude Control Center - Backend API

Backend API server for Claude Control Center built with Node.js, Express, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (via Docker or local)

### Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose** (Recommended):
   ```bash
   cd ../docker
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL on port 5432
   - Backend API on port 3000
   - Frontend nginx on port 8080
   - pgAdmin on port 5050

4. **Or run locally** (without Docker):
   ```bash
   # Start PostgreSQL locally first
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

### Database Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Migrate from localStorage

```bash
npm run migrate:storage
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Skills
```
GET    /api/skills              # List all skills
GET    /api/skills/stats        # Get statistics
GET    /api/skills/:id          # Get single skill
POST   /api/skills              # Create skill
PUT    /api/skills/:id          # Update skill
DELETE /api/skills/:id          # Delete skill
POST   /api/skills/search       # Search skills
PATCH  /api/skills/:id/favorite # Toggle favorite
PATCH  /api/skills/:id/usage    # Increment usage
```

### Agents
```
GET    /api/agents              # List all agents
GET    /api/agents/stats        # Get statistics
GET    /api/agents/:id          # Get single agent
POST   /api/agents              # Create agent
PUT    /api/agents/:id          # Update agent
DELETE /api/agents/:id          # Delete agent
POST   /api/agents/search       # Search agents
```

### MCPs
```
GET    /api/mcps                # List all MCPs
GET    /api/mcps/stats          # Get statistics
GET    /api/mcps/:id            # Get single MCP
POST   /api/mcps                # Create MCP
PUT    /api/mcps/:id            # Update MCP
DELETE /api/mcps/:id            # Delete MCP
POST   /api/mcps/search         # Search MCPs
PATCH  /api/mcps/:id/status     # Toggle status
```

### Templates
```
GET    /api/templates           # List all templates
GET    /api/templates/stats     # Get statistics
GET    /api/templates/:id       # Get single template
POST   /api/templates           # Create template
PUT    /api/templates/:id       # Update template
DELETE /api/templates/:id       # Delete template
POST   /api/templates/search    # Search templates
GET    /api/templates/:id/export # Export template files
```

### Configurations
```
GET    /api/configurations      # List all configurations
GET    /api/configurations/:id  # Get single config
POST   /api/configurations      # Create configuration
PUT    /api/configurations/:id  # Update configuration
GET    /api/configurations/:id/export # Export CLAUDE.md
POST   /api/configurations/:id/snapshot # Create snapshot
GET    /api/configurations/:id/snapshots # List snapshots
```

### Search
```
POST   /api/search/local        # Search local database
POST   /api/search/external     # Search external sources
POST   /api/search/anthropic    # Search Anthropic docs
```

### Import
```
POST   /api/import/json         # Import from JSON
POST   /api/import/url          # Import from URL
POST   /api/import/github       # Import from GitHub
POST   /api/import/bulk         # Bulk import
GET    /api/import/history      # Import history
```

## 🗄️ Database Schema

- **skills** - MCP skills library
- **agents** - Claude Code agents
- **mcps** - MCP server configurations
- **templates** - Project templates
- **configurations** - CLAUDE.md configurations
- **snapshots** - Configuration version history
- **import_history** - Import audit trail

## 🔧 Development

### Project Structure
```
backend/
├── src/
│   ├── server.js           # Express app entry point
│   ├── routes/             # API route definitions
│   ├── controllers/        # Business logic
│   ├── services/           # External services
│   ├── middleware/         # Custom middleware
│   └── scripts/            # Utility scripts
├── prisma/
│   └── schema.prisma       # Database schema
└── package.json
```

### Testing API
```bash
# Health check
curl http://localhost:3000/api/health

# List all skills
curl http://localhost:3000/api/skills

# Create a skill
curl -X POST http://localhost:3000/api/skills \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Skill","category":"test","priority":"high",...}'
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Rebuild backend
docker-compose build backend
docker-compose up -d backend

# Access PostgreSQL
docker exec -it claude-postgres psql -U claude -d claude_control_center
```

## 📊 Database Management

### pgAdmin
Access at `http://localhost:5050`
- Email: `admin@claude.local`
- Password: `admin`

### Prisma Studio
```bash
npm run prisma:studio
```
Opens GUI at `http://localhost:5555`

## 🔐 Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

## 🚨 Troubleshooting

### Database connection issues
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs claude-postgres

# Reset database
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
```

### Port conflicts
```bash
# Change ports in docker-compose.yml
# Or stop conflicting services
lsof -ti:3000 | xargs kill -9
```

## 📝 Next Steps

1. ✅ Phase 1: Backend Foundation (Current)
2. ⏳ Phase 2: Data Migration
3. ⏳ Phase 3: Enhanced UIs
4. ⏳ Phase 4: Import System
5. ⏳ Phase 5: Search Integration

## 🤝 Contributing

This is part of the Claude Control Center project. See main README for details.
