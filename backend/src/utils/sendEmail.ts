import * as nodemailer from 'nodemailer';
import { EmailVerificationInDto } from 'src/auth/dto';

function template(html: string, replacements: Record<string, string>) {
  return html.replace(/%(\w*)%/g, function (m, key) {
    return replacements.hasOwnProperty(key) ? replacements[key] : '';
  });
}

const sendEmail = async (emailVerificationInDto: EmailVerificationInDto) => {
  const { from, recipients } = emailVerificationInDto;
  const emailSkeleton = 
    `<style> body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding.container {max-width: 600px;margin: 0 auto;background-color: #ffffff;padding: 20px;border-radius: 10px;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}.header {text-align: center;padding: 20px 0;}.header h1 {margin: 0;font-size: 24px;}.content {padding: 20px 0;text-align: center;}.content p {font-size: 16px;line-height: 1.5;}.content a {display: inline-block;background-color: #4CAF50;color: #ffffff;padding: 10px 20px;text-decoration: none;border-radius: 5px;margin-top: 20px;}.footer {text-align: center;padding: 20px 0;font-size: 12px;color: #999999;}</style></head><body><div class='container'> <div class='header'> <h1>Email Verification</h1></div><div class='content'><p>Hi %name%,</p><p>Thank you for registering with ${process.env.APP_NAME}. Please click the button below to verify your email address:</p><a href='${process.env.CLIENT_APP_URL}/auth/new-verification?token=%token%'>Click here</a><p>If you did not sign up for an account, please ignore this email.</p></div><div class='footer'><p>&copy; ${new Date().getFullYear} ${process.env.APP_NAME}. All rights reserved.</p></div></div></body>`;
        
  const html = emailVerificationInDto.placeholderReplacement
    ? template(emailSkeleton, emailVerificationInDto.placeholderReplacement)
    : emailVerificationInDto.html;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GOOGLE_EMAIL_USER,
      pass: process.env.GOOGLE_EMAIL_PASS,
    },

  });

  const options = {
    from: from ?? {
      name: process.env.APP_NAME,
      address: process.env.DEFAULT_MAIL_FROM,
    },
    to: recipients,
    subject: "Email verification ",
    html,
  };

  try {
    const result = await transporter.sendMail(options);

    return result;
  } catch (error) {
    console.log('Failed to send an email', error);
  }
};

export default sendEmail;
