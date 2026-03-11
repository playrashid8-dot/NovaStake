const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const treasuryWallet = deployer.address;

  // Deploy NOVA token
  const NOVAToken = await hre.ethers.getContractFactory("NOVAToken");

  const token = await NOVAToken.deploy(
    deployer.address, // initialOwner
    deployer.address, // initialReceiver
    treasuryWallet    // treasury
  );

  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();

  console.log("NOVAToken deployed:", tokenAddress);

  // Deploy NovaStake
  const NovaStake = await hre.ethers.getContractFactory("NovaStake");

  const stake = await NovaStake.deploy(
    tokenAddress,
    treasuryWallet
  );

  await stake.waitForDeployment();

  const stakeAddress = await stake.getAddress();

  console.log("NovaStake deployed:", stakeAddress);

  // Exclude staking contract from token fees
  let tx = await token.setExcludedFromFees(stakeAddress, true);
  await tx.wait();

  console.log("Staking contract excluded from fees");

  // Fund reward pool
  const rewardPool = hre.ethers.parseUnits("500000000", 18);

  tx = await token.transfer(stakeAddress, rewardPool);
  await tx.wait();

  console.log("Reward pool funded");

  console.log("Deployment finished");
  console.log({
    tokenAddress,
    stakeAddress,
    treasuryWallet
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});