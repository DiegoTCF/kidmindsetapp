import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingData {
  email: string;
  password: string;
  parentName: string;
  phone: string;
  childName: string;
  childAge: number;
  childLevel: number;
  weeklySchedule: string;
}

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    email: '',
    password: '',
    parentName: '',
    phone: '',
    childName: '',
    childAge: 8,
    childLevel: 1,
    weeklySchedule: '',
  });
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    console.log('[AuthFlow] Attempting sign in');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('[AuthFlow] Sign in error:', error.message);
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log('[AuthFlow] Sign in successful');
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    console.log('[AuthFlow] Sending password reset email');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      console.log('[AuthFlow] Password reset error:', error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log('[AuthFlow] Password reset email sent');
      toast({
        title: "Check your email",
        description: "Password reset instructions have been sent to your email.",
      });
      setIsForgotPassword(false);
    }
    setLoading(false);
  };

  const handleSignUpStep1 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setOnboardingData(prev => ({ ...prev, email, password }));
    setSignUpStep(2);
    console.log('[AuthFlow] Moving to step 2 - Parent Info');
  };

  const handleSignUpStep2 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const parentName = formData.get('parentName') as string;
    const phone = formData.get('phone') as string;

    if (!parentName) {
      toast({
        title: "Missing information",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    setOnboardingData(prev => ({ ...prev, parentName, phone }));
    setSignUpStep(3);
    console.log('[AuthFlow] Moving to step 3 - Payment');
  };

  const handleSignUpStep3 = () => {
    setSignUpStep(4);
    console.log('[AuthFlow] Moving to step 4 - Child Profile');
  };

  const handleSignUpStep4 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    console.log('[AuthFlow] Completing sign up process');

    const formData = new FormData(e.currentTarget);
    const childName = formData.get('childName') as string;
    const childAge = parseInt(formData.get('childAge') as string);
    const childLevel = parseInt(formData.get('childLevel') as string);
    const weeklySchedule = formData.get('weeklySchedule') as string;

    if (!childName || !childAge) {
      toast({
        title: "Missing information",
        description: "Please fill in all child information.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: onboardingData.email,
        password: onboardingData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) {
        console.log('[AuthFlow] Auth error:', authError.message);
        toast({
          title: "Error creating account",
          description: authError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            email: onboardingData.email,
          });

        if (profileError) {
          console.log('[AuthFlow] Profile creation error:', profileError.message);
        }

        // Create parent record
        const { data: parentData, error: parentError } = await supabase
          .from('parents')
          .insert({
            user_id: authData.user.id,
            name: onboardingData.parentName,
            phone: onboardingData.phone,
            payment_status: 'pending',
          })
          .select('id')
          .single();

        if (parentError) {
          console.log('[AuthFlow] Parent creation error:', parentError.message);
          toast({
            title: "Error",
            description: "Failed to create parent profile.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Create child record
        const { error: childError } = await supabase
          .from('children')
          .insert({
            parent_id: parentData.id,
            name: childName,
            age: childAge,
            level: childLevel,
            weekly_schedule: weeklySchedule,
            points: 0,
          });

        if (childError) {
          console.log('[AuthFlow] Child creation error:', childError.message);
          toast({
            title: "Error",
            description: "Failed to create child profile.",
            variant: "destructive",
          });
        } else {
          console.log('[AuthFlow] Sign up completed successfully');
          toast({
            title: "Account created!",
            description: "Welcome to KidMindset! Please check your email to verify your account.",
          });
        }
      }
    } catch (error) {
      console.log('[AuthFlow] Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email to receive reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="parent@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Email
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsForgotPassword(false)}
              >
                Back to Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSignUp) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              {signUpStep > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSignUpStep(signUpStep - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex-1 text-center">
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Step {signUpStep} of 4</CardDescription>
              </div>
              <div className="w-8" />
            </div>
          </CardHeader>
          <CardContent>
            {signUpStep === 1 && (
              <form onSubmit={handleSignUpStep1} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="parent@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}

            {signUpStep === 2 && (
              <form onSubmit={handleSignUpStep2} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Your Name</Label>
                  <Input
                    id="parentName"
                    name="parentName"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}

            {signUpStep === 3 && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Payment Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    Stripe integration coming soon
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-sm">Monthly Subscription: $19.99</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mock payment - no charges will be made
                  </p>
                </div>
                <Button onClick={handleSignUpStep3} className="w-full">
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {signUpStep === 4 && (
              <form onSubmit={handleSignUpStep4} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="childName">Child's Name</Label>
                  <Input
                    id="childName"
                    name="childName"
                    placeholder="Enter child's name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childAge">Age</Label>
                  <Input
                    id="childAge"
                    name="childAge"
                    type="number"
                    min="5"
                    max="18"
                    defaultValue="8"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childLevel">Starting Level</Label>
                  <Select name="childLevel" defaultValue="1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklySchedule">Weekly Schedule (Optional)</Label>
                  <Textarea
                    id="weeklySchedule"
                    name="weeklySchedule"
                    placeholder="Mon/Wed/Fri training, Sat games..."
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Setup
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsSignUp(false);
                  setSignUpStep(1);
                }}
              >
                Already have an account? Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link to="/" className="flex justify-center mb-4">
            <div className="text-2xl font-bold text-primary">🧠 KidMindset</div>
          </Link>
          <CardTitle className="text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="parent@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <Button
              variant="ghost"
              onClick={() => setIsForgotPassword(true)}
              className="text-sm"
            >
              Forgot Password?
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(true)}
              className="w-full"
            >
              Don't have an account? Sign Up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;