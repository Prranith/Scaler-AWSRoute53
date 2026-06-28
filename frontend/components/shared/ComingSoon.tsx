"use client";

import { Construction } from "lucide-react";

interface Props {
  feature: string;
  description: string;
}

export function ComingSoon({ feature, description }: Props) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{feature}</h1>
          <p className="page-subtitle">AWS Route53 Feature</p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--aws-orange-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Construction size={32} style={{ color: "var(--aws-orange)" }} />
        </div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 12,
          }}
        >
          Coming Soon
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            maxWidth: 440,
            lineHeight: 1.7,
            marginBottom: 28,
          }}
        >
          {description}
        </p>
        <div
          style={{
            padding: "10px 20px",
            background: "var(--aws-orange-light)",
            border: "1px solid rgba(236,114,17,0.3)",
            borderRadius: 6,
            fontSize: 13,
            color: "var(--aws-orange)",
            fontWeight: 500,
          }}
        >
          🚧 &nbsp;This feature is mocked in the current version
        </div>
      </div>
    </div>
  );
}
