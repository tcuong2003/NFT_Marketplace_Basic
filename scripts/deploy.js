const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Marketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = await Marketplace.deploy();

  await marketplace.deployed();

  console.log("✅ NFTMarketplace deployed to:", marketplace.address);

  const data = {
    address: marketplace.address,
    abi: JSON.parse(marketplace.interface.format('json')),
  };

  fs.writeFileSync("./src/Marketplace.json", JSON.stringify(data));
  console.log("📁 Marketplace.json updated successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
