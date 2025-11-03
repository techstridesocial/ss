// Email utility functions for sending invitations
// This can be easily extended to use SendGrid, Resend, or other email services

export interface InvitationEmailData {
  to: string
  invitationUrl: string
  role: string
  firstName?: string
  lastName?: string
  invitedBy: string
}

export async function sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
  try {
    // For now, we'll just log the email details
    // In production, this would integrate with SendGrid, Resend, etc.
    console.log('📧 Sending invitation email:', {
      to: data.to,
      role: data.role,
      invitedBy: data.invitedBy,
      url: data.invitationUrl
    })

    // TODO: Implement actual email sending
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
    // 
    // const msg = {
    //   to: data.to,
    //   from: 'noreply@stridesocial.com',
    //   subject: `You're invited to join StrideSocial as a ${data.role}`,
    //   html: generateInvitationEmailHTML(data)
    // }
    // 
    // await sgMail.send(msg)

    // For now, return true to indicate "email sent"
    return true
  } catch (error) {
    console.error('Failed to send invitation email:', error)
    return false
  }
}

function generateInvitationEmailHTML(data: InvitationEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invitation to StrideSocial</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Welcome to StrideSocial!</h1>
        
        <p>Hello${data.firstName ? ` ${data.firstName}` : ''},</p>
        
        <p>You've been invited to join StrideSocial as a <strong>${data.role}</strong> by ${data.invitedBy}.</p>
        
        <p>Click the button below to accept your invitation and create your account:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.invitationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${data.invitationUrl}</p>
        
        <p>This invitation will expire in 7 days.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    </body>
    </html>
  `
}
