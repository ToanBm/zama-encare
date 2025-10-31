"use client";

import { useState, useEffect, useCallback } from "react";
import { useFhevmContext } from "../contexts/FhevmContext";
import { useHealthSessions } from "@/hooks/useHealthSessions";

interface HealthSession {
  sessionId: number;
  resultReady: boolean;
  createdAt?: string;
}

// Modal Component for Create Health Session Form
const CreateHealthSessionModal = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const {
    instance: fhevmInstance,
    ethersSigner,
    ethersReadonlyProvider,
    chainId,
  } = useFhevmContext();

  // Form states
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [exercise, setExercise] = useState("");
  const [diet, setDiet] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const { createSessionAndSubmit } = useHealthSessions({
    fhevmInstance,
    ethersSigner,
    ethersReadonlyProvider,
    chainId: chainId ?? null,
  });

  const handleSubmit = async () => {
    if (!fhevmInstance || !ethersSigner || !chainId) {
      setError("FHEVM instance or signer not ready");
      return;
    }

    // Validate inputs
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const exerciseNum = parseInt(exercise);
    const dietNum = parseInt(diet);

    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 300) {
      setError("Weight must be between 1-300 kg");
      return;
    }

    if (isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
      setError("Height must be between 1-300 cm");
      return;
    }

    if (isNaN(exerciseNum) || exerciseNum < 1 || exerciseNum > 5) {
      setError("Exercise level must be between 1-5");
      return;
    }

    if (isNaN(dietNum) || dietNum < 1 || dietNum > 10) {
      setError("Diet score must be between 1-10");
      return;
    }

    try {
      setStatus("loading");
      setError(null);
      const res = await createSessionAndSubmit({
        weight: weightNum,
        height: heightNum,
        exercise: exerciseNum,
        diet: dietNum,
      });
      if (res?.createdAt) setCreatedAt(res.createdAt);
      setStatus("success");
      setWeight("");
      setHeight("");
      setExercise("");
      setDiet("");
      setTimeout(() => {
        onSuccess();
        onClose();
        setStatus("idle");
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-[500px] mx-4 bg-primary border border-custom rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900">New Health Report</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-300 text-sm mb-4 w-full">
            Error: {error}
          </div>
        )}

        {status === "success" && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-300 text-sm mb-4 w-full">
            <div>✅ Session created and data encrypted successfully!</div>
            {createdAt && (
              <div className="text-xs text-green-200 mt-1">Created at: {createdAt}</div>
            )}
          </div>
        )}

        {/* Health Data Form */}
        <div className="w-full border border-custom rounded-xl pb-6 px-6 pt-0 bg-secondary mb-4">
          <h3 className="text-lg font-bold mb-4 text-gray-900 text-center pt-2">Your Health Information</h3>
            
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="text-base font-medium text-gray-900 whitespace-nowrap">
                  Weight (kg):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 70.5"
                  className="p-2 border border-custom rounded w-[30%] bg-primary text-gray-900 placeholder-gray-400 ml-auto"
                />
              </div>
              <p className="text-xs text-gray-700 mt-1">Enter weight in kilograms (1-300 kg)</p>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="text-base font-medium text-gray-900 whitespace-nowrap">
                  Height (cm):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 175.0"
                  className="p-2 border border-custom rounded w-[30%] bg-primary text-gray-900 placeholder-gray-400 ml-auto"
                />
              </div>
              <p className="text-xs text-gray-700 mt-1">Enter height in centimeters (1-300 cm)</p>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="text-base font-medium text-gray-900 whitespace-nowrap">
                  Exercise Level (1-5):
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  placeholder="1 = Sedentary, 5 = Very Active"
                  className="p-2 border border-custom rounded w-[30%] bg-primary text-gray-900 placeholder-gray-400 ml-auto"
                />
              </div>
              <p className="text-xs text-gray-700 mt-1">1 = Sedentary, 2 = Light, 3 = Moderate, 4 = Active, 5 = Very Active</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="text-base font-medium text-gray-900 whitespace-nowrap">
                  Diet Score (1-10):
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  placeholder="1 = Poor, 10 = Excellent"
                  className="p-2 border border-custom rounded w-[30%] bg-primary text-gray-900 placeholder-gray-400 ml-auto"
                />
              </div>
              <p className="text-xs text-gray-700 mt-1">Rate the quality of your diet (1-10)</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="btn-primary text-white font-bold py-2 px-4 w-full disabled:opacity-50 text-sm"
            >
              {status === "loading" ? "Processing..." : "Create Session & Encrypt Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Create = () => {
  const {
    status: fhevmStatus,
    error: fhevmError,
    isConnected,
    ethersSigner,
    ethersReadonlyProvider,
  } = useFhevmContext();

  const [sessions, setSessions] = useState<HealthSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusSessionId, setStatusSessionId] = useState<number | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fhevmContextMain = useFhevmContext();
  const { chainId } = fhevmContextMain;

  const { decryptResult } = useHealthSessions({
    fhevmInstance: fhevmContextMain.instance,
    ethersSigner,
    ethersReadonlyProvider,
    chainId: chainId ?? null,
  });

  const openStatusModal = async (sessionId: number) => {
    setIsStatusOpen(true);
    setStatusSessionId(sessionId);
    setDecrypting(true);
    setDecryptedResult(null);
    setStatusError(null);
    try {
      const value = await decryptResult(sessionId);
      if (value === null) {
        setDecryptedResult(null);
      } else {
        setDecryptedResult(value.toString());
      }
    } catch (e: unknown) {
      setStatusError(e instanceof Error ? e.message : "Failed to check status");
    } finally {
      setDecrypting(false);
    }
  };

  const { fetchMySessions } = useHealthSessions({
    fhevmInstance: fhevmContextMain.instance,
    ethersSigner,
    ethersReadonlyProvider,
    chainId: chainId ?? null,
  });

  // Fetch user sessions
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const items = await fetchMySessions();
      setSessions(items);
    } finally {
      setLoading(false);
    }
  }, [fetchMySessions]);

  useEffect(() => {
    if (isConnected && ethersSigner) {
      fetchSessions();
    }
  }, [isConnected, ethersSigner, fetchSessions]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Please connect your wallet</h2>
        <p className="text-gray-900">Use the wallet button above</p>
      </div>
    );
  }

  if (fhevmStatus === "error") {
    return <p className="text-red-600">FHEVM Error: {fhevmError?.message || "Unknown error"}</p>;
  }

  return (
    <div className="flex flex-col p-8 max-w-7xl mx-auto w-full">
      {/* Header with Create New button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Health History</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-white font-medium py-2 px-6 text-sm"
        >
          + Create New
        </button>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <p className="text-gray-900">Loading your health sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-custom rounded-xl bg-primary">
          <p className="text-gray-400 mb-4 text-lg">No health sessions yet</p>
          <p className="text-gray-500 text-sm mb-4">Create your first health session to get started</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-white font-bold py-2 px-6 text-sm"
          >
            Create First Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <div
              key={session.sessionId}
              className="border border-custom rounded-xl p-6 bg-secondary shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Health Report #{session.sessionId}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    session.resultReady
                      ? "bg-[#009CF5]/30 text-gray-900"
                      : "bg-yellow-500 text-gray-900"
                  }`}
                >
                  {session.resultReady ? "Result Ready" : "Pending"}
                </span>
              </div>
              <div className="border border-custom rounded-xl p-4 bg-primary">
                {session.createdAt && (
                  <div className="text-xs text-gray-900 mb-3">Created at: {session.createdAt}</div>
                )}
                <p className="text-sm text-gray-900 mb-4">
                  {session.resultReady
                    ? "Analysis completed. View results to see your health risk assessment."
                    : "Waiting for analysis results..."}
                </p>
                <button
                  onClick={() => openStatusModal(session.sessionId)}
                  className="px-2 py-1 rounded text-xs text-white bg-[#009CF5] hover:bg-[#0088d9]"
                >
                  {session.resultReady ? "View Results" : "Check"}
                </button>
              </div>
            </div>
          ))}
      </div>
      )}

      {/* Create Health Session Modal */}
      <CreateHealthSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchSessions(); // Refresh sessions after successful creation
        }}
      />

      {/* Session Status Modal */}
      {isStatusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-[480px] mx-4 bg-secondary border border-custom rounded-xl p-6">
            <button
              onClick={() => setIsStatusOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Report #{statusSessionId !== null ? statusSessionId : "-"}</h2>
            {statusError && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-300 text-sm mb-4">
                {statusError}
              </div>
            )}
            {decrypting ? (
              <p className="text-gray-900">Checking status...</p>
            ) : decryptedResult ? (
              (() => {
                const risk = Number(decryptedResult);
                const styles =
                  risk === 0
                    ? {
                        box: "bg-green-500/30 border border-green-500",
                        text: "text-green-700",
                      }
                    : risk === 1
                    ? {
                        box: "bg-yellow-500/30 border border-yellow-500",
                        text: "text-yellow-700",
                      }
                    : {
                        box: "bg-red-500/30 border border-red-500",
                        text: "text-red-700",
                      };
                const noteMessage =
                  risk === 0
                    ? "You’re in great shape! Keep up your current routine and stay active every day."
                    : risk === 1
                    ? "Your health is generally fine, but there’s room for improvement. Exercise more regularly and eat balanced meals."
                    : risk === 2
                    ? "Your health level needs attention. Consider consulting a doctor or nutritionist for a personalized plan."
                    : "";
                return (
                  <div className={`${styles.box} rounded p-3 flex justify-center`}>
                    <div className="w-full">
                      <p className={`text-base font-bold break-all text-center ${styles.text}`}>Decrypted Risk Score: {decryptedResult}</p>
                      {noteMessage && (
                        <div className="mt-2 bg-primary border border-custom rounded p-3">
                          <p className="text-sm font-bold text-gray-900 text-center">{noteMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-primary border border-custom rounded p-3">
                <p className="text-gray-900">Pending — waiting for analysis results...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
