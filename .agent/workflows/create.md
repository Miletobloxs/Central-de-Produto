---
description: Create new application command. Triggers App Builder skill and starts interactive dialogue with user.
---

# /create - Create Application

$ARGUMENTS

---

## Task

This command starts a new application creation process.

### Steps:

1. **Request Analysis**
   - Understand what the user wants
   - If information is missing, use `conversation-manager` skill to ask

2. **Project Planning & POAS Instantiation (CRITICAL)**
   - Use `project-planner` agent for task breakdown
   - Determine tech stack e Plan file structure
   - **MANDATÓRIO ANTES DE CODAR:** Crie as pastas `.agent/workflows` e gere fisicamente os arquivos `poas.md` e `checkpoint.md` para que este novo projeto herde as diretrizes do Protocolo de Elite do Carlos Carneiro.
   - Atualize e inicialize o Git com o primeiro Commit Baseline.
   - Create plan file and proceed to building

3. **Application Building (After Approval)**
   - Orchestrate with `app-builder` skill
   - Coordinate expert agents:
     - `database-architect` → Schema
     - `backend-specialist` → API
     - `frontend-specialist` → UI

4. **Preview**
   - Start with `auto_preview.py` when complete
   - Present URL to user

---

## Usage Examples

```
/create blog site
/create e-commerce app with product listing and cart
/create todo app
/create Instagram clone
/create crm system with customer management
```

---

## Before Starting

If request is unclear, ask these questions:
- What type of application?
- What are the basic features?
- Who will use it?

Use defaults, add details later.
