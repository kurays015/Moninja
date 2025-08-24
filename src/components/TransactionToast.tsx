import Link from "next/link";
import { SubmitScoreResponse } from "../types";
import { ExternalLink, CheckCircle } from "lucide-react";

interface TransactionToastProps {
  transactionsInfo: SubmitScoreResponse;
}

export default function TransactionToast({
  transactionsInfo,
}: TransactionToastProps) {
  return (
    <div className="flex items-center gap-3 p-3">
      {/* Success icon */}
      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />

      {/* Message */}
      <div className="flex-1">
        <span className="text-xs text-white font-medium">
          Score submitted successfully
        </span>
      </div>

      {/* Explorer link */}
      <Link
        referrerPolicy="no-referrer"
        target="_blank"
        href={`https://testnet.monadexplorer.com/tx/${transactionsInfo.transactionHash}`}
        className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-300 hover:text-blue-200 transition-colors text-xs"
        onClick={e => e.stopPropagation()}
      >
        <ExternalLink className="w-3 h-3" />
        <span>View on Explorer</span>
      </Link>
    </div>
  );
}
