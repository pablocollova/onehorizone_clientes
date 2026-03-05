const nodemailer = require("nodemailer");

// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
    // If SMTP is not configured, we'll handle the unconfigured state
    // in the sendActivationEmail function by falling back to console.log
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        return null; // Signals that SMTP is disabled
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const transporter = createTransporter();

/**
 * Sends an activation email to an invited user.
 * @param {string} toEmail - The recipient's email address
 * @param {string} token - The raw activation token
 * @param {string} name - The invited user's name
 */
const sendActivationEmail = async (toEmail, token, name = "User") => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const activationLink = `${frontendUrl}/activate?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"One Horizon" <noreply@onehorizon.com>',
        to: toEmail,
        subject: "Activate your One Horizon Account",
        text: `Hello ${name},\n\nYou have been invited to join One Horizon.\nPlease activate your account by clicking the link below:\n\n${activationLink}\n\nThis link will expire in 48 hours.\n\nBest regards,\nThe One Horizon Team`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to One Horizon</h2>
                <p>Hello ${name},</p>
                <p>You have been invited to join the One Horizon platform.</p>
                <p>Please activate your account and set your password by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${activationLink}" style="background-color: #0A5C5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Activate Account</a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #555;"><a href="${activationLink}">${activationLink}</a></p>
                <p><em>This link will expire in 48 hours.</em></p>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888;">Best regards,<br>The One Horizon Team</p>
            </div>
        `,
    };

    if (transporter) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ [Email Service] Activation email sent to ${toEmail}. MessageId: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error(`🔥 [Email Service] Failed to send email to ${toEmail}:`, error);
            throw new Error("Failed to send activation email via SMTP.");
        }
    } else {
        // DEV ONLY FALLBACK: Log to console if SMTP is not configured
        console.log("\n=======================================================");
        console.log("📨 [DEV EMAIL SIMULATION]");
        console.log(`TO      : ${toEmail}`);
        console.log(`SUBJECT : ${mailOptions.subject}`);
        console.log(`LINK    : ${activationLink}`);
        console.log("=======================================================\n");
        return true;
    }
};

module.exports = {
    sendActivationEmail
};
