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
