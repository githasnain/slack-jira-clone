# Azure Server Deployment Guide
## Slack-Jira Clone Application

### Prerequisites
- Azure CLI installed
- Docker installed
- Azure account with active subscription

### Step-by-Step Deployment

#### 1. Prepare Your Environment
```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "your-subscription-id"

# Create resource group
az group create --name slack-jira-rg --location eastus
```

#### 2. Build and Push Docker Image
```bash
# Build the Docker image
docker build -t slack-jira-clone .

# Tag for Azure Container Registry (optional)
docker tag slack-jira-clone slack-jira-clone:latest
```

#### 3. Deploy to Azure Container Instances

**Option A: Using Azure CLI (Recommended)**
```bash
az container create \
  --resource-group slack-jira-rg \
  --name slack-jira-app \
  --image slack-jira-clone \
  --cpu 1 \
  --memory 2 \
  --ports 3000 \
  --environment-variables \
    NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL="your-database-connection-string" \
    NEXTAUTH_SECRET="your-nextauth-secret" \
    NEXTAUTH_URL="https://your-app.azurecontainer.io" \
  --restart-policy Always
```

**Option B: Using YAML Configuration**
```bash
# Deploy using the YAML file
az container create --resource-group slack-jira-rg --file azure-deployment.yml
```

#### 4. Get Application URL
```bash
# Get the public IP
az container show \
  --resource-group slack-jira-rg \
  --name slack-jira-app \
  --query "ipAddress.ip" \
  --output tsv
```

#### 5. Monitor Your Application
```bash
# View logs
az container logs --resource-group slack-jira-rg --name slack-jira-app --follow

# Check status
az container show --resource-group slack-jira-rg --name slack-jira-app
```

### Environment Variables Required
- `DATABASE_URL`: Your database connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Your application URL
- `NODE_ENV`: Set to "production"

### Cost Optimization
- Use Azure Container Instances for small to medium workloads
- Consider Azure App Service for larger applications
- Monitor usage with Azure Cost Management

### Security Best Practices
- Use Azure Key Vault for sensitive environment variables
- Enable HTTPS with SSL certificates
- Configure network security groups
- Regular security updates

### Troubleshooting
- Check container logs: `az container logs --resource-group slack-jira-rg --name slack-jira-app`
- Verify environment variables are set correctly
- Ensure database connectivity
- Check health endpoint: `http://your-ip:3000/api/health`