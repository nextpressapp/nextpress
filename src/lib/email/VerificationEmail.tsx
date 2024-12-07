import React from "react";
import { EmailTemplate } from "./EmailTemplate";

interface VerificationEmailProps {
  verificationUrl: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  verificationUrl,
}) => (
  <EmailTemplate
    previewText="Verify your email address for NextPress"
    headerText="Verify Your Email Address"
    bodyText="Thank you for registering with NextPress! Please click the button below to verify your email address:"
    buttonText="Verify Email"
    buttonLink={verificationUrl}
  />
);
