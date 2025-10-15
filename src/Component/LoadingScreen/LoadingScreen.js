import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ onFinish }) {
  const [step, setStep] = useState(0); // 0 = white, 1 = orange

  useEffect(() => {
    const timeout1 = setTimeout(() => setStep(1), 1500);
    const timeout2 = setTimeout(() => onFinish(), 3000);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [onFinish]);

  return (
    <div className={`loading-container ${step === 1 ? 'orange' : 'white'}`}>
      <h1 className={`logo-text ${step === 1 ? 'flip' : ''}`}>
        Fliplyn
      </h1>
    </div>
  );
}
