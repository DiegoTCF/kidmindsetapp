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
import { Plus, Save, FileText } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  age: number;
  level: number;
  points: number;
  parent_id: string;
}

interface SessionNote {
  id: string;
  admin_id: string;
  child_id: string;
  session_date: string;
  free_notes: string | null;
  trigger_situation: string | null;
  automatic_thought: string | null;
  cognitive_distortion: string | null;
  alternative_thought: string | null;
  created_at: string;
  updated_at: string;
}

interface SessionNotesProps {
  child: Child;
}

const COGNITIVE_DISTORTIONS = [
  'All-or-Nothing Thinking',
  'Overgeneralization',
  'Mental Filter',
  'Disqualifying the Positive',
  'Jumping to Conclusions',
  'Mind Reading',
  'Fortune Telling',
  'Magnification/Minimization',
  'Emotional Reasoning',
  'Should Statements',
  'Labeling',
  'Personalization'
];

export default function SessionNotes({ child }: SessionNotesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  
  const [formData, setFormData] = useState({
    session_date: format(new Date(), 'yyyy-MM-dd'),
    free_notes: '',
    trigger_situation: '',
    automatic_thought: '',
    cognitive_distortion: '',
    alternative_thought: ''
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
      setSessionNotes(data || []);
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
      const { error } = await supabase
        .from('session_notes')
        .insert({
          admin_id: user.id,
          child_id: child.id,
          session_date: formData.session_date,
          free_notes: formData.free_notes || null,
          trigger_situation: formData.trigger_situation || null,
          automatic_thought: formData.automatic_thought || null,
          cognitive_distortion: formData.cognitive_distortion || null,
          alternative_thought: formData.alternative_thought || null
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Session note saved successfully'
      });

      // Reset form and reload data
      setFormData({
        session_date: format(new Date(), 'yyyy-MM-dd'),
        free_notes: '',
        trigger_situation: '',
        automatic_thought: '',
        cognitive_distortion: '',
        alternative_thought: ''
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <p className="text-muted-foreground">CBT notes for {child.name}</p>
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
              {/* Session Date */}
              <div className="space-y-2">
                <Label htmlFor="session_date">Session Date</Label>
                <Input
                  id="session_date"
                  type="date"
                  value={formData.session_date}
                  onChange={(e) => handleInputChange('session_date', e.target.value)}
                  required
                />
              </div>

              {/* Free Notes */}
              <div className="space-y-2">
                <Label htmlFor="free_notes">Session Notes</Label>
                <Textarea
                  id="free_notes"
                  placeholder="General observations, progress notes, session summary..."
                  value={formData.free_notes}
                  onChange={(e) => handleInputChange('free_notes', e.target.value)}
                  rows={4}
                />
              </div>

              {/* CBT Thought Log Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">CBT Thought Log</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="trigger_situation">Trigger or Situation</Label>
                    <Textarea
                      id="trigger_situation"
                      placeholder="What happened? What was the situation?"
                      value={formData.trigger_situation}
                      onChange={(e) => handleInputChange('trigger_situation', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="automatic_thought">Automatic Thought</Label>
                    <Textarea
                      id="automatic_thought"
                      placeholder="What thoughts went through their mind?"
                      value={formData.automatic_thought}
                      onChange={(e) => handleInputChange('automatic_thought', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cognitive_distortion">Cognitive Distortion</Label>
                    <Select
                      value={formData.cognitive_distortion}
                      onValueChange={(value) => handleInputChange('cognitive_distortion', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cognitive distortion" />
                      </SelectTrigger>
                      <SelectContent>
                        {COGNITIVE_DISTORTIONS.map((distortion) => (
                          <SelectItem key={distortion} value={distortion}>
                            {distortion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alternative_thought">Alternative Thought</Label>
                    <Textarea
                      id="alternative_thought"
                      placeholder="What's a more balanced/realistic thought?"
                      value={formData.alternative_thought}
                      onChange={(e) => handleInputChange('alternative_thought', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
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
                  <CardTitle className="text-base">
                    Session - {format(new Date(note.session_date), 'MMMM d, yyyy')}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Created {format(new Date(note.created_at), 'MMM d, yyyy at h:mm a')}
                  </p>
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
                  
                  {(note.trigger_situation || note.automatic_thought || note.cognitive_distortion || note.alternative_thought) && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm mb-3">CBT Thought Log</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {note.trigger_situation && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Trigger/Situation</p>
                            <p className="text-sm">{note.trigger_situation}</p>
                          </div>
                        )}
                        {note.automatic_thought && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Automatic Thought</p>
                            <p className="text-sm">{note.automatic_thought}</p>
                          </div>
                        )}
                        {note.cognitive_distortion && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Cognitive Distortion</p>
                            <p className="text-sm">{note.cognitive_distortion}</p>
                          </div>
                        )}
                        {note.alternative_thought && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Alternative Thought</p>
                            <p className="text-sm">{note.alternative_thought}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}