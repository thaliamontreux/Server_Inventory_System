
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HardDrive, Eye, Settings, Terminal } from 'lucide-react';
import { VirtualAppliance } from '@/types/infrastructure';
import { CredentialManager } from './CredentialManager';
import { NotesManager } from './NotesManager';
import { SSHLauncher } from './SSHLauncher';

interface VirtualApplianceListProps {
  searchTerm: string;
}

export const VirtualApplianceList = ({ searchTerm }: VirtualApplianceListProps) => {
  const [selectedAppliance, setSelectedAppliance] = useState<VirtualAppliance | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSSH, setShowSSH] = useState(false);

  // Mock data
  const appliances: VirtualAppliance[] = [
    {
      id: 1,
      vmwareServerId: 1,
      hostname: 'web-prod-01',
      ipAddress: '10.0.1.100',
      fqdn: 'web-prod-01.company.com',
      operatingSystem: 'Ubuntu Server',
      osVersion: '22.04 LTS',
      cpuAllocated: 4,
      ramAllocated: 8,
      diskAllocatedGb: 100,
      macAddress: '00:50:56:a1:b2:c3',
      credentials: [],
      notes: []
    },
    {
      id: 2,
      vmwareServerId: 1,
      hostname: 'db-prod-01',
      ipAddress: '10.0.1.101',
      fqdn: 'db-prod-01.company.com',
      operatingSystem: 'CentOS',
      osVersion: '8.5',
      cpuAllocated: 8,
      ramAllocated: 16,
      diskAllocatedGb: 500,
      macAddress: '00:50:56:a1:b2:c4',
      credentials: [],
      notes: []
    }
  ];

  const filteredAppliances = appliances.filter(appliance =>
    appliance.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appliance.ipAddress?.includes(searchTerm) ||
    appliance.fqdn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSSHLaunch = (appliance: VirtualAppliance) => {
    setSelectedAppliance(appliance);
    setShowSSH(true);
  };

  const handleCredentials = (appliance: VirtualAppliance) => {
    setSelectedAppliance(appliance);
    setShowCredentials(true);
  };

  const handleNotes = (appliance: VirtualAppliance) => {
    setSelectedAppliance(appliance);
    setShowNotes(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Virtual Appliances ({filteredAppliances.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hostname</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>FQDN</TableHead>
                <TableHead>Operating System</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>MAC Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppliances.map((appliance) => (
                <TableRow key={appliance.id}>
                  <TableCell className="font-medium">{appliance.hostname}</TableCell>
                  <TableCell>{appliance.ipAddress}</TableCell>
                  <TableCell>{appliance.fqdn}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {appliance.operatingSystem}
                      {appliance.osVersion && (
                        <div className="text-xs text-muted-foreground">
                          {appliance.osVersion}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{appliance.cpuAllocated} vCPU</div>
                      <div>{appliance.ramAllocated}GB RAM</div>
                      <div>{appliance.diskAllocatedGb}GB disk</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{appliance.macAddress}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSSHLaunch(appliance)}
                      >
                        <Terminal className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCredentials(appliance)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNotes(appliance)}
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

      {showSSH && selectedAppliance && (
        <SSHLauncher
          target={selectedAppliance}
          targetType="virtual_appliance"
          onClose={() => setShowSSH(false)}
        />
      )}

      {showCredentials && selectedAppliance && (
        <CredentialManager
          associatedType="virtual_appliance"
          associatedId={selectedAppliance.id}
          onClose={() => setShowCredentials(false)}
        />
      )}

      {showNotes && selectedAppliance && (
        <NotesManager
          associatedType="virtual_appliance"
          associatedId={selectedAppliance.id}
          onClose={() => setShowNotes(false)}
        />
      )}
    </>
  );
};
