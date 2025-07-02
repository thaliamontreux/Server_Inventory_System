
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, EyeOff, Plus, Edit, Trash } from 'lucide-react';
import { Credential } from '@/types/infrastructure';
import { useToast } from '@/hooks/use-toast';

interface CredentialManagerProps {
  associatedType: 'vmware_server' | 'virtual_appliance' | 'application' | 'container' | 'url';
  associatedId: number;
  onClose: () => void;
}

export const CredentialManager = ({ associatedType, associatedId, onClose }: CredentialManagerProps) => {
  const [credentials, setCredentials] = useState<Credential[]>([
    {
      id: 1,
      associatedType,
      associatedId,
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
      associatedType,
      associatedId,
      username: 'backup',
      password: 'BackupPass456!',
      note: 'Backup service account',
      hiddenDisplay: true,
      port: 22,
      url: '',
      lastUpdated: '2024-01-10T10:00:00Z'
    }
  ]);

  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({});
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    note: '',
    port: 22,
    url: ''
  });

  const togglePasswordVisibility = (credId: number) => {
    setShowPassword(prev => ({
      ...prev,
      [credId]: !prev[credId]
    }));
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      username: '',
      password: '',
      note: '',
      port: 22,
      url: ''
    });
  };

  const handleEdit = (credential: Credential) => {
    setEditingCredential(credential);
    setFormData({
      username: credential.username || '',
      password: credential.password || '',
      note: credential.note || '',
      port: credential.port || 22,
      url: credential.url || ''
    });
  };

  const handleSave = () => {
    if (isAdding) {
      const newCredential: Credential = {
        id: credentials.length + 1,
        associatedType,
        associatedId,
        username: formData.username,
        password: formData.password,
        note: formData.note,
        port: formData.port,
        url: formData.url,
        hiddenDisplay: true,
        lastUpdated: new Date().toISOString()
      };
      setCredentials([...credentials, newCredential]);
      toast({
        title: "Credential Added",
        description: "New credential has been saved successfully."
      });
    } else if (editingCredential) {
      setCredentials(credentials.map(cred => 
        cred.id === editingCredential.id 
          ? { ...cred, ...formData, lastUpdated: new Date().toISOString() }
          : cred
      ));
      toast({
        title: "Credential Updated",
        description: "Credential has been updated successfully."
      });
    }
    
    setIsAdding(false);
    setEditingCredential(null);
  };

  const handleDelete = (credId: number) => {
    setCredentials(credentials.filter(cred => cred.id !== credId));
    toast({
      title: "Credential Deleted",
      description: "Credential has been removed successfully."
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingCredential(null);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Credential Management</DialogTitle>
          <DialogDescription>
            Manage credentials for {associatedType.replace('_', ' ')} (ID: {associatedId})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add/Edit Form */}
          {(isAdding || editingCredential) && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">
                {isAdding ? 'Add New Credential' : 'Edit Credential'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 22 })}
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL (optional)</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Add any relevant notes about this credential..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Credentials List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Existing Credentials</h3>
              <Button onClick={handleAdd} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Credential
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Port</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.map((credential) => (
                  <TableRow key={credential.id}>
                    <TableCell className="font-medium">{credential.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {showPassword[credential.id] 
                            ? credential.password 
                            : '••••••••••••'
                          }
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(credential.id)}
                        >
                          {showPassword[credential.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{credential.port}</TableCell>
                    <TableCell>{credential.url || '-'}</TableCell>
                    <TableCell>{credential.note || '-'}</TableCell>
                    <TableCell>
                      {new Date(credential.lastUpdated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(credential)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(credential.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
