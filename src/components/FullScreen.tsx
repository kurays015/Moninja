import { Fullscreen, Minimize } from "lucide-react";
import { useState, useEffect } from "react";

interface ExtendedDocument extends Document {
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface ExtendedHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    const doc = document as ExtendedDocument;

    // Check if fullscreen is supported
    setIsSupported(
      !!(
        doc.fullscreenEnabled ||
        doc.webkitFullscreenEnabled ||
        doc.mozFullScreenEnabled ||
        doc.msFullscreenEnabled
      )
    );

    const handleFullscreenChange = (): void => {
      setIsFullscreen(
        !!(
          doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
        )
      );
    };

    // Add event listeners for all browser variants
    const events = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange",
    ] as const;

    events.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
    });

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, []);

  const toggleFullscreen = async (): Promise<void> => {
    try {
      if (!isFullscreen) {
        const element = document.documentElement as ExtendedHTMLElement;

        // Try different browser implementations
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
      } else {
        const doc = document as ExtendedDocument;

        // Exit fullscreen using appropriate method
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  // Don't render if fullscreen isn't supported
  if (!isSupported) {
    return null;
  }

  return (
    <div>
      <button
        onClick={toggleFullscreen}
        onTouchEnd={toggleFullscreen}
        className="flex items-center justify-center text-white rounded-lg font-medium"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? (
          <>
            <Minimize size={20} />
            <span className="text-gray-400 text-xs ml-2">Exit Fullscreen</span>
          </>
        ) : (
          <>
            <Fullscreen size={20} />
            <span className="text-gray-400 text-xs ml-2">Fullscreen</span>
          </>
        )}
      </button>
    </div>
  );
}
