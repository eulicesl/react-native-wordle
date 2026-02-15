#!/bin/bash
# WordVibe - Ralphy Autonomous Development Runner
# Usage: ./run-ralphy.sh [phase]
# Phases: 1a, 1b, 2a, 2b, 3, all
#
# Prerequisites:
#   npm install -g ralphy-cli
#   Ensure ANTHROPIC_API_KEY is set
#
# Each phase runs ralphy against a specific PRD file.
# Phases must be run in order: 1a → 1b → 2a → 2b → 3

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_DIR="$SCRIPT_DIR/.ralphy/prds"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  WordVibe - Ralphy Runner${NC}"
    echo -e "${BLUE}  Phase: $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

check_prerequisites() {
    if ! command -v ralphy &> /dev/null; then
        echo -e "${RED}Error: ralphy-cli is not installed.${NC}"
        echo -e "Install with: ${YELLOW}npm install -g ralphy-cli${NC}"
        exit 1
    fi

    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed.${NC}"
        exit 1
    fi

    echo -e "${GREEN}Prerequisites OK${NC}"
}

run_phase() {
    local phase=$1
    local prd_file=$2
    local description=$3

    print_header "$description"

    if [ ! -f "$prd_file" ]; then
        echo -e "${RED}Error: PRD file not found: $prd_file${NC}"
        exit 1
    fi

    # Count remaining tasks
    local remaining
    remaining=$(grep -c '^\- \[ \]' "$prd_file" 2>/dev/null || echo "0")
    local completed
    completed=$(grep -c '^\- \[x\]' "$prd_file" 2>/dev/null || echo "0")

    echo -e "Tasks remaining: ${YELLOW}$remaining${NC}"
    echo -e "Tasks completed: ${GREEN}$completed${NC}"

    if [ "$remaining" -eq 0 ]; then
        echo -e "${GREEN}Phase $phase is already complete!${NC}"
        return 0
    fi

    echo -e "\nStarting ralphy loop...\n"

    # Run ralphy with the phase PRD
    cd "$SCRIPT_DIR"
    ralphy --prd "$prd_file"

    # Verify completion
    remaining=$(grep -c '^\- \[ \]' "$prd_file" 2>/dev/null || echo "0")
    if [ "$remaining" -eq 0 ]; then
        echo -e "\n${GREEN}Phase $phase complete!${NC}"
    else
        echo -e "\n${YELLOW}Phase $phase has $remaining tasks remaining.${NC}"
        echo -e "Run again with: ${YELLOW}./run-ralphy.sh $phase${NC}"
    fi
}

run_tests() {
    echo -e "\n${BLUE}Running tests...${NC}"
    cd "$SCRIPT_DIR"
    npm test 2>&1 || {
        echo -e "${RED}Tests failed! Fix before proceeding to next phase.${NC}"
        return 1
    }
    echo -e "${GREEN}Tests passed!${NC}"
}

run_lint() {
    echo -e "\n${BLUE}Running linter...${NC}"
    cd "$SCRIPT_DIR"
    npm run lint 2>&1 || {
        echo -e "${RED}Lint failed! Fix before proceeding to next phase.${NC}"
        return 1
    }
    echo -e "${GREEN}Lint passed!${NC}"
}

# Main
PHASE=${1:-help}

check_prerequisites

case $PHASE in
    1a)
        run_phase "1a" "$PRD_DIR/phase-1a-critical-fixes.md" "Phase 1A: Critical Bug Fixes"
        run_tests
        run_lint
        ;;
    1b)
        run_phase "1b" "$PRD_DIR/phase-1b-foundation-systems.md" "Phase 1B: Foundation Systems"
        run_tests
        run_lint
        ;;
    2a)
        run_phase "2a" "$PRD_DIR/phase-2a-game-feel.md" "Phase 2A: Game Feel & Animations"
        run_tests
        run_lint
        ;;
    2b)
        run_phase "2b" "$PRD_DIR/phase-2b-signature-features.md" "Phase 2B: Signature Features"
        run_tests
        run_lint
        ;;
    3)
        run_phase "3" "$PRD_DIR/phase-3-platform-growth.md" "Phase 3: Platform & Growth"
        run_tests
        run_lint
        ;;
    all)
        echo -e "${YELLOW}Running ALL phases sequentially. This will take a while.${NC}"
        echo -e "${YELLOW}Each phase runs tests and lint before proceeding.${NC}\n"

        run_phase "1a" "$PRD_DIR/phase-1a-critical-fixes.md" "Phase 1A: Critical Bug Fixes"
        run_tests && run_lint

        run_phase "1b" "$PRD_DIR/phase-1b-foundation-systems.md" "Phase 1B: Foundation Systems"
        run_tests && run_lint

        run_phase "2a" "$PRD_DIR/phase-2a-game-feel.md" "Phase 2A: Game Feel & Animations"
        run_tests && run_lint

        run_phase "2b" "$PRD_DIR/phase-2b-signature-features.md" "Phase 2B: Signature Features"
        run_tests && run_lint

        run_phase "3" "$PRD_DIR/phase-3-platform-growth.md" "Phase 3: Platform & Growth"
        run_tests && run_lint

        echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}  ALL PHASES COMPLETE!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        ;;
    status)
        echo -e "\n${BLUE}Phase Status:${NC}\n"
        for prd in "$PRD_DIR"/*.md; do
            name=$(basename "$prd" .md)
            remaining=$(grep -c '^\- \[ \]' "$prd" 2>/dev/null || echo "0")
            completed=$(grep -c '^\- \[x\]' "$prd" 2>/dev/null || echo "0")
            total=$((remaining + completed))
            if [ "$remaining" -eq 0 ] && [ "$total" -gt 0 ]; then
                echo -e "  ${GREEN}✓${NC} $name: $completed/$total complete"
            elif [ "$completed" -gt 0 ]; then
                echo -e "  ${YELLOW}◐${NC} $name: $completed/$total complete ($remaining remaining)"
            else
                echo -e "  ${RED}○${NC} $name: $total tasks pending"
            fi
        done
        echo ""
        ;;
    help|*)
        echo -e "\n${BLUE}WordVibe Ralphy Runner${NC}"
        echo -e "\nUsage: ./run-ralphy.sh [phase]\n"
        echo -e "Phases (must run in order):"
        echo -e "  ${YELLOW}1a${NC}     Phase 1A: Critical Bug Fixes (8 tasks)"
        echo -e "  ${YELLOW}1b${NC}     Phase 1B: Foundation Systems (6 tasks)"
        echo -e "  ${YELLOW}2a${NC}     Phase 2A: Game Feel & Animations (5 tasks)"
        echo -e "  ${YELLOW}2b${NC}     Phase 2B: Signature Features (6 tasks)"
        echo -e "  ${YELLOW}3${NC}      Phase 3: Platform & Growth (7 tasks)"
        echo -e "  ${YELLOW}all${NC}    Run all phases sequentially"
        echo -e "  ${YELLOW}status${NC} Show completion status of all phases"
        echo -e "\nExamples:"
        echo -e "  ./run-ralphy.sh 1a        # Start with critical fixes"
        echo -e "  ./run-ralphy.sh status    # Check progress"
        echo -e "  ./run-ralphy.sh all       # Run everything"
        echo ""
        ;;
esac
