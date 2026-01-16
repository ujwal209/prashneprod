import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // Or your SMTP host
  auth: {
    user: process.env.EMAIL_USER, // Add to .env.local
    pass: process.env.EMAIL_PASS, // Add to .env.local
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  const mailOptions = {
    from: '"Prashne Auth" <no-reply@prashne.com>',
    to,
    subject: "Your Verification Code - Prashne",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Verify your Email</h2>
        <p>Welcome to Prashne! Use the code below to complete your signup.</p>
        <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1F2937;">
          ${otp}
        </div>
        <p style="margin-top: 20px; color: #6B7280; font-size: 14px;">This code expires in 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendHrInvitationEmail(to: string, tempPass: string, name: string) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`;

  const mailOptions = {
    from: '"Prashne Admin" <no-reply@prashne.com>',
    to,
    subject: "You have been invited to Prashne",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #4F46E5;">Welcome to Prashne!</h2>
        <p>Hello ${name},</p>
        <p>You have been granted <strong>HR Admin</strong> access. Please use the temporary credentials below to log in.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${to}</p>
          <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 1.1em;">${tempPass}</code></p>
        </div>

        <p><strong>Important:</strong> You will be required to change this password upon your first login.</p>

        <a href="${loginUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Access Dashboard</a>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          If you didn't expect this invitation, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendBroadcastEmail(bccList: string[], subject: string, htmlContent: string) {
  if (bccList.length === 0) return;

  const mailOptions = {
    from: '"Prashne Team" <no-reply@prashne.com>',
    to: "noreply@prashne.com", // Dummy TO address
    bcc: bccList, // The real recipients (hidden from each other)
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <div style="text-align: center; margin-bottom: 24px;">
           <h2 style="color: #4F46E5; font-size: 24px;">Prashne Updates</h2>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px;">
          ${htmlContent}
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af;">
          <p>You received this email because you are a registered user of Prashne.</p>
          <p>© ${new Date().getFullYear()} Prashne. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}