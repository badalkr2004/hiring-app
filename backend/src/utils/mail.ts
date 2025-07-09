import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export async function sendMail(
  recipient: string,
  subject: string,
  body: string,
  attachments: any[] = []
): Promise<void> {
  try {
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASSWORD
    ) {
      throw new Error(
        "Email configuration is not set in environment variables"
      );
    }
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.verify();

    const options = {
      from: `"Job Flow" <${process.env.EMAIL_USER}>`,
      to: recipient,
      priority: "high" as const,
      subject,
      html: body,
      attachments,
    };

    await transporter.sendMail(options);
  } catch (error) {
    console.error(error);
  }
}
