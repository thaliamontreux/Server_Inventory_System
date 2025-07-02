
#!/bin/bash

# VMware Infrastructure Management - Ubuntu 24.04 Installation Script
# This script installs all dependencies and sets up the application

set -e  # Exit on any error

echo "=========================================="
echo "VMware Infrastructure Management Setup"
echo "Ubuntu 24.04 Installation Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   print_status "Please run as a regular user with sudo privileges"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates git unzip

# Install Node.js 20 (LTS)
print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node_version=$(node -v)
npm_version=$(npm -v)
print_status "Node.js version: $node_version"
print_status "npm version: $npm_version"

# Install MariaDB Server
print_status "Installing MariaDB Server..."
sudo apt install -y mariadb-server mariadb-client

# Start and enable MariaDB
print_status "Starting MariaDB service..."
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Secure MariaDB installation
print_status "Securing MariaDB installation..."
print_warning "Please follow the prompts to secure your MariaDB installation"
sudo mysql_secure_installation

# Database setup
print_status "Setting up database..."
DB_NAME="server_inventory_ultimate"
DB_USER="inventory_user"
DB_PASS=$(openssl rand -base64 32)

print_status "Creating database and user..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Create SQL schema file
print_status "Creating database schema..."
cat > database_schema.sql << 'EOF'
-- DATABASE: server_inventory_ultimate
USE server_inventory_ultimate;

-- USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email VARCHAR(255),
    role ENUM('admin', 'technician', 'viewer', 'auditor', 'devops'),
    two_factor_secret TEXT,
    job_title VARCHAR(255),
    department VARCHAR(255),
    certifications TEXT,
    on_call_status BOOLEAN,
    pager_number VARCHAR(20),
    permissions_json JSON,
    training_due_date DATE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- UNIVERSAL NOTES
CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    associated_type ENUM(
        'vmware_server', 'virtual_appliance', 'application', 'container', 'url',
        'snapshot', 'disk', 'hardware', 'network_interface', 'power_port',
        'pdu', 'ilo', 'database', 'kvm', 'firewall', 'router', 'switch'
    ),
    associated_id INT NOT NULL,
    severity ENUM('info', 'notice', 'warning', 'critical') DEFAULT 'info',
    note TEXT NOT NULL,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- PROTOCOLS
CREATE TABLE protocols (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    default_port INT,
    transport ENUM('TCP', 'UDP', 'BOTH'),
    description TEXT
);

-- CREDENTIALS
CREATE TABLE credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    associated_type ENUM('vmware_server', 'virtual_appliance', 'application', 'container', 'url'),
    associated_id INT,
    username VARCHAR(255),
    password TEXT,
    note TEXT,
    barcode_image_path TEXT,
    hidden_display BOOLEAN DEFAULT TRUE,
    port INT,
    protocol_id INT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    url TEXT,
    FOREIGN KEY (protocol_id) REFERENCES protocols(id)
);

-- CREDENTIAL HISTORY
CREATE TABLE credential_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    credential_id INT,
    changed_by INT,
    old_username VARCHAR(255),
    old_password TEXT,
    old_protocol_id INT,
    old_port INT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (credential_id) REFERENCES credentials(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- VMWARE SERVERS
CREATE TABLE vmware_servers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hostname VARCHAR(255),
    ip_address VARCHAR(45),
    location VARCHAR(255),
    datacenter VARCHAR(255),
    rack_position VARCHAR(50),
    gps_coordinates VARCHAR(100),
    vendor VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    asset_tag VARCHAR(100),
    purchase_date DATE,
    warranty_expiry DATE,
    total_cpu_cores INT,
    total_ram_gb INT,
    total_storage_tb DECIMAL(10,2),
    cpu_model VARCHAR(255),
    ilo_address VARCHAR(100),
    ilo_credentials_id INT,
    esxi_version VARCHAR(100),
    bios_version VARCHAR(100),
    firmware_date DATE,
    power_draw_watts INT,
    network_zone VARCHAR(100),
    management_vlan VARCHAR(50),
    tags JSON,
    last_audit DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ilo_credentials_id) REFERENCES credentials(id)
);

-- VIRTUAL APPLIANCES
CREATE TABLE virtual_appliances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vmware_server_id INT,
    hostname VARCHAR(255),
    ip_address VARCHAR(45),
    fqdn VARCHAR(255),
    operating_system VARCHAR(255),
    os_version VARCHAR(100),
    cpu_allocated INT,
    ram_allocated INT,
    disk_allocated_gb DECIMAL(10,2),
    mac_address VARCHAR(45),
    FOREIGN KEY (vmware_server_id) REFERENCES vmware_servers(id) ON DELETE CASCADE
);

-- APPLICATIONS
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    virtual_appliance_id INT,
    name VARCHAR(255),
    description TEXT,
    type VARCHAR(100),
    version VARCHAR(100),
    default_ports VARCHAR(50),
    dependent_services TEXT,
    last_updated DATE,
    FOREIGN KEY (virtual_appliance_id) REFERENCES virtual_appliances(id) ON DELETE CASCADE
);

-- APPLICATION URLS
CREATE TABLE app_urls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    url TEXT,
    port INT,
    protocol_id INT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (protocol_id) REFERENCES protocols(id)
);

-- CONTAINERS
CREATE TABLE containers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    virtual_appliance_id INT,
    name VARCHAR(255),
    image VARCHAR(255),
    version VARCHAR(100),
    runtime ENUM('docker', 'podman'),
    ports TEXT,
    volumes TEXT,
    environment_variables TEXT,
    FOREIGN KEY (virtual_appliance_id) REFERENCES virtual_appliances(id) ON DELETE CASCADE
);

-- NETWORK INTERFACES
CREATE TABLE network_interfaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appliance_id INT,
    interface_name VARCHAR(100),
    mac_address VARCHAR(45),
    ip_address VARCHAR(45),
    ipv6_address VARCHAR(100),
    vlan_id INT,
    mtu INT,
    link_speed VARCHAR(50),
    jumbo_frames BOOLEAN,
    bonding_group VARCHAR(100),
    interface_alias VARCHAR(100),
    FOREIGN KEY (appliance_id) REFERENCES virtual_appliances(id) ON DELETE CASCADE
);

-- STORAGE DISKS
CREATE TABLE storage_disks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appliance_id INT,
    make VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    capacity_gb DECIMAL(10,2),
    raid_level VARCHAR(10),
    smart_enabled BOOLEAN,
    date_installed DATE,
    usage_purpose VARCHAR(100),
    FOREIGN KEY (appliance_id) REFERENCES virtual_appliances(id) ON DELETE CASCADE
);

-- SNAPSHOTS
CREATE TABLE snapshots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    virtual_appliance_id INT,
    snapshot_name VARCHAR(255),
    snapshot_date DATETIME,
    snapshot_type ENUM('manual', 'scheduled'),
    FOREIGN KEY (virtual_appliance_id) REFERENCES virtual_appliances(id) ON DELETE CASCADE
);

-- PATCHES
CREATE TABLE patches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appliance_id INT,
    patch_name VARCHAR(255),
    patch_date DATE,
    tool_used VARCHAR(100),
    cve_fixed TEXT,
    FOREIGN KEY (appliance_id) REFERENCES virtual_appliances(id) ON DELETE CASCADE
);

-- POWER CONTROL
CREATE TABLE power_control (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_type ENUM('vmware_server', 'virtual_appliance'),
    asset_id INT,
    remote_boot_url TEXT,
    wol_mac_address VARCHAR(45),
    pdu_port VARCHAR(100),
    ups_linked BOOLEAN,
    estimated_draw_watts INT
);

-- ENVIRONMENTAL SENSORS
CREATE TABLE environment_sensors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(255),
    temperature_c DECIMAL(5,2),
    humidity_percent DECIMAL(5,2),
    airflow_cfm DECIMAL(5,2),
    smoke_detected BOOLEAN,
    last_updated DATETIME
);

-- HARDWARE INVENTORY
CREATE TABLE hardware_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_type VARCHAR(100),
    make VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    warranty_expiry DATE,
    asset_tag VARCHAR(100),
    rack_location VARCHAR(100),
    vendor_contact VARCHAR(255),
    shipping_tracking_number VARCHAR(100),
    invoice_number VARCHAR(100),
    documentation_url TEXT
);

-- MAINTENANCE EVENTS
CREATE TABLE maintenance_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    associated_type ENUM('vmware_server', 'virtual_appliance', 'application'),
    associated_id INT,
    event_type VARCHAR(100),
    description TEXT,
    performed_by INT,
    event_date DATETIME,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Insert some sample protocols
INSERT INTO protocols (name, default_port, transport, description) VALUES
('HTTP', 80, 'TCP', 'Hypertext Transfer Protocol'),
('HTTPS', 443, 'TCP', 'HTTP Secure'),
('SSH', 22, 'TCP', 'Secure Shell'),
('FTP', 21, 'TCP', 'File Transfer Protocol'),
('SFTP', 22, 'TCP', 'SSH File Transfer Protocol'),
('RDP', 3389, 'TCP', 'Remote Desktop Protocol'),
('VNC', 5900, 'TCP', 'Virtual Network Computing'),
('MySQL', 3306, 'TCP', 'MySQL Database'),
('PostgreSQL', 5432, 'TCP', 'PostgreSQL Database'),
('SMTP', 25, 'TCP', 'Simple Mail Transfer Protocol');

EOF

# Import the schema
print_status "Importing database schema..."
sudo mysql ${DB_NAME} < database_schema.sql

# Clone or setup project (if not already present)
if [ ! -d "vmware-infrastructure-app" ]; then
    print_status "Setting up project directory..."
    mkdir -p vmware-infrastructure-app
    cd vmware-infrastructure-app
    
    # If you have the project in a git repository, clone it:
    # git clone <your-repo-url> .
    
    print_warning "Please copy your project files to the vmware-infrastructure-app directory"
    print_warning "Or if you have a git repository, uncomment the git clone line in this script"
else
    cd vmware-infrastructure-app
fi

# Install project dependencies
if [ -f "package.json" ]; then
    print_status "Installing project dependencies..."
    npm install
else
    print_warning "package.json not found. Please ensure project files are in the current directory."
fi

# Create environment configuration file
print_status "Creating environment configuration..."
cat > .env.local << EOF
# Database Configuration
VITE_DB_HOST=localhost
VITE_DB_PORT=3306
VITE_DB_NAME=${DB_NAME}
VITE_DB_USER=${DB_USER}
VITE_DB_PASSWORD=${DB_PASS}

# Application Configuration
VITE_APP_NAME="VMware Infrastructure Management"
VITE_APP_VERSION="1.0.0"
VITE_API_BASE_URL=http://localhost:5173

# Security (generate new values for production)
VITE_JWT_SECRET=$(openssl rand -base64 64)
VITE_ENCRYPTION_KEY=$(openssl rand -base64 32)
EOF

# Set proper permissions
chmod 600 .env.local

# Install PM2 for production process management
print_status "Installing PM2 for process management..."
sudo npm install -g pm2

# Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vmware-infrastructure-app',
    script: 'npm',
    args: 'run preview',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4173
    }
  }]
};
EOF

# Install nginx for reverse proxy
print_status "Installing and configuring Nginx..."
sudo apt install -y nginx

# Create nginx configuration
sudo tee /etc/nginx/sites-available/vmware-infrastructure << 'EOF'
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/vmware-infrastructure /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall (if ufw is available)
if command -v ufw >/dev/null 2>&1; then
    print_status "Configuring firewall..."
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
fi

# Build the application
if [ -f "package.json" ]; then
    print_status "Building the application..."
    npm run build
fi

# Create systemd service for automatic startup
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/vmware-infrastructure.service << EOF
[Unit]
Description=VMware Infrastructure Management App
After=network.target mariadb.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=4173

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start the service
sudo systemctl daemon-reload
sudo systemctl enable vmware-infrastructure.service

print_status "=========================================="
print_status "Installation completed successfully!"
print_status "=========================================="
print_status ""
print_status "Database Information:"
print_status "  - Database Name: ${DB_NAME}"
print_status "  - Database User: ${DB_USER}"
print_status "  - Database Password: ${DB_PASS}"
print_status ""
print_status "Application Details:"
print_status "  - Application URL: http://localhost"
print_status "  - Direct App Port: http://localhost:4173"
print_status "  - Project Directory: $(pwd)"
print_status ""
print_status "Service Management:"
print_status "  - Start: sudo systemctl start vmware-infrastructure"
print_status "  - Stop: sudo systemctl stop vmware-infrastructure"
print_status "  - Status: sudo systemctl status vmware-infrastructure"
print_status "  - Logs: sudo journalctl -u vmware-infrastructure -f"
print_status ""
print_status "Next Steps:"
print_status "1. Copy your project files to: $(pwd)"
print_status "2. Run: npm install"
print_status "3. Run: npm run build"
print_status "4. Start the service: sudo systemctl start vmware-infrastructure"
print_status ""
print_warning "IMPORTANT: Save the database credentials shown above!"
print_warning "The .env.local file contains sensitive information - keep it secure!"

# Save credentials to a file for reference
echo "Database Credentials - $(date)" >> ~/vmware-app-credentials.txt
echo "Database Name: ${DB_NAME}" >> ~/vmware-app-credentials.txt
echo "Database User: ${DB_USER}" >> ~/vmware-app-credentials.txt
echo "Database Password: ${DB_PASS}" >> ~/vmware-app-credentials.txt
echo "----------------------------------------" >> ~/vmware-app-credentials.txt

print_status "Credentials also saved to: ~/vmware-app-credentials.txt"
