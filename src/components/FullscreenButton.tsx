import React, { useState, useEffect } from "react";

const FullscreenButton: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async (): Promise<void> => {
    try {
      if (!document.fullscreenElement) {
        // HTMLElement má v TS definovanú metódu requestFullscreen()
        await document.documentElement.requestFullscreen();
      } else {
        // Document má definovanú metódu exitFullscreen()
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen sa nepodarilo aktivovať:", error);
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: 9999,
        padding: "10px 15px",
        backgroundColor: isFullscreen ? "#ff4d4d" : "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        fontWeight: "bold",
      }}
    >
      {isFullscreen ? "📺" : "📱"}
    </button>
  );
};

export default FullscreenButton;
