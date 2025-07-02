
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Terminal, Copy, ExternalLink } from 'lucide-react';
import { Credential, VMwareServer, VirtualAppliance, Application } from '@/types/infrastructure';
import { useToast } from '@/hooks/use-toast';

interface SSHLauncherProps {
  target: VMwareServer | VirtualAppliance | Application;
  targetType: 'vmware_server' | 'virtual_appliance' | 'application';
  onClose: () => void;
}

export const SSHLauncher = ({ target, targetType, onClose }: SSHLauncherProps) => {
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [customCredentials, setCustomCredentials] = useState({
    username: '',
    password: '',
    port: 22
  });
  const [useCustomCredentials, setUseCustomCredentials] = useState(false);
  const [sshCommand, setSshCommand] = useState('');
  const { toast } = useToast();

  // Mock credentials for demonstration
  const availableCredentials: Credential[] = [
    {
      id: 1,
      associatedType: targetType,
      associatedId: target.id,
      username: 'admin',
      password: 'SecurePassword123!',
      note: 'Primary admin account',
      hiddenDisplay: true,
      port: 22,
      url: '',
      lastUpdated: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      associatedType: targetType,
      associatedId: target.id,
      username: 'service',
      password: 'ServiceAccount456!',
      note: 'Service account for maintenance',
      hiddenDisplay: true,
      port: 22,
      url: '',
      lastUpdated: '2024-01-10T10:00:00Z'
    }
  ];

  const getTargetIP = () => {
    if ('ipAddress' in target) {
      return target.ipAddress;
    }
    return '';
  };

  const getTargetHostname = () => {
    if ('hostname' in target) {
      return target.hostname;
    }
    return '';
  };

  useEffect(() => {
    generateSSHCommand();
  }, [selectedCredential, customCredentials, useCustomCredentials]);

  const generateSSHCommand = () => {
    const ip = getTargetIP();
    const hostname = getTargetHostname();
    const target_address = ip || hostname || 'unknown';
    
    if (useCustomCredentials) {
      if (customCredentials.username) {
        setSshCommand(`ssh ${customCredentials.username}@${target_address} -p ${customCredentials.port}`);
      } else {
        setSshCommand(`ssh ${target_address} -p ${customCredentials.port}`);
      }
    } else if (selectedCredential) {
      setSshCommand(`ssh ${selectedCredential.username}@${target_address} -p ${selectedCredential.port}`);
    } else {
      setSshCommand(`ssh ${target_address}`);
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(sshCommand);
    toast({
      title: "Command Copied",
      description: "SSH command has been copied to clipboard."
    });
  };

  const handleCopyPassword = () => {
    const password = useCustomCredentials 
      ? customCredentials.password 
      : selectedCredential?.password || '';
    
    if (password) {
      navigator.clipboard.writeText(password);
      toast({
        title: "Password Copied",
        description: "Password has been copied to clipboard."
      });
    }
  };

  const handleLaunchSSH = () => {
    // In a real application, this would integrate with a terminal emulator
    // or launch the system's SSH client
    const url = `ssh://${useCustomCredentials ? customCredentials.username : selectedCredential?.username}@${getTargetIP()}:${useCustomCredentials ? customCredentials.port : selectedCredential?.port}`;
    
    toast({
      title: "SSH Session",
      description: "In a real application, this would launch your SSH client."
    });
    
    // For demonstration, we'll just show the command
    console.log('Would launch SSH with:', sshCommand);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            SSH Connection Launcher
          </DialogTitle>
          <DialogDescription>
            Connect to {getTargetHostname() || getTargetIP()} ({targetType.replace('_', ' ')})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Target Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Target Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Hostname:</span>
                <span className="ml-2">{getTargetHostname() || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">IP Address:</span>
                <span className="ml-2">{getTargetIP() || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Credential Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant={!useCustomCredentials ? "default" : "outline"}
                onClick={() => setUseCustomCredentials(false)}
                size="sm"
              >
                Use Saved Credentials
              </Button>
              <Button
                variant={useCustomCredentials ? "default" : "outline"}
                onClick={() => setUseCustomCredentials(true)}
                size="sm"
              >
                Use Custom Credentials
              </Button>
            </div>

            {!useCustomCredentials ? (
              <div>
                <Label htmlFor="credential">Select Credential</Label>
                <Select onValueChange={(value) => {
                  const cred = availableCredentials.find(c => c.id.toString() === value);
                  setSelectedCredential(cred || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a saved credential" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCredentials.map((cred) => (
                      <SelectItem key={cred.id} value={cred.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{cred.username}</span>
                          {cred.note && <Badge variant="secondary" className="text-xs">{cred.note}</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="custom-username">Username</Label>
                  <Input
                    id="custom-username"
                    value={customCredentials.username}
                    onChange={(e) => setCustomCredentials({
                      ...customCredentials,
                      username: e.target.value
                    })}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-password">Password</Label>
                  <Input
                    id="custom-password"
                    type="password"
                    value={customCredentials.password}
                    onChange={(e) => setCustomCredentials({
                      ...customCredentials,
                      password: e.target.value
                    })}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-port">Port</Label>
                  <Input
                    id="custom-port"
                    type="number"
                    value={customCredentials.port}
                    onChange={(e) => setCustomCredentials({
                      ...customCredentials,
                      port: parseInt(e.target.value) || 22
                    })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SSH Command Preview */}
          <div className="space-y-2">
            <Label>SSH Command</Label>
            <div className="flex items-center gap-2">
              <Input
                value={sshCommand}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCommand}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Password Display */}
          {(selectedCredential || (useCustomCredentials && customCredentials.password)) && (
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex items-center gap-2">
                <Input
                  value="••••••••••••"
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPassword}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click copy to get the actual password
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button onClick={handleLaunchSSH}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Launch SSH
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
