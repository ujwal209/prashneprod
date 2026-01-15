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