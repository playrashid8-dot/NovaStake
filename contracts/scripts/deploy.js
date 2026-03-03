const hre = require("hardhat");

async function main() {
  const USDT = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
  const TREASURY = "0xaAbCCBEF90Fd8A6d03Dd3A37F466Ca6F4Fa55872";

  const Nova = await hre.ethers.deployContract("NovaDeFiV2", [USDT, TREASURY]);

  await Nova.waitForDeployment();

  console.log("NovaDeFiV2 deployed to:", await Nova.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});