// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FarmOracle Marketplace
 * @dev Decentralized crop trading platform for African farmers
 * Built for Africa Blockchain Festival 2025
 */
contract FarmOracleMarketplace {
    struct Crop {
        uint id;
        address payable farmer;
        string name;
        uint quantity;
        uint price;
        bool sold;
        address buyer;
        uint timestamp;
    }

    uint public nextCropId;
    mapping(uint => Crop) public crops;
    mapping(address => uint[]) public farmerListings;  // Track farmer's listed crops
    mapping(address => uint[]) public buyerPurchases;  // Track buyer's purchases

    event CropListed(uint id, address farmer, string name, uint quantity, uint price);
    event CropSold(uint id, address buyer, address farmer, uint amount);
    event FarmOracleTransaction(uint id, address farmer, address buyer, uint amount);

    function listCrop(string memory name, uint quantity, uint price) public {
        require(quantity > 0, "Quantity must be greater than zero");
        require(price > 0, "Price must be greater than zero");

        crops[nextCropId] = Crop(nextCropId, payable(msg.sender), name, quantity, price, false, address(0), block.timestamp);
        farmerListings[msg.sender].push(nextCropId);
        emit CropListed(nextCropId, msg.sender, name, quantity, price);
        nextCropId++;
    }

    function buyCrop(uint cropId) public payable {
        Crop storage crop = crops[cropId];
        require(!crop.sold, "Crop already sold");
        require(msg.value >= crop.price, "Insufficient payment");
        require(msg.sender != crop.farmer, "Cannot buy your own crop");

        crop.farmer.transfer(msg.value);
        crop.sold = true;
        crop.buyer = msg.sender;
        buyerPurchases[msg.sender].push(cropId);

        emit CropSold(cropId, msg.sender, crop.farmer, msg.value);
        emit FarmOracleTransaction(cropId, crop.farmer, msg.sender, msg.value);
    }

    function getCrop(uint cropId) public view returns (uint, address, string memory, uint, uint, bool, address, uint) {
        Crop memory crop = crops[cropId];
        return (crop.id, crop.farmer, crop.name, crop.quantity, crop.price, crop.sold, crop.buyer, crop.timestamp);
    }

    function getMyListings() public view returns (uint[] memory) {
        return farmerListings[msg.sender];
    }

    function getMyPurchases() public view returns (uint[] memory) {
        return buyerPurchases[msg.sender];
    }

    function getAllAvailableCrops() public view returns (uint[] memory) {
        uint availableCount = 0;
        for (uint i = 0; i < nextCropId; i++) {
            if (!crops[i].sold) {
                availableCount++;
            }
        }
        
        uint[] memory availableCrops = new uint[](availableCount);
        uint index = 0;
        for (uint i = 0; i < nextCropId; i++) {
            if (!crops[i].sold) {
                availableCrops[index] = i;
                index++;
            }
        }
        return availableCrops;
    }
}
