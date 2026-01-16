# SecureAIGateway Deployment Guide

This guide covers deploying SecureAIGateway using Docker Compose.

## Prerequisites

- **Docker**: Version 20.10 or later
- **Docker Compose**: Version 2.0 or later (included with Docker Desktop)
- **System Requirements**:
  - 2GB RAM minimum (4GB recommended)
  - 10GB disk space
  - Ports 4000 (UI/API) and 5432 (PostgreSQL) available

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/SecureAIGateway.git
cd SecureAIGateway
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp deployment/.env.example .env

# Edit .env and set your master key
# IMPORTANT: Change LITELLM_MASTER_KEY to a secure value!
```

### 3. Start Services

```bash
docker compose up -d
```

### 4. Access the UI

Open http://localhost:4000/ui in your browser.

**Default Login:**
- Username: `admin`
- Password: Your `LITELLM_MASTER_KEY` value (default: `sk-1234`)

## Configuration

### Environment Variables

See `deployment/.env.example` for all available options. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `LITELLM_MASTER_KEY` | Yes | Admin authentication key |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `STORE_MODEL_IN_DB` | No | Enable UI model management (default: True) |
| `OPENAI_API_KEY` | No | OpenAI API key |
| `ANTHROPIC_API_KEY` | No | Anthropic API key |

### Menu Configuration

Customize which menu items are visible by editing `ui/litellm-dashboard/public/menu.config.json`:

```json
{
  "menu": {
    "ai_gateway": {
      "enabled": true,
      "items": {
        "agents": { "enabled": false }  // Hide Agents menu item
      }
    }
  }
}
```

Changes take effect on page refresh (no rebuild required).

### Model Routing Configuration (Optional)

For advanced model routing, create a `config.yaml`:

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

  - model_name: claude-3
    litellm_params:
      model: anthropic/claude-3-opus-20240229
      api_key: os.environ/ANTHROPIC_API_KEY
```

Then uncomment the volume mount in `docker-compose.yml`:

```yaml
volumes:
  - ./config.yaml:/app/config.yaml
command:
  - "--config=/app/config.yaml"
```

## Production Deployment

### SSL/TLS Setup

For production, place SecureAIGateway behind a reverse proxy (nginx, Traefik, Caddy) with SSL:

```nginx
# Example nginx configuration
server {
    listen 443 ssl;
    server_name aigateway.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Database Backup

The PostgreSQL data is stored in a Docker volume. To backup:

```bash
# Create backup
docker exec aigateway_db pg_dump -U llmproxy litellm > backup.sql

# Restore from backup
docker exec -i aigateway_db psql -U llmproxy litellm < backup.sql
```

### Security Checklist

- [ ] Change `LITELLM_MASTER_KEY` to a strong, unique value
- [ ] Change PostgreSQL password in `DATABASE_URL`
- [ ] Enable SSL/TLS via reverse proxy
- [ ] Restrict network access to ports 4000 and 5432
- [ ] Set up regular database backups
- [ ] Review and disable unused menu items

## Administration

### Creating API Keys

1. Log in to the UI at http://localhost:4000/ui
2. Navigate to **Virtual Keys**
3. Click **+ Create New Key**
4. Configure key settings (team, budget, models)
5. Copy the generated API key

### Adding AI Provider Credentials

**Option 1: Environment Variables**

Add API keys to your `.env` file:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

Then restart: `docker compose restart aigateway`

**Option 2: UI Configuration**

1. Navigate to **Models + Endpoints**
2. Click **+ Add Model**
3. Select provider and enter credentials

### Viewing Logs

```bash
# All services
docker compose logs

# SecureAIGateway only
docker compose logs aigateway

# Follow logs in real-time
docker compose logs -f aigateway

# Last 100 lines
docker compose logs --tail=100 aigateway
```

## Troubleshooting

### Container Won't Start

```bash
# Check container status
docker compose ps

# View startup logs
docker compose logs aigateway

# Common issues:
# - Port 4000 already in use
# - DATABASE_URL incorrect
# - Missing required environment variables
```

### Database Connection Failed

```bash
# Verify database container is running
docker compose ps db

# Check database logs
docker compose logs db

# Test connection
docker exec aigateway_db pg_isready -U llmproxy -d litellm
```

### UI Shows "Loading..." Forever

1. Check browser console for errors (F12 → Console)
2. Verify the API is responding: `curl http://localhost:4000/health`
3. Check container logs: `docker compose logs aigateway`

### Reset to Clean State

```bash
# Stop and remove all containers and volumes
docker compose down -v

# Rebuild from scratch
docker compose build --no-cache
docker compose up -d
```

## Upgrading

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker compose build
docker compose up -d
```

## Support

- **Issues**: https://github.com/your-org/SecureAIGateway/issues
- **Documentation**: See `docs/` directory
