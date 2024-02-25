"use client";
// components/CanvasSetup.tsx
import React, { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";

interface CanvasSetupProps {
  onComplete: () => void; // Callback function when setup is completed
  setSelectedLMS: React.Dispatch<React.SetStateAction<string>>;
}

const CanvasSetup: React.FC<CanvasSetupProps> = ({
  onComplete,
  setSelectedLMS,
}) => {
  const [canvasUrl, setCanvasUrl] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const mutateUserLMS = trpc.user.addLMStoUser.useMutation();
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  const handleComplete = () => {
    console.log(user);
    // Define a regular expression pattern to match the expected token format
    // This example assumes the token starts with 1~, followed by a mix of alphanumeric characters
    // Adjust the pattern as necessary based on the actual token format you expect

    // Initial checks before applying the main regex pattern
    if (!apiToken.includes("~")) {
      console.log("The API token must contain a '~'.");
      alert(
        "The API token format is incorrect. Please ensure it includes a '~'."
      );
      return;
    }

    const parts = apiToken.split("~");
    if (parts.length !== 2) {
      console.log(
        "The API token format is incorrect. There should be a part before and after the '~'."
      );
      alert(
        "The API token format is incorrect. Please check it and try again."
      );
      return;
    }

    const [prefix, tokenPart] = parts;

    // Check if prefix is numeric
    if (!/^\d+$/.test(prefix)) {
      console.log("The prefix (part before the '~') must be numeric.");
      alert("The prefix of the API token is invalid. It should be numeric.");
      return;
    }

    // Assuming mutateUserLMS.mutate is an asynchronous operation
    // You might want to await its completion or handle it accordingly
    const returnedUser = mutateUserLMS.mutate({
      id: user!.id,
      lms: "canvas",
      lmsUrl: canvasUrl,
      lmsToken: apiToken,
    });

    console.log({ returnedUser });
    onComplete();

    console.log({ canvasUrl, apiToken });
  };

  return (
    <div className="setup-lms">
      <h1>Setup Your Canvas LMS</h1>
      <p>Estimated setup time is 2 mins</p>
      <div className="input-group">
        <label htmlFor="canvasUrl">Canvas URL</label>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="text"
            id="canvasUrl"
            value={canvasUrl}
            onChange={(e) => setCanvasUrl(e.target.value)}
            placeholder="yourinstitution"
            style={{ marginRight: "8px" }}
          />
          <span>.instructure.com</span>
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="apiToken">User API Token</label>
        <input
          //   type="password" // Use password type to obscure token
          id="apiToken"
          value={apiToken}
          onChange={(e) => setApiToken(e.target.value)}
          placeholder="Enter your API token"
        />
        <button onClick={() => setShowModal(true)}>
          <u>(how?)</u>
        </button>
      </div>

      {showModal && (
        <div className="modal">
          <p>How to get your API token:</p>
          <ul>
            <li>Log in to your Canvas account.</li>
            <li>Go to Settings.</li>
            <li>
              Scroll down to Approved Integrations and click on the New Access
              Token button.
            </li>
            <li>Follow the instructions to generate a new token.</li>
          </ul>
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      )}

      <div className="navigation-buttons">
        <button onClick={() => setSelectedLMS("")}>Change LMS</button>
        <button onClick={handleComplete}>Complete Setup</button>
      </div>

      <style jsx>{`
        .input-group {
          margin-bottom: 20px;
        }
        input {
          padding: 10px;
          margin-right: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1000; // Ensure modal is above other content
        }
        .navigation-buttons button {
          padding: 10px 20px;
          margin-top: 20px;
          border: none;
          background-color: #0070f3;
          color: white;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default CanvasSetup;
