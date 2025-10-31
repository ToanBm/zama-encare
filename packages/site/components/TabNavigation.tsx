"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useTab } from "@/contexts/TabContext";
import { useFhevmContext } from "../contexts/FhevmContext";
import { USDCoinABI } from "@/abi/USDCoinABI";
import { USDCoinAddresses } from "@/abi/USDCoinAddresses";

export const TabNavigation = () => {
  const { activeTab, setActiveTab } = useTab();
  
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setActiveTab("healthcheck")}
        className={`font-medium h-9 px-4 transition-colors min-w-[120px] text-base ${
          activeTab === "healthcheck"
            ? "btn-primary text-white"
            : "text-gray-900 btn-transparent"
        }`}
      >
        Health Check
      </button>
      <button
        onClick={() => setActiveTab("admin")}
        className={`font-medium h-9 px-4 transition-colors min-w-[120px] text-base ${
          activeTab === "admin"
            ? "btn-primary text-white"
            : "text-gray-900 btn-transparent"
        }`}
      >
        Admin
      </button>
    </div>
  );
};

export const FaucetButton = () => {
  const [isMinting, setIsMinting] = useState(false);
  const { ethersSigner, chainId } = useFhevmContext();

  const handleMint = async () => {
    if (!ethersSigner || isMinting || !chainId) return;
    
    try {
      setIsMinting(true);
      const usdcAddress = USDCoinAddresses[chainId.toString() as keyof typeof USDCoinAddresses]?.address;
      if (!usdcAddress) {
        alert(`USDCoin contract not deployed on chain ${chainId}`);
        return;
      }

      const usdcContract = new ethers.Contract(usdcAddress, USDCoinABI.abi, ethersSigner);
      const tx = await usdcContract.userMint();
      alert("Transaction submitted! Waiting for confirmation...");
      await tx.wait();
      alert("✅ Minted 1000 USDC successfully!");
    } catch (error: unknown) {
      console.error('Error minting USDC:', error);
      alert(`Mint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <button
      onClick={handleMint}
      disabled={isMinting}
      className="bg-primary border-2 border-[#FF6A00] text-gray-900 font-medium h-9 px-4 min-w-[100px] text-base disabled:opacity-50"
      style={{ borderRadius: '8px' }}
    >
      {isMinting ? 'Minting...' : 'Faucet'}
    </button>
  );
};
