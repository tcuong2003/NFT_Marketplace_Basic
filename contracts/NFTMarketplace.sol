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