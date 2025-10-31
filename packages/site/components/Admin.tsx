"use client";

import { useState, useEffect } from "react";
import { useFhevmContext } from "../contexts/FhevmContext";
import { Contract, ethers } from "ethers";
import { ZamaHealthABI } from "@/abi/ZamaHealthABI";
import { ZamaHealthAddresses } from "@/abi/ZamaHealthAddresses";

export const Admin = () => {
  const {
    ethersSigner,
    ethersReadonlyProvider,
    chainId,
    isConnected,
  } = useFhevmContext();

  const [owner, setOwner] = useState<string>("");
  const [backendOracle, setBackendOracle] = useState<string>("");
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [userAddress, setUserAddress] = useState<string>("");
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [updateOracleLoading, setUpdateOracleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Session stats
  const [totalSessions, setTotalSessions] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [pendingSessions, setPendingSessions] = useState(0);

  // Withdraw form
  const [withdrawAddress, setWithdrawAddress] = useState("");
  
  // Update backend oracle form
  const [newBackendOracle, setNewBackendOracle] = useState("");

  const getContract = () => {
    if ((!ethersSigner && !ethersReadonlyProvider) || !chainId) return null;
    const contractAddress = ZamaHealthAddresses[chainId.toString() as keyof typeof ZamaHealthAddresses]?.address;
    if (!contractAddress) {
      console.error(`ZamaHealth contract not deployed on chain ${chainId}`);
      return null;
    }
    return {
      contract: new Contract(contractAddress, ZamaHealthABI.abi, ethersSigner || ethersReadonlyProvider),
      address: contractAddress
    };
  };

  // Load admin data
  const loadData = async () => {
    if (!ethersSigner) return;

    try {
      setLoading(true);
      const contractData = getContract();
      if (!contractData) return;

      const { contract } = contractData;
      const address = await ethersSigner.getAddress();
      setUserAddress(address);

      // Fetch contract info
      const contractOwner = await contract.owner();
      const currentBackendOracle = await contract.backendOracle();
      const balance = await contract.contractBalance();
      const nextSessionId = await contract.nextSessionId();

      setOwner(contractOwner);
      setBackendOracle(currentBackendOracle);
      setContractBalance(ethers.formatUnits(balance, 6)); // USDC has 6 decimals
      setIsOwner(address.toLowerCase() === contractOwner.toLowerCase());

      // Fetch session stats
      let completed = 0;
      let pending = 0;
      for (let i = 0; i < Number(nextSessionId); i++) {
        try {
          const session = await contract.sessions(i);
          if (session.exists) {
            if (session.resultReady) {
              completed++;
            } else if (session.user !== ethers.ZeroAddress) {
              pending++;
            }
          }
        } catch {
          continue;
        }
      }
      
      setTotalSessions(Number(nextSessionId));
      setCompletedSessions(completed);
      setPendingSessions(pending);
    } catch (err: unknown) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && ethersSigner) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, ethersSigner, chainId]);

  // Listen to SessionCreated events to auto-refresh stats
  useEffect(() => {
    const contractData = getContract();
    if (!contractData) return;
    const { contract } = contractData;

    const onSessionCreated = () => {
      // refresh counts when new session is created
      loadData();
    };

    try {
      contract.on("SessionCreated", onSessionCreated);
    } catch {}

    return () => {
      try {
        contract.off("SessionCreated", onSessionCreated);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, ethersSigner, ethersReadonlyProvider, chainId]);

  // Withdraw fees
  const handleWithdraw = async () => {
    if (!withdrawAddress || !ethers.isAddress(withdrawAddress)) {
      setError("Invalid address");
      return;
    }

    try {
      setWithdrawLoading(true);
      setError(null);
      setSuccess(null);

      const contractData = getContract();
      if (!contractData) return;

      const { contract } = contractData;
      const tx = await contract.withdrawFees(withdrawAddress);
      
      setSuccess("Transaction sent! Waiting for confirmation...");
      await tx.wait();
      
      setSuccess(`✅ Successfully withdrew ${contractBalance} USDC to ${withdrawAddress}`);
      setWithdrawAddress("");
      await loadData(); // Refresh balance
    } catch (err: unknown) {
      console.error("Error withdrawing:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Update backend oracle
  const handleUpdateBackendOracle = async () => {
    if (!newBackendOracle || !ethers.isAddress(newBackendOracle)) {
      setError("Invalid address");
      return;
    }

    try {
      setUpdateOracleLoading(true);
      setError(null);
      setSuccess(null);

      const contractData = getContract();
      if (!contractData) return;

      const { contract } = contractData;
      const tx = await contract.setBackendOracle(newBackendOracle);
      
      setSuccess("Transaction sent! Waiting for confirmation...");
      await tx.wait();
      
      setSuccess(`✅ Successfully updated backend oracle to ${newBackendOracle}`);
      setNewBackendOracle("");
      await loadData(); // Refresh data
    } catch (err: unknown) {
      console.error("Error updating backend oracle:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setUpdateOracleLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Please connect your wallet</h2>
      </div>
    );
  }

  if (loading && !owner) {
    return (
      <div className="flex justify-center items-center p-8">
          <p className="text-gray-900">Loading admin data...</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-custom rounded-xl bg-primary">
        <p className="text-gray-400 mb-4 text-lg">🔒 Admin Access Only</p>
        <p className="text-gray-500 text-sm mb-4">
          Your address: {userAddress.substring(0, 10)}...
        </p>
        <p className="text-gray-500 text-sm">
          Contract owner: {owner.substring(0, 10)}...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <button
          onClick={loadData}
          className="btn-primary text-white font-medium py-2 px-4 text-base"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-300 text-sm mb-4">
          ❌ Error: {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-300 text-sm mb-4">
          {success}
        </div>
      )}

      {/* Top Section: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {/* 🏥 Session Stats */}
        <div className="border border-custom rounded-xl p-6 bg-secondary shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Session Dashboard</h2>
          
          <div className="flex justify-between -mx-1">
            <div className="bg-secondary/50 rounded-lg p-4 flex-1">
              <div className="text-gray-700 text-sm font-semibold mb-2">Total Sessions</div>
              <div className="text-3xl font-bold text-gray-900">{totalSessions}</div>
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-4 flex-1">
              <div className="text-gray-700 text-sm font-semibold mb-2">Completed</div>
              <div className="text-3xl font-bold text-green-400">{completedSessions}</div>
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-4 flex-1">
              <div className="text-gray-700 text-sm font-semibold mb-2">Pending</div>
              <div className="text-3xl font-bold text-yellow-400">{pendingSessions}</div>
            </div>
          </div>
        </div>

        {/* 💰 Fee Management */}
        <div className="border border-custom rounded-xl p-6 bg-secondary shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Revenue & Fees</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Recipient Address:
              </label>
              <input
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="0x..."
                className="p-2 border border-custom rounded w-full bg-secondary text-gray-900 placeholder-gray-400"
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded">
              <span className="text-gray-700 text-sm font-semibold">Available:</span>
              <span className="text-gray-900 font-bold text-base">{contractBalance} USDC</span>
            </div>
            
            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading || !withdrawAddress || contractBalance === "0.0"}
              className="btn-primary text-white font-medium py-2 px-4 w-full disabled:opacity-50"
            >
              {withdrawLoading ? "Processing..." : "Withdraw All Fees"}
            </button>
          </div>
        </div>
      </div>

      {/* ⚙️ Backend Oracle Settings */}
      <div className="border border-custom rounded-xl p-6 bg-secondary shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Backend Oracle</h2>
        
        <div className="bg-secondary/30 rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 text-sm font-semibold">Current Backend Oracle:</span>
            <span className="text-gray-900 font-mono text-base break-all">{backendOracle || "Not set"}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              New Backend Oracle Address:
            </label>
            <input
              type="text"
              value={newBackendOracle}
              onChange={(e) => setNewBackendOracle(e.target.value)}
              placeholder="0x..."
              className="p-2 border border-custom rounded w-full bg-secondary text-gray-900 placeholder-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              This address will be able to decrypt health data (ACL permission)
            </p>
          </div>
          
          <button
            onClick={handleUpdateBackendOracle}
            disabled={updateOracleLoading || !newBackendOracle}
            className="btn-primary text-white font-medium py-2 px-4 w-full disabled:opacity-50"
          >
            {updateOracleLoading ? "Processing..." : "Update Backend Oracle"}
          </button>
        </div>
      </div>
    </div>
  );
};

