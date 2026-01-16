# Menu Items Configuration Guide

This guide explains how to enable or disable menu items in the SecureAIGateway UI.

---

## Configuration File Location

**Full path from project root:**
```
ui/litellm-dashboard/public/menu.config.json
```

**Inside Docker container (where it's mounted):**
```
/usr/lib/python3.13/site-packages/litellm/proxy/_experimental/out/menu.config.json
```

---

## How to Enable/Disable Menu Items

### Step 1: Edit the Configuration File

Open `ui/litellm-dashboard/public/menu.config.json` in any text editor.

### Step 2: Find the Menu Section to Modify

The file has this structure:
```json
{
  "menu": {
    "ai_gateway": { ... },
    "observability": { ... },
    "access_control": { ... },
    "developer_tools": { ... },
    "settings": { ... }
  }
}
```

### Step 3: Set `enabled` to `true` or `false`

- **To hide a menu section**: Set `"enabled": false` on the section
- **To hide a specific item**: Set `"enabled": false` on the item

### Step 4: Restart the Container

**Container restart is REQUIRED for changes to take effect.**

```bash
docker compose restart aigateway
```

Then refresh your browser.

---

## Examples

### Hide the Entire ACCESS CONTROL Section

```json
"access_control": {
  "enabled": false,
  "label": "ACCESS CONTROL",
  "items": {
    "users": { "enabled": false, "label": "Internal Users" },
    "teams": { "enabled": false, "label": "Teams" },
    "organizations": { "enabled": false, "label": "Organizations" },
    "budgets": { "enabled": false, "label": "Budgets" }
  }
}
```

### Hide Only the "Agents" Menu Item

```json
"ai_gateway": {
  "enabled": true,
  "label": "AI GATEWAY",
  "items": {
    "api-keys": { "enabled": true, "label": "Virtual Keys" },
    "llm-playground": { "enabled": true, "label": "Playground" },
    "models": { "enabled": true, "label": "Models + Endpoints" },
    "agents": { "enabled": false, "label": "Agents" },
    "mcp-servers": { "enabled": true, "label": "MCP Servers" },
    "guardrails": { "enabled": true, "label": "Guardrails" },
    "tools": { "enabled": true, "label": "Tools" }
  }
}
```

### Hide the Experimental Submenu

```json
"developer_tools": {
  "enabled": true,
  "label": "DEVELOPER TOOLS",
  "items": {
    "api_ref": { "enabled": true, "label": "API Reference" },
    "model-hub-table": { "enabled": true, "label": "AI Hub" },
    "experimental": {
      "enabled": false,
      "label": "Experimental",
      "items": { ... }
    }
  }
}
```

---

## Complete Menu Structure Reference

| Section | Key | Default Items |
|---------|-----|---------------|
| **AI GATEWAY** | `ai_gateway` | Virtual Keys, Playground, Models + Endpoints, Agents, MCP Servers, Guardrails, Tools |
| **OBSERVABILITY** | `observability` | Usage, Logs |
| **ACCESS CONTROL** | `access_control` | Internal Users, Teams, Organizations, Budgets |
| **DEVELOPER TOOLS** | `developer_tools` | API Reference, AI Hub, Experimental |
| **SETTINGS** | `settings` | Router Settings, Logging & Alerts, Admin Settings, Cost Tracking, UI Theme |

---

## Troubleshooting

### Changes Not Appearing?

1. **Restart the container** - This is required:
   ```bash
   docker compose restart aigateway
   ```

2. **Hard refresh your browser** - Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

3. **Check JSON syntax** - Invalid JSON will cause the config to fail silently. Validate your JSON at https://jsonlint.com/

4. **Verify volume mount** - Check that `docker-compose.yml` has this volume:
   ```yaml
   volumes:
     - ./ui/litellm-dashboard/public/menu.config.json:/usr/lib/python3.13/site-packages/litellm/proxy/_experimental/out/menu.config.json
   ```

### Verify the Config is Mounted Correctly

```bash
# Check if the file exists in the container
docker exec aigateway cat /usr/lib/python3.13/site-packages/litellm/proxy/_experimental/out/menu.config.json
```

The output should match your local file.

---

## Quick Reference

| Task | Command |
|------|---------|
| Edit config | `nano ui/litellm-dashboard/public/menu.config.json` |
| Apply changes | `docker compose restart aigateway` |
| View container config | `docker exec aigateway cat /usr/lib/python3.13/site-packages/litellm/proxy/_experimental/out/menu.config.json` |
