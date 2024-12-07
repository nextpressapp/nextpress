import React from "react";
import { EmailTemplate } from "./EmailTemplate";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  resetUrl,
}) => (
  <EmailTemplate
    previewText="Reset your password for NextPress"
    headerText="Reset Your Password"
    bodyText="You requested a password reset. Click the button below to reset your password:"
    buttonText="Reset Password"
    buttonLink={resetUrl}
  />
);
