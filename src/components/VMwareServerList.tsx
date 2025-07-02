
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Server, Eye, Settings, Terminal } from 'lucide-react';
import { VMwareServer } from '@/types/infrastructure';
import { CredentialManager } from './CredentialManager';
import { NotesManager } from './NotesManager';
import { SSHLauncher } from './SSHLauncher';

interface VMwareServerListProps {
  searchTerm: string;
}

export const VMwareServerList = ({ searchTerm }: VMwareServerListProps) => {
  const [selectedServer, setSelectedServer] = useState<VMwareServer | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSSH, setShowSSH] = useState(false);

  // Mock data - in real app this would come from API
  const servers: VMwareServer[] = [
    {
      id: 1,
      hostname: 'esxi-prod-01',
      ipAddress: '192.168.1.10',
      location: 'Datacenter A - Rack 12',
      datacenter: 'Primary DC',
      vendor: 'Dell',
      model: 'PowerEdge R740',
      serialNumber: 'DL001234',
      totalCpuCores: 32,
      totalRamGb: 256,
      totalStorageTb: 2.0,
      esxiVersion: '7.0.3',
      networkZone: 'Production',
      createdAt: '2024-01-15T10:00:00Z',
      credentials: [],
      notes: []
    },
    {
      id: 2,
      hostname: 'esxi-dev-01',
      ipAddress: '192.168.1.11',
      location: 'Datacenter A - Rack 13',
      datacenter: 'Primary DC',
      vendor: 'HPE',
      model: 'ProLiant DL380',
      serialNumber: 'HP001234',
      totalCpuCores: 24,
      totalRamGb: 128,
      totalStorageTb: 1.5,
      esxiVersion: '7.0.2',
      networkZone: 'Development',
      createdAt: '2024-01-16T10:00:00Z',
      credentials: [],
      notes: []
    }
  ];

  const filteredServers = servers.filter(server =>
    server.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.ipAddress?.includes(searchTerm) ||
    server.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSSHLaunch = (server: VMwareServer) => {
    setSelectedServer(server);
    setShowSSH(true);
  };

  const handleCredentials = (server: VMwareServer) => {
    setSelectedServer(server);
    setShowCredentials(true);
  };

  const handleNotes = (server: VMwareServer) => {
    setSelectedServer(server);
    setShowNotes(true);
  };

  const getStatusBadge = (server: VMwareServer) => {
    // Mock status logic
    return <Badge variant="default">Online</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            VMware Servers ({filteredServers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hostname</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Hardware</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>ESXi Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium">{server.hostname}</TableCell>
                  <TableCell>{server.ipAddress}</TableCell>
                  <TableCell>{server.location}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {server.vendor} {server.model}
                      {server.serialNumber && (
                        <div className="text-xs text-muted-foreground">
                          SN: {server.serialNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{server.totalCpuCores} cores</div>
                      <div>{server.totalRamGb}GB RAM</div>
                      <div>{server.totalStorageTb}TB storage</div>
                    </div>
                  </TableCell>
                  <TableCell>{server.esxiVersion}</TableCell>
                  <TableCell>{getStatusBadge(server)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSSHLaunch(server)}
                      >
                        <Terminal className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCredentials(server)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNotes(server)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showSSH && selectedServer && (
        <SSHLauncher
          target={selectedServer}
          targetType="vmware_server"
          onClose={() => setShowSSH(false)}
        />
      )}

      {showCredentials && selectedServer && (
        <CredentialManager
          associatedType="vmware_server"
          associatedId={selectedServer.id}
          onClose={() => setShowCredentials(false)}
        />
      )}

      {showNotes && selectedServer && (
        <NotesManager
          associatedType="vmware_server"
          associatedId={selectedServer.id}
          onClose={() => setShowNotes(false)}
        />
      )}
    </>
  );
};
