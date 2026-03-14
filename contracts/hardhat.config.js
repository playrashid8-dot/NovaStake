require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "paris",
    },
  },

  networks: {
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },

  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY
  },
};