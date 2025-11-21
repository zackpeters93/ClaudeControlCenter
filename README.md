# Claude Control Center (CCC)

> A comprehensive management system for Claude Desktop, Claude Code, and Claude Web configurations.

## 🎯 Project Overview

Claude Control Center helps you manage:
- **CLAUDE.md Configuration Builder** - Create and maintain your Claude configuration files
- **Skills Library** - Browse and manage MCP skills across all Claude environments
- **Agents Manager** - Understand and configure Claude Code agents and subagents
- **MCP Configuration** - View and manage Model Context Protocol server configurations
- **Project Templates** - Quick-start templates for new projects (HTML, Python, iOS, Arduino, etc.)
- **Design System** - American Palette color scheme and UI components
- **Documentation Archive** - Version control for your configurations
- **User Guide** - Comprehensive documentation for all features

## 🏗️ Architecture

**Frontend**: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript
**Backend**: Node.js, Express, Prisma ORM
**Database**: PostgreSQL 16
**Orchestration**: Docker Compose
**Automation**: n8n workflows
**Integration**: VS Code Extension (coming soon)

## 📦 What's Included

### Current Features (Phase 1-2)
- ✅ Dashboard with stats and quick actions
- ✅ CLAUDE.md Builder with section management
- ✅ Design System Manager with live preview
- ✅ Skills Library with 7 built-in MCP skills
- ✅ Agents Manager with 4 agent types
- ✅ MCP Configuration Viewer with 7 servers
- ✅ Project Templates (HTML, Python, Embedded LVGL)
- ✅ Documentation Archive with snapshots
- ✅ User Guide with troubleshooting
- ✅ Backend API infrastructure
- ✅ PostgreSQL database schema
- ✅ Docker Compose setup

### Coming Soon (Phase 3-10)
- ⏳ Full CRUD operations for Skills/Agents/MCPs/Templates
- ⏳ Multi-source import (JSON, URL, GitHub, Anthropic)
- ⏳ Local & external search
- ⏳ localStorage → PostgreSQL migration tool
- ⏳ n8n workflow automation
- ⏳ Additional templates (AppleScript, iOS/Swift, Arduino)
- ⏳ VS Code Extension for project initialization
- ⏳ Claude Code integration

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
cd docker
docker-compose up -d
```

Access at:
- **Frontend**: http://localhost:8080
- **API**: http://localhost:3000
- **pgAdmin**: http://localhost:5050

### Option 2: Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev

# Frontend (in another terminal)
cd ..
python3 -m http.server 8080
```

## 📚 Documentation

- **[Phase 1 Setup Guide](PHASE1_SETUP.md)** - Current implementation status
- **[Backend README](backend/README.md)** - API documentation
- **[User Guide](user-guide.html)** - End-user documentation
- **[CLAUDE.md](CLAUDE.md)** - Project-specific Claude instructions

## 🗂️ Project Structure

```
ClaudeControlCenter/
├── index.html              # Dashboard
├── user-guide.html         # User documentation
├── assets/
│   ├── css/                # Stylesheets
│   └── js/                 # Frontend JavaScript
├── pages/                  # Feature pages
│   ├── claude-builder.html
│   ├── skills-manager.html
│   ├── agents-manager.html
│   ├── mcps-viewer.html
│   ├── project-templates.html
│   ├── design-system.html
│   └── documentation-archive.html
├── backend/                # Node.js API
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   └── controllers/
│   └── prisma/
│       └── schema.prisma
├── docker/                 # Docker configuration
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
└── vscode-extension/       # Coming in Phase 8
```

## 🎨 Design System

**American Palette** - Flat design, no gradients

**Primary Colors:**
- Dracula Orchid (#2d3436) - Headers, dark text
- City Lights (#dfe6e9) - Light backgrounds
- Electron Blue (#0984e3) - Links, primary actions
- Chi-Gong (#d63031) - Alerts, warnings

**Secondary Colors:**
- Mint Leaf (#00b894) - Success states
- Bright Yarrow (#fdcb6e) - Highlights

**Frameworks:**
- Bootstrap 5.3+
- Font Awesome 6
- Chart.js (future analytics)

## 🔧 Development Roadmap

### ✅ Completed Phases
- **Phase 0**: Initial web app with localStorage
- **Phase 1**: Backend Foundation (100% complete) ✅
  - Express API server
  - PostgreSQL database
  - All CRUD controllers
  - Docker orchestration
- **Phase 2**: Data Migration (100% complete) ✅
  - Database seeding system
  - 7 Skills + 4 Agents + 3 MCPs + 3 Templates
  - All API endpoints functional

### 🚧 Active Development
- **Phase 3**: Enhanced Manager UIs with CRUD (Next up!)

### 📋 Planned Phases
- **Phase 4**: Multi-source import system
- **Phase 5**: Search integration (local + external)
- **Phase 6**: n8n workflow automation
- **Phase 7**: Template expansion (AppleScript, iOS, Arduino)
- **Phase 8**: VS Code Extension
- **Phase 9**: Testing & Documentation
- **Phase 10**: Production Deployment

**Timeline**: 12 weeks total | **Current**: End of Week 1 (20% complete)

## 📡 API Endpoints

See [backend/README.md](backend/README.md) for full API documentation.

Quick reference:
```
GET    /api/health              # Health check
GET    /api/skills              # List skills
POST   /api/skills              # Create skill
GET    /api/agents              # List agents
GET    /api/mcps                # List MCPs
GET    /api/templates           # List templates
POST   /api/search/local        # Search database
POST   /api/import/json         # Import JSON
```

## 🧪 Testing

```bash
# Test API
curl http://localhost:3000/api/health

# Test frontend
open http://localhost:8080

# View database
npm run prisma:studio
```

## 🐳 Docker Management

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild
docker-compose build
docker-compose up -d
```

## 🤝 Contributing

This is a personal project for managing Claude environments. Future plans may include:
- Community template library
- Shared Skills marketplace
- Plugin system for custom integrations

## 📄 License

MIT License

## 🔗 Links

- **Anthropic Documentation**: https://docs.anthropic.com
- **Claude Code**: https://claude.com/code
- **MCP Protocol**: https://modelcontextprotocol.io

## 💡 Philosophy

Built on Zack's principles:
- Evidence-based decision making
- Systematic analysis
- Comprehensive documentation
- Build distributable solutions, not one-offs
- Transform personal challenges into community resources

## 📞 Support

For issues or questions:
1. Check the [User Guide](user-guide.html)
2. Review [PHASE1_SETUP.md](PHASE1_SETUP.md)
3. Check [backend/README.md](backend/README.md)

---

**Status**: Phase 1 in progress (70% complete)
**Last Updated**: 2025-11-20
**Next Milestone**: Complete Phase 1, begin Phase 2 migration system

🚀 **Building the future of Claude configuration management!**
