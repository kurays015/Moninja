"use client";

import { useEffect, useState } from "react";
import {
  usePrivy,
  CrossAppAccountWithMetadata,
} from "@privy-io/react-auth";

interface MonadAuthProps {
  onAccountAddress?: (address: string | null) => void;
}

export default function MonadAuth({ onAccountAddress }: MonadAuthProps) {
  const { authenticated, user, ready, logout, login } = usePrivy();
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Check if privy is ready and user is authenticated
    if (authenticated && user && ready) {
      // Check if user has linkedAccounts
      if (user.linkedAccounts.length > 0) {
        // Get the cross app account created using Monad Games ID
        const crossAppAccount: CrossAppAccountWithMetadata = user.linkedAccounts.filter(
          account => 
            account.type === "cross_app" && 
            account.providerApp.id === "cmd8euall0037le0my79qpz42"
        )[0] as CrossAppAccountWithMetadata;

        if (crossAppAccount) {
          // The first embedded wallet created using Monad Games ID, is the wallet address
          if (crossAppAccount.embeddedWallets.length > 0) {
            const address = crossAppAccount.embeddedWallets[0].address;
            setAccountAddress(address);
            setMessage("");
            if (onAccountAddress) {
              onAccountAddress(address);
            }
          } else {
            setMessage("No embedded wallets found in your Monad Games ID account.");
            setAccountAddress(null);
            if (onAccountAddress) {
              onAccountAddress(null);
            }
          }
        } else {
          setMessage("Monad Games ID account not found in linked accounts.");
          setAccountAddress(null);
          if (onAccountAddress) {
            onAccountAddress(null);
          }
        }
      } else {
        setMessage("You need to link your Monad Games ID account to continue.");
        setAccountAddress(null);
        if (onAccountAddress) {
          onAccountAddress(null);
        }
      }
    } else if (ready && !authenticated) {
      setMessage("Please connect your wallet to continue.");
      setAccountAddress(null);
      if (onAccountAddress) {
        onAccountAddress(null);
      }
    }
  }, [authenticated, user, ready, onAccountAddress]);

  return (
    <div className="bg-gray-900 p-6 rounded-lg space-y-4">
      <h2 className="text-xl font-bold text-center">Monad Games Authentication</h2>
      
      {!ready && (
        <div className="text-center text-gray-400">
          <p>Loading...</p>
        </div>
      )}

      {ready && !authenticated && (
        <div className="text-center space-y-4">
          <p className="text-gray-300">Connect your wallet to access Monad Games</p>
          <button
            onClick={login}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {ready && authenticated && (
        <div className="space-y-4">
          {accountAddress ? (
            <div className="text-center space-y-2">
              <p className="text-green-400">✓ Monad Games ID Connected</p>
              <p className="text-sm text-gray-400 break-all">{accountAddress}</p>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-yellow-400">⚠ {message}</p>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Linked Accounts: {user?.linkedAccounts?.length || 0}</p>
                {user?.linkedAccounts && user.linkedAccounts.length > 0 && (
                  <div className="text-xs">
                    <p>Account Types: {user.linkedAccounts.map(acc => acc.type).join(", ")}</p>
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
              >
                Disconnect & Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
