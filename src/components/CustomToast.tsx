import React from "react";

interface CustomToastProps {
  message: string;
  linkText?: string;
  linkUrl?: string;
  linkIcon?: string;
  type?: "success" | "info" | "warning" | "error";
}

export const CustomToast: React.FC<CustomToastProps> = ({
  message,
  linkText,
  linkUrl,
  linkIcon = "→",
  type = "success",
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "info":
        return "text-blue-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm">{message}</div>
      {linkText && linkUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${getTypeStyles()} hover:opacity-80 underline text-xs flex items-center gap-1 transition-opacity`}
          onClick={e => e.stopPropagation()}
        >
          {linkText} {linkIcon}
        </a>
      )}
    </div>
  );
};

// Predefined toast functions
export const showScoreSubmittedToast = (transactionHash: string) => {
  return (
    <CustomToast
      message="Score submitted successfully!"
      linkText="View Transaction"
      linkUrl={`https://explorer.monad.xyz/tx/${transactionHash}`}
      type="success"
    />
  );
};

export const showGameSessionToast = (sessionId: string) => {
  return (
    <CustomToast
      message="Game session started!"
      linkText="View Session"
      linkUrl={`/session/${sessionId}`}
      type="info"
    />
  );
};

// Toast with external link icon
export const showExternalLinkToast = (
  message: string,
  url: string,
  linkText: string
) => {
  return (
    <CustomToast
      message={message}
      linkText={linkText}
      linkUrl={url}
      linkIcon="🔗"
      type="info"
    />
  );
};

// Toast with multiple links
export const showMultiLinkToast = (
  message: string,
  links: Array<{ text: string; url: string }>
) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm">{message}</div>
      <div className="flex flex-col gap-1">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline text-xs flex items-center gap-1"
            onClick={e => e.stopPropagation()}
          >
            {link.text} →
          </a>
        ))}
      </div>
    </div>
  );
};
