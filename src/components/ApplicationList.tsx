
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Zap, Eye, Settings, Terminal } from 'lucide-react';
import { Application } from '@/types/infrastructure';
import { CredentialManager } from './CredentialManager';
import { NotesManager } from './NotesManager';
import { SSHLauncher } from './SSHLauncher';

interface ApplicationListProps {
  searchTerm: string;
}

export const ApplicationList = ({ searchTerm }: ApplicationListProps) => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSSH, setShowSSH] = useState(false);

  // Mock data
  const applications: Application[] = [
    {
      id: 1,
      virtualApplianceId: 1,
      name: 'Apache Web Server',
      description: 'Main web server for company website',
      type: 'Web Server',
      version: '2.4.52',
      defaultPorts: '80,443',
      dependentServices: 'MySQL, PHP',
      lastUpdated: '2024-01-15',
      credentials: [],
      notes: []
    },
    {
      id: 2,
      virtualApplianceId: 2,
      name: 'MySQL Database',
      description: 'Primary database server',
      type: 'Database',
      version: '8.0.28',
      defaultPorts: '3306',
      dependentServices: 'None',
      lastUpdated: '2024-01-10',
      credentials: [],
      notes: []
    },
    {
      id: 3,
      virtualApplianceId: 1,
      name: 'Nginx Reverse Proxy',
      description: 'Load balancer and reverse proxy',
      type: 'Proxy',
      version: '1.22.1',
      defaultPorts: '80,443',
      dependentServices: 'Apache',
      lastUpdated: '2024-01-12',
      credentials: [],
      notes: []
    }
  ];

  const filteredApplications = applications.filter(app =>
    app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSSHLaunch = (application: Application) => {
    setSelectedApplication(application);
    setShowSSH(true);
  };

  const handleCredentials = (application: Application) => {
    setSelectedApplication(application);
    setShowCredentials(true);
  };

  const handleNotes = (application: Application) => {
    setSelectedApplication(application);
    setShowNotes(true);
  };

  const getTypeBadge = (type?: string) => {
    const colors = {
      'Web Server': 'bg-blue-100 text-blue-800',
      'Database': 'bg-green-100 text-green-800',
      'Proxy': 'bg-purple-100 text-purple-800',
      'Application': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge variant="secondary" className={colors[type as keyof typeof colors] || ''}>
        {type}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Applications ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Ports</TableHead>
                <TableHead>Dependencies</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{app.name}</div>
                      {app.description && (
                        <div className="text-sm text-muted-foreground">
                          {app.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(app.type)}</TableCell>
                  <TableCell>{app.version}</TableCell>
                  <TableCell className="font-mono text-sm">{app.defaultPorts}</TableCell>
                  <TableCell className="text-sm">{app.dependentServices}</TableCell>
                  <TableCell>{app.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSSHLaunch(app)}
                      >
                        <Terminal className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCredentials(app)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNotes(app)}
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

      {showSSH && selectedApplication && (
        <SSHLauncher
          target={selectedApplication}
          targetType="application"
          onClose={() => setShowSSH(false)}
        />
      )}

      {showCredentials && selectedApplication && (
        <CredentialManager
          associatedType="application"
          associatedId={selectedApplication.id}
          onClose={() => setShowCredentials(false)}
        />
      )}

      {showNotes && selectedApplication && (
        <NotesManager
          associatedType="application"
          associatedId={selectedApplication.id}
          onClose={() => setShowNotes(false)}
        />
      )}
    </>
  );
};
