import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Plus, Save, FileText, Trash2, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Child {
  id: string;
  name: string;
  age: number;
  level: number;
  points: number;
  parent_id: string;
}

interface ThoughtLog {
  id: string;
  feeling: string;
  trigger_situation: string;
  automatic_thought: string;
  thinking_trap: string;
  better_thought: string;
}

interface SessionNote {
  id: string;
  admin_id: string;
  child_id: string;
  session_date: string;
  free_notes: string | null;
  thought_logs: ThoughtLog[];
  thoughts: string[];
  emotions: string[];
  body_responses: string[];
  actions: string[];
  created_at: string;
  updated_at: string;
}

interface SessionNotesProps {
  child: Child;
}

const THINKING_TRAPS = [
  'Black & White Thinking (All good or all bad)',
  'Mind Reading (Thinking you know what others think)',
  'Fortune Telling (Predicting bad things will happen)',
  'Emotional Reasoning (If I feel it, it must be true)',
  'Should Statements (I should, I must, I have to)',
  'Labeling (I am stupid, I am worthless)',
  'Magnifying (Making problems bigger than they are)',
  'Mental Filter (Only focusing on negative things)',
  'Blaming Yourself (Everything is my fault)',
  'Blaming Others (It\'s all their fault)'
];

const EXAMPLE_THOUGHTS = [
  'Everyone is watching me',
  'I\'m going to mess up',
  'They think I\'m weird',
  'I can\'t do anything right',
  'This is too hard',
  'Nobody likes me',
  'I\'m not good enough',
  'Something bad will happen'
];

const FEELING_OPTIONS = [
  'Fear',
  'Frozen', 
  'Angry',
  'Upset',
  'Sad',
  'Low energy',
  'Excited',
  'Happy',
  'Proud',
  'Disappointed',
  'Scared',
  'Confused',
  'Doubt'
];

const EXAMPLE_BODY_RESPONSES = [
  'Heart beating fast',
  'Sweaty hands',
  'Butterflies in stomach',
  'Tight chest',
  'Shaky hands',
  'Hot face',
  'Tense muscles',
  'Headache',
  'Feeling sick',
  'Can\'t sit still'
];

const EXAMPLE_ACTIONS = [
  'Avoided the situation',
  'Asked for help',
  'Took deep breaths',
  'Talked to someone',
  'Walked away',
  'Tried anyway',
  'Made a plan',
  'Practiced first',
  'Used coping skills',
  'Got extra support'
];

export default function SessionNotes({ child }: SessionNotesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    noteId: string | null;
  }>({ open: false, noteId: null });
  
  const [formData, setFormData] = useState({
    session_date: format(new Date(), 'yyyy-MM-dd'),
    session_number: '',
    free_notes: '',
    thought_logs: [{
      id: crypto.randomUUID(),
      feeling: '',
      trigger_situation: '',
      automatic_thought: '',
      thinking_trap: '',
      better_thought: ''
    }],
    thoughts: [] as string[],
    emotions: [] as string[],
    body_responses: [] as string[],
    actions: [] as string[]
  });

  useEffect(() => {
    loadSessionNotes();
  }, [child.id]);

  const loadSessionNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('session_notes')
        .select('*')
        .eq('child_id', child.id)
        .order('session_date', { ascending: false });

      if (error) throw error;
      
      // Parse the JSON fields and convert to our expected format
      const parsedNotes = (data || []).map(note => ({
        ...note,
        thought_logs: note.trigger_situation ? [{
          id: crypto.randomUUID(),
          feeling: '',
          trigger_situation: note.trigger_situation || '',
          automatic_thought: note.automatic_thought || '',
          thinking_trap: note.cognitive_distortion || '',
          better_thought: note.alternative_thought || ''
        }] : [],
        thoughts: [],
        emotions: [],
        body_responses: [],
        actions: []
      }));
      
      setSessionNotes(parsedNotes);
    } catch (error) {
      console.error('Error loading session notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session notes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // For now, save the first thought log in the original format
      const firstLog = formData.thought_logs[0] || {
        trigger_situation: '',
        automatic_thought: '',
        thinking_trap: '',
        better_thought: ''
      };
      
      const { error } = await supabase
        .from('session_notes')
        .insert({
          admin_id: user.id,
          child_id: child.id,
          session_date: formData.session_date,
          free_notes: formData.free_notes || null,
          trigger_situation: firstLog.trigger_situation || null,
          automatic_thought: firstLog.automatic_thought || null,
          cognitive_distortion: firstLog.thinking_trap || null,
          alternative_thought: firstLog.better_thought || null
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Session note saved successfully'
      });

      // Reset form and reload data
      setFormData({
        session_date: format(new Date(), 'yyyy-MM-dd'),
        session_number: '',
        free_notes: '',
        thought_logs: [{
          id: crypto.randomUUID(),
          feeling: '',
          trigger_situation: '',
          automatic_thought: '',
          thinking_trap: '',
          better_thought: ''
        }],
        thoughts: [],
        emotions: [],
        body_responses: [],
        actions: []
      });
      setShowNewForm(false);
      await loadSessionNotes();
    } catch (error) {
      console.error('Error saving session note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save session note',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('session_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Session note deleted successfully'
      });

      await loadSessionNotes();
    } catch (error) {
      console.error('Error deleting session note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete session note',
        variant: 'destructive'
      });
    }
  };

  const addThoughtLog = () => {
    setFormData(prev => ({
      ...prev,
      thought_logs: [...prev.thought_logs, {
        id: crypto.randomUUID(),
        feeling: '',
        trigger_situation: '',
        automatic_thought: '',
        thinking_trap: '',
        better_thought: ''
      }]
    }));
  };

  const removeThoughtLog = (logId: string) => {
    setFormData(prev => ({
      ...prev,
      thought_logs: prev.thought_logs.filter(log => log.id !== logId)
    }));
  };

  const updateThoughtLog = (logId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      thought_logs: prev.thought_logs.map(log =>
        log.id === logId ? { ...log, [field]: value } : log
      )
    }));
  };

  const toggleArrayValue = (arrayName: 'thoughts' | 'emotions' | 'body_responses' | 'actions', value: string) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].includes(value)
        ? prev[arrayName].filter(item => item !== value)
        : [...prev[arrayName], value]
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading session notes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Session Notes</h2>
          <p className="text-muted-foreground">Notes and thinking skills for {child.name}</p>
        </div>
        <Button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Session Note
        </Button>
      </div>

      {/* New Session Form */}
      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Session Note</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Session Date and Number */}
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="session_date">Session Date</Label>
                  <Input
                    id="session_date"
                    type="date"
                    value={formData.session_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, session_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor="session_number">Session #</Label>
                  <Input
                    id="session_number"
                    type="number"
                    placeholder="1"
                    value={formData.session_number || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, session_number: e.target.value }))}
                  />
                </div>
              </div>

              {/* Free Notes */}
              <div className="space-y-2">
                <Label htmlFor="free_notes">Session Notes</Label>
                <Textarea
                  id="free_notes"
                  value={formData.free_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, free_notes: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Thinking Skills Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Thinking Skills Practice</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addThoughtLog}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Add Another
                  </Button>
                </div>
                
                {formData.thought_logs.map((log, index) => (
                  <Card key={log.id} className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Thinking Practice #{index + 1}</h4>
                        {formData.thought_logs.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeThoughtLog(log.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>What were you feeling?</Label>
                        <Select
                          value={log.feeling}
                          onValueChange={(value) => updateThoughtLog(log.id, 'feeling', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pick a feeling..." />
                          </SelectTrigger>
                          <SelectContent>
                            {FEELING_OPTIONS.map((feeling) => (
                              <SelectItem key={feeling} value={feeling}>
                                {feeling}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>What happened? (The situation)</Label>
                        <Textarea
                          placeholder="What was going on when they had these thoughts?"
                          value={log.trigger_situation}
                          onChange={(e) => updateThoughtLog(log.id, 'trigger_situation', e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>What thought popped into their head?</Label>
                        <Textarea
                          placeholder="What were they thinking in that moment?"
                          value={log.automatic_thought}
                          onChange={(e) => updateThoughtLog(log.id, 'automatic_thought', e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Thinking Trap (if any)</Label>
                        <Select
                          value={log.thinking_trap}
                          onValueChange={(value) => updateThoughtLog(log.id, 'thinking_trap', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Did they fall into a thinking trap?" />
                          </SelectTrigger>
                          <SelectContent>
                            {THINKING_TRAPS.map((trap) => (
                              <SelectItem key={trap} value={trap}>
                                {trap}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Better way to think about it</Label>
                        <Textarea
                          placeholder="What's a more helpful or balanced way to think about this?"
                          value={log.better_thought}
                          onChange={(e) => updateThoughtLog(log.id, 'better_thought', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>


              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewForm(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Session Note'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Session Notes History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Session History</h3>
        
        {sessionNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No session notes yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first session note to start tracking progress
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessionNotes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        Session - {format(new Date(note.session_date), 'MMMM d, yyyy')}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Created {format(new Date(note.created_at), 'MMM d, yyyy at h:mm a')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, noteId: note.id })}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {note.free_notes && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Session Notes</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {note.free_notes}
                      </p>
                    </div>
                  )}
                  
                  {note.thought_logs.length > 0 && note.thought_logs[0].trigger_situation && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm mb-3">Thinking Skills Practice</h4>
                      {note.thought_logs.map((log, index) => (
                        <div key={index} className="grid gap-3 sm:grid-cols-2 mb-4 last:mb-0">
                          {log.trigger_situation && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">What happened?</p>
                              <p className="text-sm">{log.trigger_situation}</p>
                            </div>
                          )}
                          {log.automatic_thought && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Thought</p>
                              <p className="text-sm">{log.automatic_thought}</p>
                            </div>
                          )}
                          {log.thinking_trap && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Thinking Trap</p>
                              <p className="text-sm">{log.thinking_trap}</p>
                            </div>
                          )}
                          {log.better_thought && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Better Way to Think</p>
                              <p className="text-sm">{log.better_thought}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, noteId: null })}
        title="Delete Session Note"
        description="Are you sure you want to delete this session note? This action cannot be undone."
        onConfirm={() => {
          if (deleteDialog.noteId) {
            handleDeleteNote(deleteDialog.noteId);
            setDeleteDialog({ open: false, noteId: null });
          }
        }}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}