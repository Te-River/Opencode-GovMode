#!/usr/bin/env bash
#
# Opencode Gov Mode - One-click installer for macOS/Linux
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Te-River/Opencode-GovMode/main/scripts/install.sh | bash
#
# Or run locally:
#   chmod +x install.sh && ./install.sh
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PACKAGE="@te-river/opencode-gov-mode"

echo -e "${BLUE}🏛️  Opencode Gov Mode Installer${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed.${NC}"
    echo -e "Please install Node.js ≥ 18 from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be ≥ 18. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Query actual version from npm registry
echo ""
echo -e "${YELLOW}🔍 Querying latest version from npm...${NC}"
ACTUAL_VERSION=$(npm view "$PACKAGE" version 2>/dev/null)

if [ -z "$ACTUAL_VERSION" ]; then
    echo -e "${RED}❌ Failed to query version from npm registry${NC}"
    exit 1
fi

PINNED="${PACKAGE}@${ACTUAL_VERSION}"
echo -e "${GREEN}✓ Latest version: ${ACTUAL_VERSION}${NC}"

# Install the package globally with pinned version
echo ""
echo -e "${YELLOW}📦 Installing ${PINNED}...${NC}"
npm install -g "$PINNED"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install package${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Package installed successfully${NC}"

# Find opencode config file
CONFIG_FILE=""
if [ -f "$HOME/.config/opencode/opencode.jsonc" ]; then
    CONFIG_FILE="$HOME/.config/opencode/opencode.jsonc"
elif [ -f "$HOME/.config/opencode/opencode.json" ]; then
    CONFIG_FILE="$HOME/.config/opencode/opencode.json"
elif [ -f "opencode.jsonc" ]; then
    CONFIG_FILE="opencode.jsonc"
elif [ -f "opencode.json" ]; then
    CONFIG_FILE="opencode.json"
fi

# Create config if it doesn't exist
if [ -z "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}📝 Creating opencode.jsonc in current directory...${NC}"
    cat > opencode.jsonc << EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "plugin": [
    "${PINNED}"
  ]
}
EOF
    CONFIG_FILE="opencode.jsonc"
    echo -e "${GREEN}✓ Created ${CONFIG_FILE}${NC}"
else
    echo -e "${GREEN}✓ Found config file: ${CONFIG_FILE}${NC}"
    
    # Check if plugin is already configured
    if grep -q "@te-river/opencode-gov-mode" "$CONFIG_FILE" 2>/dev/null; then
        echo -e "${YELLOW}📝 Updating plugin version to ${ACTUAL_VERSION}...${NC}"
        # Replace existing version with actual version
        sed -i.bak "s|@te-river/opencode-gov-mode@[^\"']*|${PINNED}|g" "$CONFIG_FILE"
        echo -e "${GREEN}✓ Plugin version updated${NC}"
    else
        echo -e "${YELLOW}📝 Adding plugin to ${CONFIG_FILE}...${NC}"
        
        # Backup original config
        cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
        
        # Add plugin to config
        if [[ "$CONFIG_FILE" == *.jsonc ]]; then
            sed -i.bak "s|}|, \"plugin\": [\"${PINNED}\"]\n}|" "$CONFIG_FILE"
        else
            if command -v jq &> /dev/null; then
                jq --arg p "$PINNED" '.plugin += [$p]' "$CONFIG_FILE" > "${CONFIG_FILE}.tmp" && mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"
            else
                echo -e "${YELLOW}⚠️  Please manually add the following to your ${CONFIG_FILE}:${NC}"
                echo -e "  \"plugin\": [\"${PINNED}\"]"
            fi
        fi
        
        echo -e "${GREEN}✓ Plugin added to config${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🏛️  Installation complete!${NC}"
echo -e "${GREEN}    Pinned version: ${PINNED}${NC}"
echo ""
echo -e "${BLUE}Usage:${NC}"
echo -e "  1. Restart OpenCode Desktop"
echo -e "  2. The Emperor (君主) will be your default agent"
echo -e "  3. Use slash commands to interact with the hierarchy:"
echo -e "     - ${GREEN}/gov-reign <task>${NC} — Full imperial workflow"
echo -e "     - ${GREEN}/gov-decree <task>${NC} — Issue an imperial decree"
echo -e "     - ${GREEN}/gov-report${NC} — View status report"
echo -e "     - ${GREEN}/gov-endorse <finding>${NC} — Approve/reject findings"
echo ""
echo -e "${BLUE}Agent Picker:${NC}"
echo -e "  - @monarch — Emperor (君主)"
echo -e "  - @prime-minister — Prime Minister (宰相)"
echo -e "  - @ministry-* — Six Ministries (六部)"
echo -e "  - @regional-governor — Regional Governor (地方官)"
echo -e "  - @local-official — Local Official (基层官员)"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo -e "  https://github.com/Te-River/Opencode-GovMode"
echo ""
