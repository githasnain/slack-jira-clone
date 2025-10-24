#!/bin/bash

# Azure Container Instance Deployment Script
# For Slack-Jira Clone Application

set -e

# Configuration
RESOURCE_GROUP="slack-jira-rg"
CONTAINER_NAME="slack-jira-app"
IMAGE_NAME="slack-jira-clone"
LOCATION="eastus"
CPU_CORES="1"
MEMORY_GB="2"

echo "🚀 Starting Azure deployment for Slack-Jira Clone..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    exit 1
fi

# Login to Azure (if not already logged in)
echo "🔐 Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "Please login to Azure..."
    az login
fi

# Create resource group if it doesn't exist
echo "📦 Creating resource group..."
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION \
    --output table

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t $IMAGE_NAME .

# Tag image for Azure Container Registry (optional)
echo "🏷️ Tagging image..."
docker tag $IMAGE_NAME $IMAGE_NAME:latest

# Deploy to Azure Container Instances
echo "🚀 Deploying to Azure Container Instances..."
az container create \
    --resource-group $RESOURCE_GROUP \
    --name $CONTAINER_NAME \
    --image $IMAGE_NAME \
    --cpu $CPU_CORES \
    --memory $MEMORY_GB \
    --ports 3000 \
    --environment-variables \
        NODE_ENV=production \
        PORT=3000 \
        HOSTNAME=0.0.0.0 \
    --restart-policy Always \
    --output table

# Get the public IP
echo "🌐 Getting public IP address..."
PUBLIC_IP=$(az container show \
    --resource-group $RESOURCE_GROUP \
    --name $CONTAINER_NAME \
    --query "ipAddress.ip" \
    --output tsv)

echo "✅ Deployment completed!"
echo "🌐 Your application is available at: http://$PUBLIC_IP:3000"
echo "📊 Monitor your container: az container logs --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME --follow"