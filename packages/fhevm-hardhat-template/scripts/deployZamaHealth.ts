import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying ZamaHealth...");

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // 👉 USDC address (hardcoded)
  const usdcAddress = "0xE97040299F58c3a7a9d737BbbBADCde859ac800d";
  console.log("📋 Using USDCoin address:", usdcAddress);

  // Deploy ZamaHealth với USDC address trong constructor
  const deployedZamaHealth = await deploy("ZamaHealth", {
    from: deployer,
    args: [usdcAddress], // Pass USDC address to constructor
    log: true,
  });

  console.log("✅ ZamaHealth deployed to:", deployedZamaHealth.address);

  // 🔐 Cấu hình Backend Oracle cho ACL (ML backend address)
  const ML_BACKEND_ADDRESS = "0x0A4e5eC7600829002cb4564bBaf5E21027E64E2E";
  const zamaHealthContract = await hre.ethers.getContractAt(
    "ZamaHealth",
    deployedZamaHealth.address
  );

  const tx = await zamaHealthContract.setBackendOracle(ML_BACKEND_ADDRESS);
  await tx.wait();
  console.log("✅ Backend oracle configured:", ML_BACKEND_ADDRESS);

  console.log("🔗 Linked to USDCoin at:", usdcAddress);
  console.log("\n📋 Contract features:");
  console.log("   - Create health sessions (requires 10 USDC fee)");
  console.log("   - Submit encrypted health data with ACL for ML backend");
  console.log("   - Backend oracle can decrypt and process encrypted inputs");
  console.log("   - Receive encrypted analysis results");
  
  console.log("\n📝 Backend Oracle:");
  console.log("   - Address:", ML_BACKEND_ADDRESS);
  console.log("   - ML backend cần dùng private key của address này để decrypt dữ liệu");
}

// Run script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

