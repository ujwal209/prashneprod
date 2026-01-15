import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || "user",
        pass: process.env.SMTP_PASS || "pass",
    },
});

export async function sendWelcomeEmail(to: string, name: string) {
    try {
        const info = await transporter.sendMail({
            from: '"Prashne" <no-reply@prashne.com>', // sender address
            to,
            subject: "Welcome to Prashne!", // Subject line
            text: `Hello ${name},\n\nWelcome to Prashne! We are excited to have you on board.\n\nBest regards,\nThe Prashne Team`, // plain text body
            html: `
        <div style="font-family: sans-serif; padding: 20px;">
            <h1>Welcome via NodeMailer!</h1>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Welcome to <strong>Prashne</strong>. We are excited to have you on board practicing coding and getting hired!</p>
            <p>Please click the link below to get started:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
        </div>
      `,
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
}
