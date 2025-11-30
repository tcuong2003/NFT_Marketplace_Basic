HƯỚNG DẪN RUN PROJECT VÀ GIẢI THÍCH

Bước 1: Cài đặt NodeJS trong global terminal

- Windows: truy cập https://nodejs.org/

- Macos: brew install node (nếu đã có brew)

Kiểm tra 

- node -v

- npm -v


Bước 2: Truy cập vào dự án, run các lệnh theo thứ tự

- npm install (Cài toàn bộ thư viện trong package.json)

hoặc npm install --legacy-peer-deps (nếu gặp xung đột phiên bản)

- npx hardhat compile (done khi có artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json)

* biên dịch Smart Contract (file .sol) bằng Solidity compiler.

* Trong file .json này chứa:
    Thành phần	                        Vai trò
    ABI (Application Binary Interface)	Giúp frontend gọi hàm smart contract (vd: buyNFT(), listNFT())
    Bytecode	                        Dùng để deploy contract lên blockchain
    Metadata	                        Thông tin compiler, version, optimization

* Frontend (React) không hiểu Solidity, nhưng nó có thể gọi được Smart Contract (blockchain) thông qua ABI.

- Sửa file .env-example -> .env và điền theo yêu cầu trong file

* Alchemy là một nền tảng dev-blockchain cung cấp “node as a service” cho các mạng như Ethereum, Polygon,… giúp bạn không phải tự vận hành node full-node, kết nối tới node của Alchemy để gửi giao dịch và tương tác mạng

* private-key: Smart contract được deploy bởi một tài khoản Ethereum (ví dụ tài khoản MetaMask). Để gửi giao dịch deploy, bạn cần ký giao dịch đó bằng private key của tài khoản deployer. Nếu bạn chỉ dùng node mà không có private key, bạn không thể ký = không thể deploy, deploy lên testnet/mainnet bằng mạng thật

* pinata: Pinata là một dịch vụ lưu trữ và “pinning service” cho IPFS (InterPlanetary File System), Khi bạn upload file (hình ảnh NFT, metadata JSON) lên Pinata, file đó sẽ được “pin” lên các node IPFS để đảm bảo luôn khả dụng (không bị garbage-collected) và có thể truy cập thông qua gateway HTTP hoặc IPFS
    
    Bạn lưu image + metadata lên IPFS qua Pinata → file sẽ có một CID (Content Identifier) ≈ Qm…
    Trong Smart Contract hoặc front-end bạn dùng URI kiểu ipfs://<CID> hoặc qua gateway như https://gateway.pinata.cloud/ipfs/<CID> để tải ảnh/metadatas.

    Nhờ Pinata pin file liên tục nên khả năng file bị mất hoặc không truy cập được sẽ thấp hơn nhiều.

    Hình ảnh hoặc nội dung của NFT (ví dụ: file .png, .mp4), Metadata JSON cho mỗi token – thường chứa name, description, image, attributes

- npx hardhat run scripts/deploy.js --network sepolia

* Hardhat sẽ chạy file deploy.js
* Deploy smart contract NFTMarketplace.sol lên blockchain mạng Sepolia Testnet
* Sau khi deploy, Hardhat sẽ in ra địa chỉ contract (Contract Address) mới được tạo

    Thành phần	                Ý nghĩa
    Contract Address	        Địa chỉ duy nhất của smart contract trên blockchain
    Node/Frontend	            Sử dụng địa chỉ này để tương tác với contract
    Không thể thay đổi	        Mỗi lần deploy mới → ra địa chỉ mới hoàn toàn

* Frontend (React app) cần 2 thứ để giao tiếp với Blockchain:

    File	                    Vai trò
    Marketplace.json (ABI)	    Định nghĩa hàm có thể gọi trên contract
    Contract Address	        Nơi contract tồn tại trên blockchain

* Khi deploy contract mới -> address mới thì NFT user đã sở hữu ✅ (vì dữ liệu lưu trên ví), istings, offers, giao dịch cũ ❌(vì dữ liệu lưu trên contract)

* Cập nhật Solidity = Deploy lại contract, Cập nhật frontend = Không cần deploy

- npm start (chạy localhost)


NOTE:

- TH1: khi adr A mint token mới (nft của ví A): 
owner = adrA
seller = 0x00
creator: adrA

- TH3: nft của adrA bán lên marketplace
owner: contract
seller: adrA
creator: adrA

- TH4: adrB mua token của adrA trên marketplace
owner: adrB
seller: adrA
creator: adrA

- TH6: NFT adrB bị huỷ niêm yết (cancel listing), không bán trên marketplace
về lại adrB
owner: adrB
seller: 0x00
creator: adrA

- TH7: adrA tặng adrB tặng NFT (transfer mà không bán)
owner: 0x00
seller: adrB
creator: adrA

- TH8: Marketplace bị burn (NFT bị xoá)
owner: 0x00
seller: 0x00
creator: adrA


Profile 
- nft: 3 btn: Sell (Cancel Sell), Delete, Tranfer

Marketplace:
- nft: buy, owner

1️⃣ Mint

Ý nghĩa: Tạo mới một token hoặc NFT trên blockchain.

Ví dụ: Creator mint một NFT → NFT xuất hiện trên blockchain, creator là owner.

Giống: “Đúc tiền mới” trong ngân hàng.

2️⃣   

Ý nghĩa: Hủy hoặc xóa token/NFT khỏi blockchain vĩnh viễn.

Ví dụ: Chủ sở hữu burn NFT → NFT biến mất, không thể khôi phục.

Lưu ý: Chỉ owner hoặc người được quyền mới burn được.

3️⃣ Transfer

Ý nghĩa: Chuyển token/NFT từ người này sang người khác.

Ví dụ: Gửi ETH cho bạn bè hoặc chuyển NFT từ ví bạn sang marketplace.

4️⃣ Owner / Holder

Owner: Người sở hữu token/NFT hiện tại.

Holder: Người đang giữ token/NFT, thường dùng cho token ERC20.

5️⃣ Approval

Ý nghĩa: Cho phép một contract hoặc người khác quản lý token/NFT của bạn.

Ví dụ: Khi list NFT lên marketplace, creator phải approve contract marketplace để contract có thể chuyển NFT.

6️⃣ Listing / Minting for Sale

Listing: Đưa NFT/token lên marketplace để bán.

Ví dụ: NFT creator list NFT → contract giữ NFT → người khác có thể mua.

7️⃣ Buy / Purchase

Ý nghĩa: Người khác trả tiền (ETH hoặc token) để sở hữu NFT/token đang list.

8️⃣ Royalty

Ý nghĩa: Tiền bản quyền mà creator nhận khi NFT được bán lại trên secondary market.

Ví dụ: Creator đặt 5% royalty → mỗi lần NFT được bán lại, 5% giá bán về ví creator.

9️⃣ Smart Contract

Ý nghĩa: Hợp đồng tự động chạy trên blockchain, thực thi các điều kiện khi sự kiện xảy ra.

Ví dụ: Marketplace NFT là smart contract quản lý mint, buy, cancel, transfer.

🔟 Blockchain Network / Chain

Mainnet: Mạng chính (ví dụ Ethereum Mainnet).

Testnet: Mạng thử nghiệm (ví dụ Sepolia, Goerli) để dev test mà không mất tiền thật.

1️⃣1️⃣ Token Standards

ERC20: Token chuẩn fungible (có thể thay thế lẫn nhau, ví dụ USDT).

ERC721: Token chuẩn NFT (unique, không thay thế lẫn nhau).

ERC1155: Token hỗn hợp (có thể là NFT hoặc token fungible trong cùng contract).

1️⃣2️⃣ Wallet / Ví

Ví cá nhân: Nơi bạn lưu private key để quản lý NFT, token.

Ví phổ biến: MetaMask, TrustWallet, Coinbase Wallet.

1️⃣3️⃣ Gas / Gas Fee

Ý nghĩa: Phí thực hiện giao dịch trên blockchain.

Ví dụ: Mint NFT, Transfer ETH hay Buy NFT đều tốn gas.

1️⃣4️⃣ Contract Address

Ý nghĩa: Địa chỉ trên blockchain của smart contract.

Ví dụ: Marketplace contract có địa chỉ → nơi NFT được giữ và giao dịch.


//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
//ERC721URIStorage: lưu trữ và quản lý URI (Uniform Resource Identifier) cho từng NFT
//URI: link đến metadata (chứa link IPFS hoặc URL ảnh/video) của NFT
contract NFTMarketplace is ERC721URIStorage {
    address payable owner; //địa chỉ chủ sàn

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; //mỗi lần mint nft thì biến tăng lên 1 và làm tokenId cho NFT mới.
    Counters.Counter private _itemsSold; //_itemsSold: số lượng nft đã được bán

    uint256 listPrice = 0.001 ether; //phí khi người dùng tạo nft

    //ERC721: ERC-721 là chuẩn (standard) trên Ethereum quy định cách tạo và quản lý các token không thể thay thế (NFT)
    //Non-Fungible Token Standard vì mỗi token nft là duy nhất
    constructor() ERC721("NFT Marketplace", "NFTM") {
        owner = payable(msg.sender); 
    }
    //cấu trúc token được niêm yết
    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        address payable creator;
        uint256 price;
        bool currentlyListed;
    }
    //idToListedToken[uint256] return về ListedToken
    mapping (uint256 => ListedToken) private idToListedToken; //truy xuất thông tin NFT bằng Id
    
    //không cần
    function updateListPrice(uint256 _listPrice) public payable { //cập nhật phí sàn
        require(owner == msg.sender, "Only owner can update listing price");
        listPrice = _listPrice;
    }

    function getListPrice() public view returns (uint256) { //xem phí list nft lên sàn
        return listPrice;
    }   

    function getLatestIdToListedToken() public view returns (ListedToken memory) {//lấy ra nft gần nhất được tạo
        uint256 currentTokenId = _tokenIds.current();
        return idToListedToken[currentTokenId]; // trả về token
    }

    function getListedTokenForId(uint256 tokenId) public view returns (ListedToken memory) { //lấy thông tin chi tiết NFT theo id
        return idToListedToken[tokenId];
    }


    //bỏ thay bằng _tokenIds.current()
    function getCurrentToken() public view returns (uint256) { //lấy id của token
        return _tokenIds.current();
    }

    // Mint NFT mới và tạo listing mặc định
    function createToken(string memory tokenURI, uint256 price) public payable returns (uint) {
        require(msg.value == listPrice, "Send enough ether to cover listing price");
        require(price > 0, "Make sure the price is greater than 0");
        
        //tăng token id
        _tokenIds.increment();
        uint256 currentTokenId = _tokenIds.current();

        // Mint NFT vào contract (owner = adr ví)
        _safeMint(msg.sender, currentTokenId);

        // Gán metadata URI
        _setTokenURI(currentTokenId, tokenURI);
        
        // Tạo Listing NFT
        createListedToken(currentTokenId, price);

        return currentTokenId;
    }

    function createListedToken(uint256 tokenId, uint256 price) private {
        idToListedToken[tokenId] = ListedToken({
        tokenId: tokenId,
        owner: payable(msg.sender),    // NFT nằm trong Marketplace
        seller: payable(address(0)),      // Chưa có người bán
        creator: payable(msg.sender),     // Người tạo NFT
        price: price,
        currentlyListed: true
    });
        // _transfer(msg.sender, address(this), tokenId);
    }

    function sellNFT(uint256 tokenId, uint256 price) public payable{
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(price > 0, "Price must be greater than zero");

        // Chuyển NFT vào marketplace
        _transfer(msg.sender, address(this), tokenId);

        idToListedToken[tokenId].owner = payable(address(this));
        idToListedToken[tokenId].seller = payable(msg.sender);
        idToListedToken[tokenId].price = price;
        idToListedToken[tokenId].currentlyListed = true;
    }

    function cancelListing(uint256 tokenId) public {
        ListedToken storage listedToken = idToListedToken[tokenId];
        
        require(listedToken.currentlyListed == true, "NFT is not listed");
        require(listedToken.seller == msg.sender, "Only seller can cancel the listing");

        // Chuyển NFT từ Marketplace contract trở về owner
        _transfer(address(this), msg.sender, tokenId);

        // Cập nhật lại trạng thái ListedToken
        listedToken.owner = payable(msg.sender);      // chủ sở hữu trở về người bán
        listedToken.seller = payable(address(0));     // reset seller
        listedToken.currentlyListed = false;          // không còn được niêm yết
    }

    // Chỉ chủ sở hữu mới có thể transfer
    function transferNFT(address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(to != address(0), "Cannot transfer to zero address");

        idToListedToken[tokenId].owner = payable(to);
        idToListedToken[tokenId].seller = payable(address(0));
        idToListedToken[tokenId].currentlyListed = false;
        
        // Chuyển NFT
        _transfer(msg.sender, to, tokenId);
    }


    // Chỉ chủ sở hữu mới được burn
    function burnNFT(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        
        // Xóa khỏi mapping marketplace nếu đang listed
        delete idToListedToken[tokenId];

        // Xóa token
        _burn(tokenId);
    }

    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint nftCount = _tokenIds.current();

        // Dự phòng mảng có kích thước tối đa
        ListedToken[] memory tempTokens = new ListedToken[](nftCount);
        uint currentIndex = 0;

        for (uint i = 1; i <= nftCount; i++) {
            ListedToken storage currentItem = idToListedToken[i];
            if (currentItem.owner == address(this)) {
                tempTokens[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        // Tạo mảng kết quả có kích thước chính xác
        ListedToken[] memory tokens = new ListedToken[](currentIndex);
        for (uint j = 0; j < currentIndex; j++) {
            tokens[j] = tempTokens[j];
        }

        return tokens;
    }

    function getMyNFTs() public view returns (ListedToken[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        // Đếm số NFT có owner = ví hiện tại
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToListedToken[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        // Tạo mảng kết quả
        ListedToken[] memory items = new ListedToken[](itemCount);

        // Lặp lại để lấy dữ liệu NFT có owner = msg.sender
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToListedToken[i + 1].owner == msg.sender) {
                uint currentId = i + 1;
                ListedToken storage currentItem = idToListedToken[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }
    
    function executeSale(uint256 tokenId) public payable {
        uint price = idToListedToken[tokenId].price;
        address seller = idToListedToken[tokenId].seller;
        require(idToListedToken[tokenId].currentlyListed == true, "This NFT is not for sale");
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        // Cập nhật dữ liệu NFT
        idToListedToken[tokenId].owner = payable(msg.sender);   // người mua là chủ sở hữu mới
        idToListedToken[tokenId].currentlyListed = false;       // NFT không còn được niêm yết
        idToListedToken[tokenId].seller = payable(address(0));  // reset người bán
        idToListedToken[tokenId].price = 0;                     // reset giá
        _itemsSold.increment();

        // Chuyển NFT từ contract -> người mua
        _transfer(address(this), msg.sender, tokenId);

        // Thanh toán
        payable(owner).transfer(listPrice); // phí sàn
        payable(seller).transfer(msg.value); // tiền bán NFT cho người bán
    }
}