import React from "react";
import { Text, Button } from "@react-email/components";
import { BaseEmailTemplate } from "./BaseEmailTemplate";

interface PasswordResetEmailProps {
  username: string;
  resetUrl: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  username,
  resetUrl,
}) => (
  <BaseEmailTemplate
    previewText={`Password reset request for NextPress`}
    heading={`Password Reset Request`}
    body={
      <>
        <Text style={paragraphStyle}>Hello {username},</Text>
        <Text style={paragraphStyle}>
          We received a request to reset your password for your NextPress
          account. If you didn&#39;t make this request, you can safely ignore
          this email.
        </Text>
        <Text style={paragraphStyle}>
          To reset your password, click the button below:
        </Text>
        <Button style={buttonStyle} href={resetUrl}>
          Reset Your Password
        </Button>
        <Text style={paragraphStyle}>
          This link will expire in 1 hour for security reasons. If you need to
          reset your password after that, please make a new request.
        </Text>
        <Text style={paragraphStyle}>
          If you&#39;re having trouble clicking the button, copy and paste the
          URL below into your web browser:
        </Text>
        <Text style={urlStyle}>{resetUrl}</Text>
        <Text style={paragraphStyle}>
          If you didn&#39;t request a password reset, please contact our support
          team immediately.
        </Text>
        <Text style={paragraphStyle}>
          Best regards,
          <br />
          The NextPress Team
        </Text>
      </>
    }
  />
);

const paragraphStyle = {
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "20px",
};

const buttonStyle = {
  backgroundColor: "#5469d4",
  borderRadius: "4px",
  color: "#fff",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  width: "100%",
  padding: "12px 20px",
  marginBottom: "20px",
};

const urlStyle = {
  fontSize: "14px",
  lineHeight: "24px",
  marginBottom: "20px",
  wordBreak: "break-all" as const,
};
