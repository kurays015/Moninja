"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { monadTestnet } from "viem/chains";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethodsAndOrder: {
          primary: [`privy:${process.env.NEXT_PUBLIC_MON_ID || ""}`],
        },
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
