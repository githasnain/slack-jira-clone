#!/bin/bash

# Azure Production Deployment Script
# Slack-Jira Clone Project Management System

set -e

# Configuration
RESOURCE_GROUP="slack-jira-rg"
CONTAINER_GROUP="slack-jira-app"
LOCATION="eastus"
IMAGE_NAME="slack-jira-clone"
CPU_CORES="1"
MEMORY_GB="2"

echo "🚀 Starting Azure Production Deployment..."

# Check prerequisites
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it first."
    exit 1
fi

# Check Azure login
echo "🔐 Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "Please login to Azure..."
    az login
fi

# Create resource group
echo "📦 Creating resource group..."
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION \
    --output table

# Build and deploy
echo "🐳 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "🚀 Deploying to Azure Container Instances..."
az container create \
    --resource-group $RESOURCE_GROUP \
    --name $CONTAINER_GROUP \
    --image $IMAGE_NAME \
    --cpu $CPU_CORES \
    --memory $MEMORY_GB \
    --ports 3000 \
    --environment-variables \
        NODE_ENV=production \
        PORT=3000 \
        HOSTNAME=0.0.0.0 \
        DATABASE_URL="$DATABASE_URL" \
        NEXTAUTH_URL="$NEXTAUTH_URL" \
        NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
        REDIS_URL="$REDIS_URL" \
        NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
    --restart-policy Always \
    --output table

# Get deployment info
echo "🌐 Getting deployment information..."
PUBLIC_IP=$(az container show \
    --resource-group $RESOURCE_GROUP \
    --name $CONTAINER_GROUP \
    --query "ipAddress.ip" \
    --output tsv)

echo "✅ Deployment completed successfully!"
echo "🌐 Application URL: http://$PUBLIC_IP:3000"
echo "📊 Monitor logs: az container logs --resource-group $RESOURCE_GROUP --name $CONTAINER_GROUP --follow"
