import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { VerificationEmail } from "./VerificationEmail";
import { PasswordResetEmail } from "./PasswordResetEmail";
import { createElement } from "react";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    const emailHtml = await render(
        createElement(VerificationEmail, { verificationUrl })
    );

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Verify your email address",
        html: emailHtml,
    });
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    const emailHtml = await render(
        createElement(PasswordResetEmail, { resetUrl })
    );

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Reset your password",
        html: emailHtml,
    });
}
