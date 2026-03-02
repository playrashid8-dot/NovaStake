const hre = require("hardhat");

async function main() {
  const Nova = await hre.ethers.getContractFactory("NovaDeFi");

  const contract = await Nova.deploy(
    "0x55d398326f99059fF775485246999027B3197955", // USDT BSC
    "0x55B9a936b9A8640eb2eC2C0c9b220b478C4b82ca"
  );

  await contract.waitForDeployment();

  console.log("NovaDeFi deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});