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
import { useUserLogging } from '@/hooks/useUserLogging';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingData {
  email: string;
  password: string;
  parentName: string;
  phone: string;
  childName: string;
  childDateOfBirth: string;
  childLevel: string;
  weeklySchedule: { [key: string]: string };
  pin: string;
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
    childDateOfBirth: '',
    childLevel: 'grassroots',
    weeklySchedule: {},
    pin: '',
  });
  const { toast } = useToast();
  const { logLogin, logError } = useUserLogging();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    console.log('[AuthFlow] Attempting sign in');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Test Supabase connectivity first
      console.log('[AuthFlow] Testing Supabase connection...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('[AuthFlow] Sign in error:', error.message);
        // Only log if logging service is available
        try {
          await logError('login_failed', error.message, '/auth');
        } catch (logError) {
          console.log('[AuthFlow] Could not log error:', logError);
        }
        
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Please check your email and click the confirmation link before signing in.";
        }
        
        toast({
          title: "Error signing in",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        // Sign in successful
        console.log('[AuthFlow] Sign in successful');
        // Try to log successful login
        try {
          await logLogin();
        } catch (logError) {
          console.log('[AuthFlow] Could not log login:', logError);
        }
        // Auto-confirm users since we enabled auto-confirm
        console.log('[AuthRedirect] Redirecting to home');
        window.location.href = '/';
      }
    } catch (networkError: any) {
      console.error('[AuthFlow] Network/connection error:', networkError);
      
      // More specific error handling for fetch failures
      let errorMessage = "Unable to connect to authentication service.";
      
      if (networkError.message?.includes('fetch')) {
        errorMessage = "Network connection failed. Please check your internet connection and try again.";
      } else if (networkError.message?.includes('CORS')) {
        errorMessage = "Authentication service temporarily unavailable. Please try again in a moment.";
      } else if (networkError.name === 'TypeError') {
        errorMessage = "Connection error. Please check your internet connection and try again.";
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
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

    try {
      console.log('[AuthFlow] Testing Supabase connection for password reset...');
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        console.log('[AuthFlow] Password reset error:', error.message);
        
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message.includes('User not found')) {
          errorMessage = "No account found with this email address. Please check the email and try again.";
        } else if (error.message.includes('Email rate limit exceeded')) {
          errorMessage = "Too many password reset requests. Please wait a few minutes before trying again.";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
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
    } catch (networkError: any) {
      console.error('[AuthFlow] Network error in password reset:', networkError);
      
      // More specific error handling for fetch failures
      let errorMessage = "Unable to connect to authentication service.";
      
      if (networkError.message?.includes('fetch')) {
        errorMessage = "Network connection failed. Please check your internet connection and try again.";
      } else if (networkError.message?.includes('CORS')) {
        errorMessage = "Authentication service temporarily unavailable. Please try again in a moment.";
      } else if (networkError.name === 'TypeError') {
        errorMessage = "Connection error. Please check your internet connection and try again.";
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSignUpStep1 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const parentName = formData.get('parentName') as string;

    if (!email || !password || !parentName) {
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

    setOnboardingData(prev => ({ ...prev, email, password, parentName }));
    setSignUpStep(2);
    console.log('[AuthFlow] Moving to step 2 - Child Registration');
  };

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

  const handleSignUpStep2 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const childName = formData.get('childName') as string;
    const childDateOfBirth = formData.get('childDateOfBirth') as string;
    const childLevel = formData.get('childLevel') as string;
    
    // Get weekly schedule from select dropdowns
    const weeklySchedule: { [key: string]: string } = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
      const dayValue = formData.get(`schedule_${day}`) as string;
      if (dayValue && dayValue !== 'off') {
        weeklySchedule[day] = dayValue;
      }
    });

    if (!childName || !childDateOfBirth) {
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

    // Store child data and move to PIN setup
    setOnboardingData(prev => ({ 
      ...prev, 
      childName, 
      childDateOfBirth, 
      childLevel, 
      weeklySchedule 
    }));
    setSignUpStep(3);
    console.log('[AuthFix] Moving to step 3 - PIN Setup');
  };

  const handleSignUpStep3 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    console.log('[AuthFix] Completing sign up with PIN setup');

    const formData = new FormData(e.currentTarget);
    const pin = formData.get('pin') as string;
    const confirmPin = formData.get('confirmPin') as string;

    if (!pin || !confirmPin) {
      toast({
        title: "Missing PIN",
        description: "Please enter and confirm your PIN.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: "PINs don't match",
        description: "Please make sure both PINs are identical.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Sign up the user with email confirmation required
      console.log('[AuthFix] Starting Supabase auth signup');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: onboardingData.email,
        password: onboardingData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (authError) {
        console.log('[AuthFix] Auth error:', authError.message);
        toast({
          title: "Error creating account",
          description: authError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('[AuthFix] Auth signup successful, confirmation email sent');
      
      // Store signup data for later processing after email confirmation
      const signupData = {
        parentName: onboardingData.parentName,
        childName: onboardingData.childName,
        childAge: calculateAge(onboardingData.childDateOfBirth),
        childLevel: onboardingData.childLevel,
        weeklySchedule: onboardingData.weeklySchedule,
        pin: pin
      };
      
      // Store in localStorage to process after email confirmation
      localStorage.setItem('pendingSignupData', JSON.stringify(signupData));
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account, then sign in.",
      });
      
      // Reset form and go back to sign in
      setIsSignUp(false);
      setSignUpStep(1);
      setOnboardingData({
        email: '',
        password: '',
        parentName: '',
        phone: '',
        childName: '',
        childDateOfBirth: '',
        childLevel: 'grassroots',
        weeklySchedule: {},
        pin: '',
      });
      
    } catch (error) {
      console.log('[AuthFix] Unexpected error:', error);
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
                <CardDescription>Step {signUpStep} of 3</CardDescription>
              </div>
              <div className="w-8" />
            </div>
          </CardHeader>
          <CardContent>
            {signUpStep === 1 && (
              <form onSubmit={handleSignUpStep1} className="space-y-4">
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
                  <Label htmlFor="childName">Child's Full Name</Label>
                  <Input
                    id="childName"
                    name="childName"
                    placeholder="Enter child's full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childDateOfBirth">Date of Birth</Label>
                  <Input
                    id="childDateOfBirth"
                    name="childDateOfBirth"
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childLevel">Level</Label>
                  <Select name="childLevel" defaultValue="grassroots">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grassroots">Grassroots</SelectItem>
                      <SelectItem value="dev_centres">Dev Centres</SelectItem>
                      <SelectItem value="academy">Academy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label>Weekly Schedule</Label>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div key={day} className="space-y-2">
                      <Label className="text-sm font-medium capitalize">{day}</Label>
                      <Select name={`schedule_${day}`} defaultValue="off">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="off">Off</SelectItem>
                          <SelectItem value="team_training">Team Training</SelectItem>
                          <SelectItem value="1to1">1to1</SelectItem>
                          <SelectItem value="small_group">Small Group or Futsal</SelectItem>
                          <SelectItem value="match">Match/Tournament</SelectItem>
                          <SelectItem value="other">Other Sport</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full">
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}

            {signUpStep === 3 && (
              <form onSubmit={handleSignUpStep3} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Create PIN for Grown Up Zone</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    This PIN protects access to bookings, payments and your child's progress.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pin">4-Digit PIN</Label>
                  <Input
                    id="pin"
                    name="pin"
                    type="password"
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPin">Confirm PIN</Label>
                  <Input
                    id="confirmPin"
                    name="confirmPin"
                    type="password"
                    placeholder="Confirm your PIN"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Registration
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
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/12821ebd-705b-4e17-b537-45a7e96dd74f.png" 
              alt="The Confident Footballer Logo" 
              className="h-48 w-auto"
            />
          </div>
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