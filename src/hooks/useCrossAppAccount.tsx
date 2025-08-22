"use client";

import { useMemo } from "react";
import { usePrivy, CrossAppAccountWithMetadata } from "@privy-io/react-auth";

export function useCrossAppAccount() {
  const { authenticated, user } = usePrivy();

  const crossAppAccount = useMemo((): CrossAppAccountWithMetadata | null => {
    if (!authenticated || !user?.linkedAccounts?.length) {
      return null;
    }

    return (
      user.linkedAccounts.find(
        (account): account is CrossAppAccountWithMetadata =>
          account.type === "cross_app" &&
          account.providerApp.id === process.env.NEXT_PUBLIC_MON_ID
      ) || null
    );
  }, [authenticated, user?.linkedAccounts]);

  const walletAddress = useMemo((): string | null => {
    if (!crossAppAccount?.embeddedWallets?.length) {
      return null;
    }
    return crossAppAccount.embeddedWallets[0]?.address || null;
  }, [crossAppAccount]);

  return {
    crossAppAccount,
    walletAddress,
    isAuthenticated: authenticated,
    user,
  };
}
