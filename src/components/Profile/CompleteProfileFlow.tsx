import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ACTIVITY_TYPES = [
  { value: 'off', label: 'Off' },
  { value: 'training', label: 'Training' },
  { value: 'match', label: 'Match' },
  { value: 'one-to-one', label: 'One-to-One' },
];

const CHILD_LEVELS = [
  { value: 'grassroots', label: 'Grassroots' },
  { value: 'academy', label: 'Academy' },
  { value: 'elite', label: 'Elite' },
  { value: 'professional', label: 'Professional' },
];

interface CompleteProfileFlowProps {
  onComplete: () => void;
}

export default function CompleteProfileFlow({ onComplete }: CompleteProfileFlowProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [childDateOfBirth, setChildDateOfBirth] = useState('');
  const [childLevel, setChildLevel] = useState('grassroots');
  const [weeklySchedule, setWeeklySchedule] = useState<{ [key: string]: string }>({});
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parentName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!childName.trim() || !childDateOfBirth) {
      toast({
        title: "Missing information",
        description: "Please fill in all required child information.",
        variant: "destructive",
      });
      return;
    }

    const childAge = calculateAge(childDateOfBirth);
    
    if (childAge < 5 || childAge > 18) {
      toast({
        title: "Invalid age",
        description: "Child must be between 5 and 18 years old.",
        variant: "destructive",
      });
      return;
    }

    setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin || !confirmPin) {
      toast({
        title: "Missing PIN",
        description: "Please enter and confirm your PIN.",
        variant: "destructive",
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: "PINs don't match",
        description: "Please make sure both PINs are identical.",
        variant: "destructive",
      });
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email!,
        });

      if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
        throw profileError;
      }

      // Create parent record
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .insert({
          user_id: user.id,
          name: parentName,
          phone: '',
          payment_status: 'pending',
          pin: pin,
        })
        .select('id')
        .single();

      if (parentError) {
        throw parentError;
      }

      // Create child record
      const { error: childError } = await supabase
        .from('children')
        .insert({
          parent_id: parentData.id,
          name: childName,
          age: calculateAge(childDateOfBirth),
          level: 1,
          weekly_schedule: JSON.stringify(weeklySchedule),
          points: 0,
        });

      if (childError) {
        throw childError;
      }

      toast({
        title: "Profile completed!",
        description: "Your account is now fully set up.",
      });

      onComplete();
      
    } catch (error: any) {
      console.error('Error completing profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            {step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1 text-center">
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>Step {step} of 3</CardDescription>
            </div>
            <div className="w-8" />
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Your Name</Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="childName">Child's Full Name</Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter child's full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="childDateOfBirth">Date of Birth</Label>
                <Input
                  id="childDateOfBirth"
                  type="date"
                  value={childDateOfBirth}
                  onChange={(e) => setChildDateOfBirth(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="childLevel">Playing Level</Label>
                <Select value={childLevel} onValueChange={setChildLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHILD_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Weekly Schedule (Optional)</Label>
                <div className="space-y-2">
                  {DAYS.map(day => (
                    <div key={day} className="flex items-center gap-2">
                      <Label className="w-24 capitalize text-sm">{day}</Label>
                      <Select
                        value={weeklySchedule[day] || 'off'}
                        onValueChange={(value) => {
                          if (value === 'off') {
                            const newSchedule = { ...weeklySchedule };
                            delete newSchedule[day];
                            setWeeklySchedule(newSchedule);
                          } else {
                            setWeeklySchedule({ ...weeklySchedule, [day]: value });
                          }
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">Create a 4-digit PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4-digit PIN"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This PIN will be used for Grown-Up Zone access
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPin">Confirm PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Re-enter PIN"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Profile
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
