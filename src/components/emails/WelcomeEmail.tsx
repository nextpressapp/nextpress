import React from "react";
import { Text, Button } from "@react-email/components";
import { BaseEmailTemplate } from "./BaseEmailTemplate";

interface WelcomeEmailProps {
  username: string;
  loginUrl: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  username,
  loginUrl,
}) => (
  <BaseEmailTemplate
    previewText={`Welcome to NextPress, ${username}!`}
    heading={`Welcome, ${username}!`}
    body={
      <>
        <Text style={paragraphStyle}>
          We&#39;re excited to have you on board. NextPress is a powerful
          content management system built with Next.js, offering you the
          flexibility and performance you need for your web projects.
        </Text>
        <Text style={paragraphStyle}>
          To get started, click the button below to log in to your account:
        </Text>
        <Button style={buttonStyle} href={loginUrl}>
          Log In to NextPress
        </Button>
        <Text style={paragraphStyle}>
          If you have any questions or need assistance, don&#39;t hesitate to
          reach out to our support team.
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
