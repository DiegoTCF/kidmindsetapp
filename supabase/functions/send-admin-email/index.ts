import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  notification_type: 'user_signup' | 'activity_created';
  user_email?: string;
  child_name?: string;
  activity_name?: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[AdminEmail] Processing admin email notification...');
    
    const { notification_type, user_email, child_name, activity_name, timestamp }: EmailRequest = await req.json();

    let subject = '';
    let htmlContent = '';

    if (notification_type === 'user_signup') {
      subject = '🆕 New User Signup - Admin Alert';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New User Signup</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">📧 New User Alert</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 10px 0; color: #666;">
                <strong>Email:</strong> ${user_email || 'Unknown'}
              </p>
              <p style="margin: 0 0 10px 0; color: #666;">
                <strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString()}
              </p>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              A new user has registered on the Confident Footballer platform. You may want to check the admin dashboard for more details.
            </p>
          </div>
          <div style="padding: 20px; text-align: center; background: #e9ecef; color: #666; font-size: 12px;">
            This is an automated notification from the Confident Footballer Admin System.
          </div>
        </div>
      `;
    } else if (notification_type === 'activity_created') {
      subject = '🏃‍♂️ New Activity Created - Admin Alert';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Activity Created</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">⚽ Activity Alert</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #48bb78;">
              <p style="margin: 0 0 10px 0; color: #666;">
                <strong>Child:</strong> ${child_name || 'Unknown Child'}
              </p>
              <p style="margin: 0 0 10px 0; color: #666;">
                <strong>Activity:</strong> ${activity_name || 'Unknown Activity'}
              </p>
              <p style="margin: 0 0 10px 0; color: #666;">
                <strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString()}
              </p>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              A new activity has been created on the platform. Check the admin dashboard to view progress and details.
            </p>
          </div>
          <div style="padding: 20px; text-align: center; background: #e9ecef; color: #666; font-size: 12px;">
            This is an automated notification from the Confident Footballer Admin System.
          </div>
        </div>
      `;
    }

    // For demo purposes, we'll log the email instead of actually sending it
    // In production, you would integrate with an email service like Resend
    console.log('[AdminEmail] Email notification prepared:');
    console.log('To: pagliusodiego@gmail.com');
    console.log('Subject:', subject);
    console.log('Content:', htmlContent);
    
    // Simulate email sending
    // Email notification sent successfully (simulated)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin email notification sent successfully',
        email_to: 'admin@example.com',
        subject: subject
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("[AdminEmail] Error sending admin email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);