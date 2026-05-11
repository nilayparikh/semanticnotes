# SemanticNotes.ai — Skills Registry

> **Central index of all agent skills available in this workspace.**
> This file maps skills to their sources and usage patterns.

---

## 📦 Installed Skills

### React & UI Skills (from vercel-labs/agent-skills)

| Skill                           | Source                   | Purpose                         |
| ------------------------------- | ------------------------ | ------------------------------- |
| `vercel-react-best-practices`   | vercel-labs/agent-skills | 69 React performance rules      |
| `vercel-composition-patterns`   | vercel-labs/agent-skills | Component architecture patterns |
| `web-design-guidelines`         | vercel-labs/agent-skills | UI/UX compliance audit          |
| `vercel-react-view-transitions` | vercel-labs/agent-skills | React View Transition API       |
| `vercel-react-native-skills`    | vercel-labs/agent-skills | React Native guidelines         |

### Testing & TDD Skills (from obra/superpowers)

| Skill                            | Source           | Purpose                          |
| -------------------------------- | ---------------- | -------------------------------- |
| `test-driven-development`        | obra/superpowers | TDD workflow enforcement         |
| `verification-before-completion` | obra/superpowers | Evidence-based completion checks |
| `systematic-debugging`           | obra/superpowers | Structured debugging process     |
| `writing-plans`                  | obra/superpowers | Planning methodology             |
| `executing-plans`                | obra/superpowers | Plan execution workflow          |
| `brainstorming`                  | obra/superpowers | Creative problem solving         |

### Project-Specific Skills (Custom)

| Skill                     | Location        | Purpose                          |
| ------------------------- | --------------- | -------------------------------- |
| `documentation-authoring` | .github/skills/ | Markdown documentation standards |
| `ui-layout-integration`   | .github/skills/ | Tailwind CSS layout patterns     |
| `typescript-react-audit`  | .github/skills/ | TypeScript/React type auditing   |
| `wasm-sqlite-validation`  | .github/skills/ | WASM/SQLite validation patterns  |

---

## 🗂️ Skill Locations

### Official Skills (Installed via `npx skills add`)

```
.agents/skills/
├── vercel-react-best-practices/
├── vercel-composition-patterns/
├── web-design-guidelines/
├── test-driven-development/
├── verification-before-completion/
└── ... (other installed skills)
```

### Project-Specific Skills

```
.github/skills/
├── documentation-authoring/
├── ui-layout-integration/
├── typescript-react-audit/
└── wasm-sqlite-validation/
```

---

## 🔧 Installation Commands

### Install React Skills

```bash
npx skills add vercel-labs/agent-skills
```

### Install TDD Skills

```bash
npx skills add obra/superpowers
```

### Install Playwright Skills (Optional)

```bash
npx skills add currents-dev/playwright-best-practices-skill
npx skills add microsoft/playwright-cli
```

---

## 📖 Skill Usage Patterns

### When to Use Each Skill

| Scenario                 | Primary Skill               | How to Trigger            |
| ------------------------ | --------------------------- | ------------------------- |
| Writing React components | vercel-react-best-practices | "Optimize this component" |
| Building test suite      | test-driven-development     | "Implement this feature"  |
| Reviewing UI             | web-design-guidelines       | "Audit my UI"             |
| TypeScript types         | typescript-react-audit      | "Check types"             |
| Database schema          | wasm-sqlite-validation      | "Validate SQLite"         |
| Documentation            | documentation-authoring     | "Document this feature"   |

---

## 🔄 Skill Update Workflow

### Check for Updates

```bash
# List installed skills
ls .agents/skills/
ls .github/skills/

# Update specific skill
npx skills update vercel-labs/agent-skills
```

### Install New Skill

```bash
# Discover skills
npx skills search "typescript"

# Install skill
npx skills add owner/repo-name
```

---

## 🔍 Skill Discovery

### Search for Skills

- **Official Skills Hub**: https://skills.sh/official
- **Browse by Topic**: https://skills.sh/topic/react
- **CLI Search**: `npx skills search <keyword>`

### Recommended Skills for SemanticNotes.ai

| Category           | Skill                       | Repository                                   |
| ------------------ | --------------------------- | -------------------------------------------- |
| React Performance  | vercel-react-best-practices | vercel-labs/agent-skills                     |
| TDD Workflow       | test-driven-development     | obra/superpowers                             |
| Playwright Testing | playwright-best-practices   | currents-dev/playwright-best-practices-skill |
| TypeScript Types   | typescript-advanced-types   | wshobson/agents                              |
| Tailwind Design    | tailwind-design-system      | wshobson/agents                              |

---

## 📝 Notes

- Skills installed via `npx skills add` go to `.agents/skills/`
- Custom project skills live in `.github/skills/`
- GitHub Copilot discovers both locations automatically
- Skills are loaded contextually based on task description
