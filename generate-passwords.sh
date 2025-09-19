#!/bin/bash

# Script to generate .htpasswd files for Factoro API Documentation
# Usage: ./generate-passwords.sh [buyer|financial_institution]
# Examples:
#   ./generate-passwords.sh buyer
#   ./generate-passwords.sh financial_institution

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo -e "${GREEN}🔐 Factoro API Documentation - Password Generator${NC}"
    echo "=================================================="
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 [USER_TYPE]"
    echo ""
    echo -e "${YELLOW}User Types:${NC}"
    echo "  buyer                 - Generate password for buyers documentation"
    echo "  financial_institution - Generate password for financial institutions documentation"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 buyer"
    echo "  $0 financial_institution"
    echo ""
    echo -e "${YELLOW}Features:${NC}"
    echo "• Appends to existing password files (doesn't overwrite)"
    echo "• Supports multiple users per user type"
    echo "• Interactive username and password entry"
    echo "• Automatic file validation"
    echo ""
}

# Check if htpasswd is available
check_dependencies() {
    if ! command -v htpasswd &> /dev/null; then
        echo -e "${RED}❌ htpasswd command not found.${NC}"
        echo ""
        echo -e "${YELLOW}Installation:${NC}"
        echo "On macOS: brew install httpd"
        echo "On Ubuntu/Debian: sudo apt-get install apache2-utils"
        echo "On CentOS/RHEL: sudo yum install httpd-tools"
        exit 1
    fi
}

# Function to add user to password file
add_user_to_file() {
    local user_type=$1
    local directory=$2
    local filename="$directory/.htpasswd"
    local display_name=$3

    # Create directory if it doesn't exist
    if [ ! -d "$directory" ]; then
        mkdir -p "$directory"
        echo -e "${BLUE}📁 Created directory: $directory${NC}"
    fi

    echo -e "${BLUE}📝 Adding user to ${display_name} documentation...${NC}"
    echo -n "Enter username: "
    read username

    # Check if username already exists in the file
    if [ -f "$filename" ] && grep -q "^$username:" "$filename"; then
        echo -e "${YELLOW}⚠️  User '$username' already exists in $filename${NC}"
        echo -n "Do you want to update the password? (y/N): "
        read update_password
        if [[ ! $update_password =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}❌ Skipping user '$username'${NC}"
            return
        fi
        # Remove existing user entry
        grep -v "^$username:" "$filename" > "$filename.tmp" && mv "$filename.tmp" "$filename"
    fi

    # Add or update the user
    if [ -f "$filename" ]; then
        # Append to existing file
        htpasswd "$filename" "$username"
        echo -e "${GREEN}✅ User '$username' added to existing $filename${NC}"
    else
        # Create new file
        htpasswd -c "$filename" "$username"
        echo -e "${GREEN}✅ New password file created: $filename${NC}"
        echo -e "${GREEN}✅ User '$username' added${NC}"
    fi

    # Show current users in file
    if [ -f "$filename" ]; then
        echo -e "${BLUE}👥 Current users in $filename:${NC}"
        cut -d: -f1 "$filename" | sed 's/^/  • /'
    fi
    echo ""
}

# Main script logic
main() {
    echo -e "${GREEN}🔐 Factoro API Documentation - Password Generator${NC}"
    echo "=================================================="
    echo ""

    # Check dependencies
    check_dependencies

    # Parse command line arguments
    if [ $# -eq 0 ]; then
        show_usage
        exit 1
    fi

    USER_TYPE=$1

    case $USER_TYPE in
        "buyer")
            add_user_to_file "buyer" "source/buyers" "Buyers"
            ;;
        "financial_institution")
            add_user_to_file "financial_institution" "source/financial_institutions" "Financial Institutions"
            ;;
        "-h"|"--help"|"help")
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid user type: $USER_TYPE${NC}"
            echo ""
            show_usage
            exit 1
            ;;
    esac

    echo -e "${GREEN}🎉 Password operation completed successfully!${NC}"
    echo ""
    echo -e "${RED}🚨 SECURITY REMINDERS:${NC}"
    echo -e "${YELLOW}• These .htpasswd files contain encrypted passwords${NC}"
    echo -e "${YELLOW}• NEVER commit them to Git/GitHub repositories${NC}"
    echo -e "${YELLOW}• They are automatically ignored by .gitignore${NC}"
    echo -e "${YELLOW}• Password files are ready for deployment${NC}"
    echo ""
    echo -e "${YELLOW}📋 Deployment Steps:${NC}"
    echo "1. Build your documentation: bundle exec middleman build --clean"
    echo "2. The .htpasswd files are automatically copied during build:"
    
    if [ "$USER_TYPE" = "buyer" ]; then
        echo "   source/buyers/.htpasswd → build/buyers/.htpasswd"
    elif [ "$USER_TYPE" = "financial_institution" ]; then
        echo "   source/financial_institutions/.htpasswd → build/financial_institutions/.htpasswd"
    fi
    
    echo "3. Upload the entire build/ directory to your web server"
    echo ""
    echo -e "${BLUE}💡 Tip: You can run this script multiple times to add more users!${NC}"
    echo -e "${GREEN}🚀 Files are now ready for seamless deployment!${NC}"
}

# Run the main function
main "$@"
