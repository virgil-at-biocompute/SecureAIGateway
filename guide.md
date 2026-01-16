# SecureAIGateway Quick Guide

## Deploy in 3 Steps

```bash
# 1. Configure environment
cp deployment/.env.example .env

# 2. Edit .env - set your admin key
nano .env
# Change: LITELLM_MASTER_KEY=your-secure-key-here

# 3. Start
docker compose up -d
```

**Access UI**: http://localhost:4000/ui
**Login**: `admin` / your `LITELLM_MASTER_KEY` value

---

## Add AI Providers

Edit `.env` and add your API keys:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# Azure OpenAI
AZURE_API_KEY=...
AZURE_API_BASE=https://your-resource.openai.azure.com/
AZURE_API_VERSION=2024-02-15-preview

# Google (Gemini)
GOOGLE_API_KEY=...
```

Then restart:
```bash
docker compose restart aigateway
```

Or add providers via UI: **Models + Endpoints** → **+ Add Model**

---

## Customize Menu Items

Edit `ui/litellm-dashboard/public/menu.config.json`:

```json
{
  "menu": {
    "ai_gateway": {
      "enabled": true,
      "items": {
        "agents": { "enabled": false },      // Hide Agents
        "mcp-servers": { "enabled": false }  // Hide MCP Servers
      }
    },
    "developer_tools": {
      "enabled": true,
      "items": {
        "experimental": { "enabled": false } // Hide Experimental section
      }
    }
  }
}
```

Changes apply on page refresh (no restart needed).

---

## Common Commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f aigateway

# Restart after config change
docker compose restart aigateway

# Full rebuild (after code changes)
docker compose build && docker compose up -d

# Reset everything (removes data!)
docker compose down -v
```

---

## File Locations

| File | Purpose |
|------|---------|
| `.env` | API keys and secrets |
| `ui/litellm-dashboard/public/menu.config.json` | Menu visibility |
| `config.yaml` | Advanced model routing (optional) |
| `docker-compose.yml` | Container configuration |

---

## Production Checklist

- [ ] Change `LITELLM_MASTER_KEY` to a strong value
- [ ] Change database password in `.env` (`DATABASE_URL`)
- [ ] Put behind reverse proxy with SSL (nginx/Traefik/Caddy)
- [ ] Set up database backups
- [ ] Restrict firewall access to port 4000

---

## Troubleshooting

**UI won't load?**
```bash
docker compose logs aigateway | tail -50
```

**Database connection error?**
```bash
docker compose ps  # Check if db container is running
docker compose restart db
```

**Need a fresh start?**
```bash
docker compose down -v
docker compose up -d
```
