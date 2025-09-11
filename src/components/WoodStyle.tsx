export const WoodStyles = () => (
  <style jsx>{`
    .wood-grain {
      background-image: linear-gradient(
          45deg,
          rgba(101, 67, 33, 0.15) 25%,
          transparent 25%
        ),
        linear-gradient(-45deg, rgba(101, 67, 33, 0.15) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(101, 67, 33, 0.15) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(101, 67, 33, 0.15) 75%);
      background-size: 24px 24px;
      background-position: 0 0, 0 12px, 12px -12px, -12px 0px;
    }

    .wood-texture {
      background-image: repeating-linear-gradient(
          0deg,
          rgba(92, 51, 23, 0.1),
          rgba(92, 51, 23, 0.1) 2px,
          transparent 2px,
          transparent 6px
        ),
        repeating-linear-gradient(
          90deg,
          rgba(139, 69, 19, 0.08),
          rgba(139, 69, 19, 0.08) 3px,
          transparent 3px,
          transparent 12px
        );
    }

    .wood-panel {
      background: linear-gradient(
        135deg,
        #8b4513 0%,
        #a0522d 15%,
        #cd853f 30%,
        #daa520 45%,
        #cd853f 60%,
        #a0522d 75%,
        #8b4513 90%,
        #654321 100%
      );
      box-shadow: inset 0 2px 4px rgba(205, 133, 63, 0.4),
        inset 0 -2px 4px rgba(0, 0, 0, 0.6), 0 8px 32px rgba(0, 0, 0, 0.4);
    }

    .wood-button {
      background: linear-gradient(
        135deg,
        #8b4513 0%,
        #654321 50%,
        #5c3317 100%
      );
      box-shadow: inset 0 2px 0 rgba(205, 133, 63, 0.5),
        inset 0 -2px 0 rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4);
      border: 2px solid rgba(139, 69, 19, 0.6);
    }

    .wood-button:hover {
      background: linear-gradient(
        135deg,
        #a0522d 0%,
        #8b4513 50%,
        #654321 100%
      );
      box-shadow: inset 0 2px 0 rgba(205, 133, 63, 0.6),
        inset 0 -2px 0 rgba(0, 0, 0, 0.6), 0 6px 20px rgba(0, 0, 0, 0.5);
      border-color: rgba(160, 82, 45, 0.8);
    }

    .wood-button:active {
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4),
        inset 0 -1px 2px rgba(205, 133, 63, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .wood-stat-card {
      background: linear-gradient(
        135deg,
        rgba(139, 69, 19, 0.3) 0%,
        rgba(160, 82, 45, 0.2) 50%,
        rgba(101, 67, 33, 0.3) 100%
      );
      border: 2px solid rgba(139, 69, 19, 0.5);
      box-shadow: inset 0 1px 2px rgba(205, 133, 63, 0.3),
        inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .wood-background {
      background: linear-gradient(
        135deg,
        rgba(92, 51, 23, 0.95) 0%,
        rgba(139, 69, 19, 0.9) 25%,
        rgba(160, 82, 45, 0.85) 50%,
        rgba(139, 69, 19, 0.9) 75%,
        rgba(101, 67, 33, 0.95) 100%
      );
    }
  `}</style>
);
