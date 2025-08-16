#!/bin/bash

# Maidly.ai Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: dev, staging, production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

echo -e "${BLUE}🚀 Maidly.ai Deployment Script${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo -e "${BLUE}📦 Node.js version: ${NODE_VERSION}${NC}"

if ! node -e "process.exit(process.version.match(/v(\d+)/)[1] >= 18 ? 0 : 1)"; then
    echo -e "${RED}❌ Error: Node.js 18+ is required${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📥 Installing dependencies...${NC}"
npm ci

# Type checking
echo -e "${YELLOW}🔍 Running type checks...${NC}"
npm run type-check

# Linting
echo -e "${YELLOW}🧹 Running linter...${NC}"
npm run lint

# Build the application
echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build

# Run smoke tests
echo -e "${YELLOW}🧪 Running smoke tests...${NC}"
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test key endpoints
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Homepage test passed${NC}"
else
    echo -e "${RED}❌ Homepage test failed${NC}"
    kill $SERVER_PID
    exit 1
fi

if curl -f http://localhost:3000/demo > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Demo page test passed${NC}"
else
    echo -e "${RED}❌ Demo page test failed${NC}"
    kill $SERVER_PID
    exit 1
fi

if curl -f http://localhost:3000/api/chat -X POST -H "Content-Type: application/json" -d '{"message":"test"}' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API test passed${NC}"
else
    echo -e "${RED}❌ API test failed${NC}"
    kill $SERVER_PID
    exit 1
fi

# Stop test server
kill $SERVER_PID

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"

# Deploy based on environment
case $ENVIRONMENT in
    "dev")
        echo -e "${YELLOW}🚀 Deploying to development...${NC}"
        # Add your dev deployment commands here
        echo -e "${GREEN}✅ Development deployment complete!${NC}"
        ;;
    "staging")
        echo -e "${YELLOW}🚀 Deploying to staging...${NC}"
        # Add your staging deployment commands here
        # Example: vercel --target staging
        echo -e "${GREEN}✅ Staging deployment complete!${NC}"
        ;;
    "production")
        echo -e "${YELLOW}🚀 Deploying to production...${NC}"
        
        # Confirm production deployment
        echo -e "${RED}⚠️  You are about to deploy to PRODUCTION${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Deployment cancelled${NC}"
            exit 0
        fi
        
        # Add your production deployment commands here
        # Example: vercel --prod
        echo -e "${GREEN}✅ Production deployment complete!${NC}"
        ;;
    *)
        echo -e "${RED}❌ Unknown environment: $ENVIRONMENT${NC}"
        echo "Available environments: dev, staging, production"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo -e "${BLUE}📊 Build info:${NC}"
echo -e "  Environment: ${ENVIRONMENT}"
echo -e "  Node.js: ${NODE_VERSION}"
echo -e "  Timestamp: $(date)"
echo ""
echo -e "${BLUE}🔗 Next steps:${NC}"
echo -e "  • Monitor application logs"
echo -e "  • Run performance tests"
echo -e "  • Update documentation"
echo -e "  • Notify team of deployment"
