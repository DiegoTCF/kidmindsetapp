import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useChildData } from "@/hooks/useChildData";
import { supabase } from "@/integrations/supabase/client";
import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export function RLSSecurityTest() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { childId } = useChildData();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runSecurityTests = async () => {
    if (!user) return;
    
    setTesting(true);
    const results: TestResult[] = [];

    console.log('[RLS Security Test] Starting comprehensive RLS security tests...');

    // Test 1: Profile access
    try {
      console.log('[RLS Security Test] Testing profile access...');
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          results.push({
            test: 'Profile Access (Anonymous Prevention)',
            status: 'pass',
            message: 'Anonymous users correctly blocked from profiles table',
            details: error.message
          });
        } else {
          results.push({
            test: 'Profile Access',
            status: 'fail',
            message: 'Unexpected error accessing profiles',
            details: error.message
          });
        }
      } else {
        // Check if we only got our own profile or if admin got all profiles
        const hasOnlyOwnData = profiles?.every(p => p.user_id === user.id) || (isAdmin && profiles);
        results.push({
          test: 'Profile Access',
          status: hasOnlyOwnData ? 'pass' : 'warning',
          message: isAdmin ? 
            `Admin access: Retrieved ${profiles?.length || 0} profiles` :
            `User access: Retrieved ${profiles?.length || 0} profiles (should be 1 or 0)`,
          details: `Retrieved profiles for: ${profiles?.map(p => p.user_id.substring(0,8)).join(', ')}`
        });
      }
    } catch (error) {
      results.push({
        test: 'Profile Access',
        status: 'fail',
        message: 'Exception during profile access test',
        details: String(error)
      });
    }

    // Test 2: Children data access
    try {
      console.log('[RLS Security Test] Testing children data access...');
      const { data: children, error } = await supabase
        .from('children')
        .select('*');
      
      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          results.push({
            test: 'Children Data Access',
            status: 'pass',
            message: 'Unauthorized users correctly blocked from children table',
            details: error.message
          });
        } else {
          results.push({
            test: 'Children Data Access',
            status: 'fail',
            message: 'Unexpected error accessing children data',
            details: error.message
          });
        }
      } else {
        results.push({
          test: 'Children Data Access',
          status: isAdmin ? 'pass' : (children?.length <= 1 ? 'pass' : 'warning'),
          message: isAdmin ? 
            `Admin access: Retrieved ${children?.length || 0} children records` :
            `User access: Retrieved ${children?.length || 0} children records`,
          details: `Retrieved children: ${children?.map(c => c.name).join(', ')}`
        });
      }
    } catch (error) {
      results.push({
        test: 'Children Data Access',
        status: 'fail',
        message: 'Exception during children access test',
        details: String(error)
      });
    }

    // Test 3: Parent data access
    try {
      console.log('[RLS Security Test] Testing parent data access...');
      const { data: parents, error } = await supabase
        .from('parents')
        .select('*');
      
      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          results.push({
            test: 'Parent Data Access',
            status: 'pass',
            message: 'Unauthorized users correctly blocked from parents table',
            details: error.message
          });
        } else {
          results.push({
            test: 'Parent Data Access',
            status: 'fail',
            message: 'Unexpected error accessing parent data',
            details: error.message
          });
        }
      } else {
        const hasOnlyOwnData = parents?.every(p => p.user_id === user.id) || (isAdmin && parents);
        results.push({
          test: 'Parent Data Access',
          status: hasOnlyOwnData ? 'pass' : 'warning',
          message: isAdmin ? 
            `Admin access: Retrieved ${parents?.length || 0} parent records` :
            `User access: Retrieved ${parents?.length || 0} parent records (should be 1)`,
          details: `Contains phone/personal data: ${parents?.some(p => p.phone) ? 'Yes' : 'No'}`
        });
      }
    } catch (error) {
      results.push({
        test: 'Parent Data Access',
        status: 'fail',
        message: 'Exception during parent access test',
        details: String(error)
      });
    }

    // Test 4: Progress entries access
    try {
      console.log('[RLS Security Test] Testing progress entries access...');
      const { data: entries, error } = await supabase
        .from('progress_entries')
        .select('*')
        .limit(10);
      
      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          results.push({
            test: 'Progress Entries Access',
            status: 'pass',
            message: 'Unauthorized users correctly blocked from progress entries',
            details: error.message
          });
        } else {
          results.push({
            test: 'Progress Entries Access',
            status: 'fail',
            message: 'Unexpected error accessing progress entries',
            details: error.message
          });
        }
      } else {
        results.push({
          test: 'Progress Entries Access',
          status: 'pass',
          message: `Successfully retrieved ${entries?.length || 0} progress entries`,
          details: `Entry types: ${[...new Set(entries?.map(e => e.entry_type))].join(', ')}`
        });
      }
    } catch (error) {
      results.push({
        test: 'Progress Entries Access',
        status: 'fail',
        message: 'Exception during progress entries test',
        details: String(error)
      });
    }

    // Test 5: Admin notifications access (should be restricted)
    try {
      console.log('[RLS Security Test] Testing admin notifications access...');
      const { data: notifications, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .limit(5);
      
      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          results.push({
            test: 'Admin Notifications Access',
            status: isAdmin ? 'warning' : 'pass',
            message: isAdmin ? 
              'Admin blocked from notifications (unexpected)' :
              'Non-admin correctly blocked from admin notifications',
            details: error.message
          });
        } else {
          results.push({
            test: 'Admin Notifications Access',
            status: 'fail',
            message: 'Unexpected error accessing admin notifications',
            details: error.message
          });
        }
      } else {
        results.push({
          test: 'Admin Notifications Access',
          status: isAdmin ? 'pass' : 'fail',
          message: isAdmin ? 
            `Admin access: Retrieved ${notifications?.length || 0} notifications` :
            `NON-ADMIN ACCESS TO SENSITIVE DATA: ${notifications?.length || 0} notifications`,
          details: `Contains user emails: ${notifications?.some(n => n.related_user_email) ? 'Yes' : 'No'}`
        });
      }
    } catch (error) {
      results.push({
        test: 'Admin Notifications Access',
        status: 'fail',
        message: 'Exception during admin notifications test',
        details: String(error)
      });
    }

    // Test 6: User action logs access
    try {
      console.log('[RLS Security Test] Testing user action logs access...');
      const { data: logs, error } = await supabase
        .from('user_action_logs')
        .select('*')
        .limit(5);
      
      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          results.push({
            test: 'User Action Logs Access',
            status: 'pass',
            message: 'Unauthorized access to user logs correctly blocked',
            details: error.message
          });
        } else {
          results.push({
            test: 'User Action Logs Access',
            status: 'fail',
            message: 'Unexpected error accessing user logs',
            details: error.message
          });
        }
      } else {
        const hasOnlyOwnLogs = logs?.every(l => l.user_id === user.id) || (isAdmin && logs);
        results.push({
          test: 'User Action Logs Access',
          status: hasOnlyOwnLogs ? 'pass' : 'warning',
          message: isAdmin ? 
            `Admin access: Retrieved ${logs?.length || 0} log entries` :
            `User access: Retrieved ${logs?.length || 0} log entries`,
          details: `Contains IP addresses: ${logs?.some(l => l.ip_address) ? 'Yes' : 'No'}`
        });
      }
    } catch (error) {
      results.push({
        test: 'User Action Logs Access',
        status: 'fail',
        message: 'Exception during user logs test',
        details: String(error)
      });
    }

    console.log('[RLS Security Test] Security tests completed:', results);
    setTestResults(results);
    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  useEffect(() => {
    // Auto-run tests when component mounts and user is available
    if (user && !testing) {
      setTimeout(() => runSecurityTests(), 1000);
    }
  }, [user]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          RLS Security Test Results
        </CardTitle>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>User: {user?.email}</span>
          <span>|</span>
          <span>Admin: {isAdmin ? 'Yes' : 'No'}</span>
          <span>|</span>
          <span>Child ID: {childId ? childId.substring(0, 8) + '...' : 'None'}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runSecurityTests} 
            disabled={testing || !user}
            size="sm"
          >
            {testing ? 'Testing...' : 'Run Security Tests'}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results</h3>
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-muted-foreground">{result.message}</p>
                {result.details && (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    {result.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Security Test Information:</strong></p>
          <p>• <span className="text-green-600">PASS</span>: RLS policies working correctly</p>
          <p>• <span className="text-red-600">FAIL</span>: Potential security vulnerability detected</p>
          <p>• <span className="text-yellow-600">WARNING</span>: Unexpected behavior, needs review</p>
        </div>
      </CardContent>
    </Card>
  );
}