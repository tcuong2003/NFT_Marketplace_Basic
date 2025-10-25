require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config(); 

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: process.env.ALCHEMY_API_URL, // Alchemy API URL
      accounts: [process.env.PRIVATE_KEY], // Private key of the deployer account Metamask 
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};