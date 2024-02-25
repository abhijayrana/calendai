// pages/setup-lms.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import for useRouter
import CanvasSetup from './canvas/CanvasSetup';

const SetupLMS: React.FC = () => {
  const [selectedLMS, setSelectedLMS] = useState('');
  const router = useRouter();

  return (
    <div className="setup-lms">
      {selectedLMS === '' && (
        <div className="lms-selection">
          <h1>Choose an LMS</h1>
          <button className="lms-button" onClick={() => setSelectedLMS('canvas')}>
            Canvas
          </button>
        </div>
      )}
      {selectedLMS === 'canvas' && (
        <CanvasSetup onComplete={() => router.refresh()} setSelectedLMS={setSelectedLMS} />
      )}

      <style jsx>{`
        .setup-lms {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        .lms-selection {
          text-align: center;
        }
        .lms-button {
          background-color: #005f73; /* Darker blue */
          color: white;
          border: none;
          padding: 10px 20px;
          margin-top: 20px;
          cursor: pointer;
          border-radius: 5px;
          transition: background-color 0.3s ease;
        }
        .lms-button:hover {
          background-color: #0a9396; /* Lighter blue */
        }
      `}</style>
    </div>
  );
};

export default SetupLMS;
