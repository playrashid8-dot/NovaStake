require("@nomicfoundation/hardhat-verify");

module.exports = {
  solidity: "0.8.20",
  networks: {
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: ["PRIVATE_KEY"]
    }
  },
  etherscan: {
    apiKey: {
      bsc: "BSCSCAN_API_KEY"
    }
  }
};