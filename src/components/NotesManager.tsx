
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash, AlertTriangle, Info, AlertCircle, XCircle } from 'lucide-react';
import { Note } from '@/types/infrastructure';
import { useToast } from '@/hooks/use-toast';

interface NotesManagerProps {
  associatedType: string;
  associatedId: number;
  onClose: () => void;
}

export const NotesManager = ({ associatedType, associatedId, onClose }: NotesManagerProps) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      associatedType,
      associatedId,
      severity: 'info',
      note: 'Server was migrated from old datacenter on 2024-01-15. All services verified working.',
      createdBy: 1,
      createdAt: '2024-01-15T14:30:00Z'
    },
    {
      id: 2,
      associatedType,
      associatedId,
      severity: 'warning',
      note: 'CPU usage has been consistently high (>80%) during peak hours. Consider resource allocation review.',
      createdBy: 2,
      createdAt: '2024-01-20T09:15:00Z'
    },
    {
      id: 3,
      associatedType,
      associatedId,
      severity: 'critical',
      note: 'RAID array showing degraded status. Replacement disk ordered - ticket #12345.',
      createdBy: 1,
      createdAt: '2024-01-22T16:45:00Z'
    }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    note: '',
    severity: 'info' as 'info' | 'notice' | 'warning' | 'critical'
  });
  const { toast } = useToast();

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({ note: '', severity: 'info' });
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      note: note.note,
      severity: note.severity
    });
  };

  const handleSave = () => {
    if (isAdding) {
      const newNote: Note = {
        id: notes.length + 1,
        associatedType,
        associatedId,
        severity: formData.severity,
        note: formData.note,
        createdBy: 1, // Mock current user ID
        createdAt: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
      toast({
        title: "Note Added",
        description: "New note has been saved successfully."
      });
    } else if (editingNote) {
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, note: formData.note, severity: formData.severity }
          : note
      ));
      toast({
        title: "Note Updated",
        description: "Note has been updated successfully."
      });
    }
    
    setIsAdding(false);
    setEditingNote(null);
  };

  const handleDelete = (noteId: number) => {
    setNotes(notes.filter(note => note.id !== noteId));
    toast({
      title: "Note Deleted",
      description: "Note has been removed successfully."
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingNote(null);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'notice':
        return <AlertCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      info: 'bg-blue-100 text-blue-800',
      notice: 'bg-green-100 text-green-800', 
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge variant="secondary" className={variants[severity as keyof typeof variants]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notes Management</DialogTitle>
          <DialogDescription>
            Manage notes for {associatedType.replace('_', ' ')} (ID: {associatedId})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add/Edit Form */}
          {(isAdding || editingNote) && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">
                {isAdding ? 'Add New Note' : 'Edit Note'}
              </h3>
              
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select value={formData.severity} onValueChange={(value: any) => setFormData({ ...formData, severity: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="notice">Notice</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Enter your note here..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Notes ({notes.length})</h3>
              <Button onClick={handleAdd} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>

            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(note.severity)}
                      {getSeverityBadge(note.severity)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-2">{note.note}</p>
                  
                  <div className="text-xs text-muted-foreground">
                    Created on {new Date(note.createdAt).toLocaleString()}
                    {note.createdBy && ` by User ${note.createdBy}`}
                  </div>
                </div>
              ))}
              
              {notes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No notes found. Click "Add Note" to create the first one.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
