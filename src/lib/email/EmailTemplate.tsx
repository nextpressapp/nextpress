import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Img,
} from "@react-email/components";

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

interface EmailTemplateProps {
  previewText: string;
  headerText: string;
  bodyText: string;
  buttonText: string;
  buttonLink: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  previewText,
  headerText,
  bodyText,
  buttonText,
  buttonLink,
}) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={mainStyle}>
      <Container style={containerStyle}>
        <Img
          src={`${baseUrl}/logo.png`}
          width="80"
          height="80"
          alt="NextPress"
          style={logoStyle}
        />
        <Text style={headerStyle}>{headerText}</Text>
        <Section style={bodyStyle}>
          <Text style={paragraphStyle}>{bodyText}</Text>
          <Button pX={20} pY={12} style={buttonStyle} href={buttonLink}>
            {buttonText}
          </Button>
        </Section>
        <Hr style={hrStyle} />
        <Text style={footerStyle}>
          &copy; {new Date().getFullYear()} NextPress. All rights reserved.
        </Text>
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

const logoStyle = {
  margin: "0 auto",
};

const headerStyle = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const bodyStyle = {
  margin: "0 auto",
  maxWidth: "400px",
};

const paragraphStyle = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
};

const buttonStyle = {
  backgroundColor: "#3869d4",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
};

const hrStyle = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footerStyle = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
};
