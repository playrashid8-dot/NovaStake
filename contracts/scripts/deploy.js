const hre = require("hardhat");

async function main() {
  const USDT = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
  const TREASURY = "0xeA94332704ecA08CABDF0447312FE7640F0E28d7";

  const Nova = await hre.ethers.deployContract("NovaDeFi", [USDT, TREASURY]);

  await Nova.waitForDeployment();

  console.log("NovaDeFi deployed to:", await Nova.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});