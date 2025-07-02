
# VMware Infrastructure Management - Installation Guide

## Quick Installation for Ubuntu 24.04

This guide will help you set up the VMware Infrastructure Management application on Ubuntu 24.04 with all required dependencies.

## Prerequisites

- Ubuntu 24.04 LTS
- User account with sudo privileges
- Internet connection
- At least 2GB of available disk space

## One-Command Installation

1. **Download and run the installation script:**
   ```bash
   wget https://your-domain.com/install_ubuntu.sh
   chmod +x install_ubuntu.sh
   ./install_ubuntu.sh
   ```

   Or if you have the script locally:
   ```bash
   chmod +x install_ubuntu.sh
   ./install_ubuntu.sh
   ```

## What the Script Installs

### System Dependencies
- **Node.js 20 (LTS)** - JavaScript runtime for the application
- **npm** - Package manager for Node.js
- **MariaDB Server** - Database server
- **Nginx** - Web server and reverse proxy
- **PM2** - Process manager for Node.js applications
- **Git** - Version control (for cloning repositories)

### Application Setup
- Creates database `server_inventory_ultimate`
- Creates database user with secure random password
- Imports complete database schema with all tables
- Installs sample protocol data
- Configures environment variables
- Sets up Nginx reverse proxy
- Creates systemd service for auto-startup

## Manual Installation Steps

If you prefer to install manually, follow these steps:

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates git unzip
```

### 2. Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Install MariaDB
```bash
sudo apt install -y mariadb-server mariadb-client
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mysql_secure_installation
```

### 4. Set Up Database
```bash
sudo mysql -e "CREATE DATABASE server_inventory_ultimate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'your_secure_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON server_inventory_ultimate.* TO 'inventory_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

### 5. Import Database Schema
```bash
sudo mysql server_inventory_ultimate < database_schema.sql
```

### 6. Install Application
```bash
# Clone or copy your project files
git clone <your-repo-url> vmware-infrastructure-app
cd vmware-infrastructure-app

# Install dependencies
npm install

# Build the application
npm run build
```

### 7. Configure Environment
Create `.env.local` file:
```bash
# Database Configuration
VITE_DB_HOST=localhost
VITE_DB_PORT=3306
VITE_DB_NAME=server_inventory_ultimate
VITE_DB_USER=inventory_user
VITE_DB_PASSWORD=your_secure_password

# Application Configuration
VITE_APP_NAME="VMware Infrastructure Management"
VITE_APP_VERSION="1.0.0"
VITE_API_BASE_URL=http://localhost:5173
```

### 8. Install and Configure Nginx
```bash
sudo apt install -y nginx
```

Create Nginx configuration in `/etc/nginx/sites-available/vmware-infrastructure`:
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/vmware-infrastructure /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Access at: http://localhost:5173

### Production Mode
```bash
npm run build
npm run preview
```
Access at: http://localhost:4173 (or http://localhost via Nginx)

### Using Systemd Service
```bash
# Start the service
sudo systemctl start vmware-infrastructure

# Enable auto-start on boot
sudo systemctl enable vmware-infrastructure

# Check status
sudo systemctl status vmware-infrastructure

# View logs
sudo journalctl -u vmware-infrastructure -f
```

## Firewall Configuration

If using UFW:
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS (for future SSL setup)
sudo ufw enable
```

## Security Considerations

1. **Database Security:**
   - Use strong passwords
   - Restrict database access to localhost
   - Regularly update MariaDB

2. **Application Security:**
   - Keep `.env.local` file secure (chmod 600)
   - Use HTTPS in production
   - Regular security updates

3. **System Security:**
   - Keep Ubuntu updated
   - Use fail2ban for SSH protection
   - Configure proper firewall rules

## Troubleshooting

### Common Issues

1. **Port 80 already in use:**
   ```bash
   sudo netstat -tlnp | grep :80
   sudo systemctl stop apache2  # if Apache is running
   ```

2. **MariaDB connection issues:**
   ```bash
   sudo systemctl status mariadb
   sudo mysql -u inventory_user -p server_inventory_ultimate
   ```

3. **Node.js/npm issues:**
   ```bash
   node --version
   npm --version
   npm cache clean --force
   ```

4. **Application won't start:**
   ```bash
   sudo journalctl -u vmware-infrastructure -f
   npm run build  # Rebuild if needed
   ```

### Log Locations
- Application logs: `sudo journalctl -u vmware-infrastructure`
- Nginx logs: `/var/log/nginx/`
- MariaDB logs: `/var/log/mysql/`

## Updating the Application

1. **Stop the service:**
   ```bash
   sudo systemctl stop vmware-infrastructure
   ```

2. **Update code:**
   ```bash
   git pull origin main  # or copy new files
   npm install           # install any new dependencies
   npm run build        # rebuild application
   ```

3. **Start the service:**
   ```bash
   sudo systemctl start vmware-infrastructure
   ```

## Uninstalling

To completely remove the application:

```bash
# Stop and disable service
sudo systemctl stop vmware-infrastructure
sudo systemctl disable vmware-infrastructure
sudo rm /etc/systemd/system/vmware-infrastructure.service

# Remove Nginx configuration
sudo rm /etc/nginx/sites-enabled/vmware-infrastructure
sudo rm /etc/nginx/sites-available/vmware-infrastructure
sudo systemctl restart nginx

# Remove database
sudo mysql -e "DROP DATABASE server_inventory_ultimate;"
sudo mysql -e "DROP USER 'inventory_user'@'localhost';"

# Remove application directory
rm -rf ~/vmware-infrastructure-app
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Ensure all dependencies are properly installed
4. Verify database connectivity

## Next Steps

After installation:
1. Access the application at http://localhost
2. Begin adding your VMware infrastructure data
3. Configure user accounts and permissions
4. Set up regular database backups
5. Consider setting up SSL/HTTPS for production use
