import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Preview,
} from "@react-email/components";

interface BaseEmailTemplateProps {
  previewText: string;
  heading: string;
  body: React.ReactNode;
  footerText?: string;
}

export const BaseEmailTemplate: React.FC<BaseEmailTemplateProps> = ({
  previewText,
  heading,
  body,
  footerText = "© 2024 NextPress. All rights reserved.",
}) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={mainStyle}>
      <Container style={containerStyle}>
        <Text style={headingStyle}>{heading}</Text>
        {body}
        <Text style={footerStyle}>{footerText}</Text>
      </Container>
    </Body>
  </Html>
);

const mainStyle = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const containerStyle = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const headingStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "20px",
};

const footerStyle = {
  color: "#8898aa",
  fontSize: "12px",
  marginTop: "20px",
};
