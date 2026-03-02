const hre = require("hardhat");

async function main() {

  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT

  const NovaDeFi = await hre.ethers.getContractFactory("NovaDeFiV2");

  const contract = await NovaDeFi.deploy(USDT_ADDRESS);

  await contract.waitForDeployment();

  console.log("NovaDeFiV2 deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});