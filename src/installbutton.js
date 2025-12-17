import React, { useEffect, useState } from "react";
import "./InstallButton.css";

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("User choice:", outcome);
    setShowButton(false);
    setDeferredPrompt(null);
  };

  if (!showButton) return null;

  return (
    <button className="install-button" onClick={handleInstall}>
      Install App
    </button>
  );
};

export default InstallButton;
