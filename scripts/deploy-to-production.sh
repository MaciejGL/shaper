#!/bin/bash

# Deploy to Production Script
# Stashes changes, merges staging to main, then returns to original branch

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploy to Production${NC}\n"

# Save current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  git stash push -m "Auto-stash before production deployment" -q
  STASHED=true
else
  STASHED=false
fi

# Checkout staging and pull latest
git checkout staging -q
git pull origin staging -q

# Checkout main and pull latest
git checkout main -q
git pull origin main -q

# Show what will be deployed
echo -e "${YELLOW}📋 Changes to be deployed:${NC}\n"
git --no-pager log main..staging --oneline --no-decorate --color=always

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Ask for confirmation
read -p "Deploy these changes to production? (Y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
  echo -e "${RED}❌ Deployment cancelled${NC}"
  git checkout "$CURRENT_BRANCH" -q
  if [ "$STASHED" = true ]; then
    git stash pop -q
  fi
  exit 1
fi

# Merge staging into main
git merge staging --no-edit -q

# Push to production
git push origin main -q

echo -e "\n${GREEN}✅ Deployed to production!${NC}"

# Return to original branch
git checkout "$CURRENT_BRANCH" -q

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
  git stash pop -q
fi

echo -e "${GREEN}✨ Done${NC}"

