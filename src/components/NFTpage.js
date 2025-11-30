import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function NFTPage (props) {

const [data, updateData] = useState({});
const [dataFetched, updateDataFetched] = useState(false);
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0x");

async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    var tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getListedTokenForId(tokenId);
    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    let meta = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);

    let item = {
        price: meta.price,
        tokenId: tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        creator: listedToken.creator,
        image: meta.image,
        name: meta.name,
        description: meta.description,
    }
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr)
    updateCurrAddress(addr);
}

async function buyNFT(tokenId) {
    try {
        const ethers = require("ethers");
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const salePrice = ethers.utils.parseUnits(data.price, 'ether')
        updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")
        //run the executeSale function
        let transaction = await contract.executeSale(tokenId, {value:salePrice});
        await transaction.wait();

        alert('You successfully bought the NFT!');
        updateMessage("");

        getNFTData(tokenId);
    }
    catch(e) {
        console.log(`Upload Error: ${e.message || e}`);
        updateMessage("");
    }
}

// Bán NFT
async function sellNFT(tokenId) {
    try {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const price = prompt("Enter sale price in ETH:");
        if (!price) return;

        const listingPrice = await contract.getListPrice();
        let transaction = await contract.sellNFT(tokenId, ethers.utils.parseUnits(price, 'ether'), { value: listingPrice });
        await transaction.wait();

        alert("NFT listed for sale!");
        getNFTData(tokenId);
    } catch (e) {
        alert(`Sell Error: ${e.message || e}`);
    }
}

// Hủy bán NFT
async function cancelSell(tokenId) {
    try {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

        let transaction = await contract.cancelListing(tokenId);
        await transaction.wait();

        alert("NFT sale cancelled!");
        getNFTData(tokenId);
    } catch (e) {
        alert(`Cancel Sell Error: ${e.message || e}`);
    }
}
async function transferNFT(tokenId) {
    try {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
            MarketplaceJSON.address,
            MarketplaceJSON.abi,
            signer
        );

        // Lấy địa chỉ người nhận
        const toAddress = prompt("Enter recipient wallet address:");
        if (!toAddress || !ethers.utils.isAddress(toAddress)) {
            alert("Invalid address!");
            return;
        }

        // Gọi hàm chuẩn ERC721: safeTransferFrom(from, to, tokenId)
        const transaction = await contract["transferNFT(address,uint256)"](
            toAddress,
            tokenId
        );
        await transaction.wait();

        alert("NFT transferred successfully!");
        getNFTData(tokenId);

    } catch (e) {
        console.log("Error transferring NFT:", e);
        console.log(`Transfer failed: ${e.message || e}`);
    }
}

async function deleteNFT(tokenId) {
    try {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

        let transaction = await contract.burnNFT(tokenId);
        await transaction.wait();

        alert("NFT deleted!");
        window.location.replace("/profile")
    } catch (e) {
        alert(`Delete Error: ${e.message || e}`);
    }
}


    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched)
        getNFTData(tokenId);
    if(typeof data.image == "string")
        data.image = GetIpfsUrlFromPinata(data.image);

    return(
        <div style={{"minHeight":"100vh"}}>
            <Navbar></Navbar>
            <div className="flex ml-20 mt-20">
                <img src={data.image} alt="" className="w-2/5" />
                <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                    <div>
                        Name: {data.name}
                    </div>
                    <div>
                        Description: {data.description}
                    </div>
                    <div>
                        Price: <span className="">{data.price + " ETH"}</span>
                    </div>
                    <div>
                        Owner: <span className="text-sm">{data.owner}</span>
                    </div>
                    <div>
                        Seller: <span className="text-sm">{data.seller}</span>
                    </div>
                    <div>
                        Creator: <span className="text-sm">{data.creator}</span>
                    </div>
                    <div>
                    { currAddress !== data.owner ? ( //address = contract
                         currAddress === data.seller ? (
                             <button
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                            onClick={() => cancelSell(tokenId)}
                            >
                            Cancel Sell
                            </button>
                        ) : (
                        <button
                        className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                        onClick={() => buyNFT(tokenId)}
                        >
                        Buy this NFT
                        </button>
                        )
                    ) : (
                        <div className="flex flex-col space-y-3">
                        <div className="text-emerald-400">You are the owner of this NFT</div>

                        {/* Nút Sell / Cancel Sell */}
                            <button
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-sm"
                            onClick={() => sellNFT(tokenId)}
                            >
                            Sell
                            </button>

                        {/* Nút Transfer */}
                        <button
                            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded text-sm"
                            onClick={() => transferNFT(tokenId)}
                        >
                            Transfer
                        </button>

                        {/* Nút Delete */}
                        <button
                            className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded text-sm"
                            onClick={() => deleteNFT(tokenId)}
                            >
                            Delete
                        </button>
                        </div>
                    )}
                

                    <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}