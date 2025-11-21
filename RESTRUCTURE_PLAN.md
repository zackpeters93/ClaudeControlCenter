# Database Restructuring Plan: MCPs vs Skills

## Problem Identified
The "Skills Library" currently stores **MCP Servers**, not Claude Skills. This is a conceptual error.

## What Are They Really?

### MCP Servers (Model Context Protocol)
- **Examples**: Desktop Commander, GitHub, Memory, Fetch, Puppeteer
- **Purpose**: Provide tools and capabilities to Claude
- **Format**: Server configurations with JSON schema
- **Storage**: Database with configuration, capabilities, tools

### Claude Skills
- **Examples**: web_research, code_review, bug_triage (from Anthropic)
- **Purpose**: Prompt templates that teach Claude workflows
- **Format**: Markdown files with instructions
- **Storage**: `.claude/skills/` directory + database metadata
- **Source**: https://github.com/anthropics/skills

## Current Database State

| Table | Records | Content | Status |
|-------|---------|---------|--------|
| `skills` | 7 | MCP servers | ❌ Wrong table |
| `mcps` | 3 | MCP servers | ✅ Correct (duplicates) |

## Restructuring Steps

### Phase 1: Migrate MCPs ✅
1. **Transform skills → mcps format**
   - Map `tools` JSON → `capabilities` array
   - Extract `toolCount` from tools array length
   - Convert schema to match `Mcp` model
2. **Migrate data** to `mcps` table
3. **Clear `skills` table** (backup first)
4. **Update UI**: Skills Library → MCP Library

### Phase 2: Update Schema for Real Skills ✅
```prisma
model Skill {
  id             String   @id @default(uuid())
  name           String   // e.g., "Web Research", "Code Review"
  slug           String   @unique // e.g., "web-research"
  description    String   // Brief description
  content        String   @db.Text // Full markdown content
  category       String   // e.g., "research", "coding", "writing"
  tags           Json     // Array of tags
  source         String   @default("manual") // 'manual', 'anthropic', 'imported'
  sourceUrl      String?  // GitHub URL if imported
  whenToUse      String?  @db.Text // When to apply this skill
  usageCount     Int      @default(0)
  isFavorite     Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### Phase 3: Import Anthropic Skills ✅
- Fetch from https://github.com/anthropics/skills
- Parse markdown files
- Store in new `skills` table
- Available skills:
  - web_research.md
  - code_review.md
  - bug_triage.md
  - creative_writing.md
  - documentation_writing.md
  - And more...

### Phase 4: Create Skills UI ✅
- New "Skills Library" page
- Shows Anthropic + custom skills
- Markdown editor for creating skills
- Preview pane
- Export to `.claude/skills/` format

### Phase 5: Import User MCPs ✅
- Integrate with https://github.com/zackpeters93/mcp-configs
- Auto-import MCP configurations
- Keep synced with repo

## File Changes Required

### Backend
- [x] Update `prisma/schema.prisma` - Modify Skill model
- [x] Create migration script `migrate-skills-to-mcps.js`
- [x] Run migration
- [x] Rename controller: `skillsController.js` can stay (for real skills later)
- [x] Update routes to separate skills from mcps

### Frontend
- [x] Rename: `pages/skills-manager.html` → `pages/mcp-library.html`
- [x] Update: `assets/js/skills-manager.js` → `assets/js/mcp-library.js`
- [x] Create NEW: `pages/skills-library.html` (for real skills)
- [x] Create NEW: `assets/js/skills-library.js`
- [x] Update navigation links

### Docker
- [x] Rebuild backend (schema changes)
- [x] Rebuild frontend (renamed files)

## Timeline

| Step | Est. Time | Priority |
|------|-----------|----------|
| 1. Schema update | 15 min | P0 |
| 2. Migration script | 20 min | P0 |
| 3. Run migration | 5 min | P0 |
| 4. Rename UI (Skills→MCPs) | 30 min | P0 |
| 5. Create Skills entity | 20 min | P1 |
| 6. Import Anthropic skills | 30 min | P1 |
| 7. Build Skills UI | 45 min | P1 |
| 8. MCP configs integration | 30 min | P2 |
| **Total** | **~3 hours** | |

## Success Criteria

- ✅ All MCP servers in `mcps` table with correct schema
- ✅ `skills` table repurposed for Claude Skills (markdown-based)
- ✅ UI renamed: "MCP Library" for server configs
- ✅ New "Skills Library" for prompt templates
- ✅ Anthropic skills imported and browsable
- ✅ Skill builder with markdown editor
- ✅ Export skills to `.claude/skills/` format

## References

### MCP Resources
- https://modelcontextprotocol.io/
- https://github.com/zackpeters93/mcp-configs (user's repo)

### Skills Resources
- https://www.claude.com/blog/skills
- https://github.com/anthropics/skills
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- https://github.com/anthropics/claude-cookbooks/tree/main/skills
- https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- https://medium.com/@meshuggah22/claude-skills-the-ai-feature-that-actually-solves-a-real-problem-c149b54b0846
- https://www.lennysnewsletter.com/p/claude-skills-explained

---

**Status**: Ready to execute
**Created**: 2025-11-20
**Next**: Update schema and create migration script
