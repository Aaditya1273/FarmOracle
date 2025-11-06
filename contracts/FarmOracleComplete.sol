// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FarmOracle - Complete Agricultural Platform
 * @dev All-in-one smart contract for African farmers
 * @author FarmOracle Team
 * 
 * Features:
 * 1. Decentralized Marketplace - Direct farmer-to-buyer crop trading
 * 2. Storage Management - Track and manage crop storage facilities
 * 3. NFT Certifications - Verify crop health, quality, and achievements
 * 4. Yield Tokenization - Convert crop yields into tradeable tokens
 * 5. Carbon Credits - Reward sustainable farming practices
 * 
 * Built for Africa Blockchain Festival 2025
 */

contract FarmOracleComplete {
    
    // ============================================
    // SECTION 1: MARKETPLACE
    // ============================================
    
    struct Crop {
        uint256 id;
        address payable farmer;
        string name;
        uint256 quantity;
        uint256 pricePerUnit;
        bool sold;
        address buyer;
        uint256 timestamp;
    }
    
    uint256 public nextCropId;
    mapping(uint256 => Crop) public crops;
    mapping(address => uint256[]) public farmerCrops;
    mapping(address => uint256[]) public buyerPurchases;  // Track buyer's purchases
    
    event CropListed(
        uint256 indexed id, 
        address indexed farmer, 
        string name, 
        uint256 quantity, 
        uint256 price
    );
    event CropSold(
        uint256 indexed id, 
        address indexed buyer, 
        address indexed farmer, 
        uint256 amount
    );
    
    /**
     * @dev List a crop for sale
     */
    function listCrop(
        string memory name, 
        uint256 quantity, 
        uint256 pricePerUnit
    ) public returns (uint256) {
        require(quantity > 0, "Quantity must be greater than zero");
        require(pricePerUnit > 0, "Price must be greater than zero");
        
        uint256 cropId = nextCropId;
        crops[cropId] = Crop({
            id: cropId,
            farmer: payable(msg.sender),
            name: name,
            quantity: quantity,
            pricePerUnit: pricePerUnit,
            sold: false,
            buyer: address(0),
            timestamp: block.timestamp
        });
        
        farmerCrops[msg.sender].push(cropId);
        emit CropListed(cropId, msg.sender, name, quantity, pricePerUnit);
        
        nextCropId++;
        return cropId;
    }
    
    /**
     * @dev Buy a listed crop
     */
    function buyCrop(uint256 cropId) public payable {
        Crop storage crop = crops[cropId];
        require(!crop.sold, "Crop already sold");
        require(msg.value >= crop.pricePerUnit * crop.quantity, "Insufficient payment");
        require(msg.sender != crop.farmer, "Cannot buy your own crop");
        
        crop.farmer.transfer(msg.value);
        crop.sold = true;
        crop.buyer = msg.sender;
        buyerPurchases[msg.sender].push(cropId);
        
        emit CropSold(cropId, msg.sender, crop.farmer, msg.value);
    }
    
    /**
     * @dev Get crop details
     */
    function getCrop(uint256 cropId) public view returns (
        uint256 id,
        address farmer,
        string memory name,
        uint256 quantity,
        uint256 price,
        bool sold,
        address buyer,
        uint256 timestamp
    ) {
        Crop memory crop = crops[cropId];
        return (
            crop.id,
            crop.farmer,
            crop.name,
            crop.quantity,
            crop.pricePerUnit,
            crop.sold,
            crop.buyer,
            crop.timestamp
        );
    }
    
    /**
     * @dev Get all crops listed by a farmer
     */
    function getFarmerCrops(address farmer) public view returns (uint256[] memory) {
        return farmerCrops[farmer];
    }
    
    /**
     * @dev Get all purchases by a buyer
     */
    function getBuyerPurchases(address buyer) public view returns (uint256[] memory) {
        return buyerPurchases[buyer];
    }
    
    /**
     * @dev Get all available (unsold) crops
     */
    function getAllAvailableCrops() public view returns (uint256[] memory) {
        uint256 availableCount = 0;
        for (uint256 i = 0; i < nextCropId; i++) {
            if (!crops[i].sold) {
                availableCount++;
            }
        }
        
        uint256[] memory availableCrops = new uint256[](availableCount);
        uint256 index = 0;
        for (uint256 i = 0; i < nextCropId; i++) {
            if (!crops[i].sold) {
                availableCrops[index] = i;
                index++;
            }
        }
        return availableCrops;
    }
    
    // ============================================
    // SECTION 2: STORAGE MANAGEMENT
    // ============================================
    
    struct StorageSlot {
        uint256 id;
        address owner;
        uint256 capacity;
        uint256 available;
        bool isActive;
        uint256 pricePerKg;
        string location;
    }
    
    uint256 public nextSlotId;
    mapping(uint256 => StorageSlot) public storageSlots;
    mapping(address => uint256[]) public farmerSlots;
    
    event SlotRegistered(
        uint256 indexed id, 
        address indexed owner, 
        uint256 capacity, 
        string location
    );
    event SlotUpdated(uint256 indexed id, uint256 available);
    event SlotDeactivated(uint256 indexed id);
    
    /**
     * @dev Register a storage facility
     */
    function registerStorage(
        uint256 capacity, 
        uint256 pricePerKg, 
        string memory location
    ) public returns (uint256) {
        require(capacity > 0, "Capacity must be greater than zero");
        
        uint256 slotId = nextSlotId;
        storageSlots[slotId] = StorageSlot({
            id: slotId,
            owner: msg.sender,
            capacity: capacity,
            available: capacity,
            isActive: true,
            pricePerKg: pricePerKg,
            location: location
        });
        
        farmerSlots[msg.sender].push(slotId);
        emit SlotRegistered(slotId, msg.sender, capacity, location);
        
        nextSlotId++;
        return slotId;
    }
    
    /**
     * @dev Update storage availability
     */
    function updateAvailability(uint256 slotId, uint256 newAvailable) public {
        require(storageSlots[slotId].owner == msg.sender, "Unauthorized");
        require(storageSlots[slotId].isActive, "Slot is inactive");
        require(newAvailable <= storageSlots[slotId].capacity, "Invalid availability");
        
        storageSlots[slotId].available = newAvailable;
        emit SlotUpdated(slotId, newAvailable);
    }
    
    /**
     * @dev Deactivate a storage slot
     */
    function deactivateSlot(uint256 slotId) public {
        require(storageSlots[slotId].owner == msg.sender, "Unauthorized");
        require(storageSlots[slotId].isActive, "Slot already inactive");
        
        storageSlots[slotId].isActive = false;
        emit SlotDeactivated(slotId);
    }
    
    /**
     * @dev Get farmer's storage slots
     */
    function getFarmerSlots(address farmer) public view returns (uint256[] memory) {
        return farmerSlots[farmer];
    }
    
    // ============================================
    // SECTION 3: NFT CERTIFICATIONS
    // ============================================
    
    // NFT Types
    uint256 public constant HEALTHY_CROP_NFT = 1;
    uint256 public constant DISEASE_FREE_CERTIFICATE = 2;
    uint256 public constant DISEASE_ALERT_NFT = 3;
    uint256 public constant SOIL_HEALTH_NFT = 4;
    uint256 public constant YIELD_TOKEN = 5;
    uint256 public constant CARBON_CREDIT_NFT = 6;
    uint256 public constant ORGANIC_CERTIFICATION = 7;
    uint256 public constant WEATHER_SURVIVAL_NFT = 8;
    
    struct NFTCertificate {
        uint256 tokenId;
        uint256 tokenType;
        address farmer;
        string cropType;
        uint256 quantity;
        uint256 healthScore;
        uint256 timestamp;
        bool verified;
        string metadata;
    }
    
    uint256 public nextTokenId;
    mapping(uint256 => NFTCertificate) public nftCertificates;
    mapping(address => uint256[]) public farmerNFTs;
    mapping(uint256 => mapping(address => uint256)) public nftBalances; // tokenType => farmer => balance
    
    uint256 public totalNFTsMinted;
    uint256 public totalFarmersRegistered;
    mapping(address => bool) public registeredFarmers;
    
    event NFTMinted(
        uint256 indexed tokenId,
        uint256 indexed tokenType,
        address indexed farmer,
        string cropType,
        uint256 quantity
    );
    event CropVerified(uint256 indexed tokenId, address indexed farmer, uint256 healthScore);
    event YieldTokenized(uint256 indexed tokenId, address indexed farmer, uint256 yieldAmount);
    event CarbonCreditIssued(uint256 indexed tokenId, address indexed farmer, uint256 credits);
    
    /**
     * @dev Mint Healthy Crop NFT
     */
    function mintHealthyCropNFT(
        string memory cropType,
        uint256 quantity,
        uint256 healthScore
    ) public returns (uint256) {
        require(healthScore >= 80, "Health score too low for certification");
        
        uint256 tokenId = nextTokenId;
        nftCertificates[tokenId] = NFTCertificate({
            tokenId: tokenId,
            tokenType: HEALTHY_CROP_NFT,
            farmer: msg.sender,
            cropType: cropType,
            quantity: quantity,
            healthScore: healthScore,
            timestamp: block.timestamp,
            verified: true,
            metadata: "AI-Verified Healthy Crop"
        });
        
        farmerNFTs[msg.sender].push(tokenId);
        nftBalances[HEALTHY_CROP_NFT][msg.sender] += 1;
        _registerFarmer(msg.sender);
        totalNFTsMinted++;
        nextTokenId++;
        
        emit NFTMinted(tokenId, HEALTHY_CROP_NFT, msg.sender, cropType, quantity);
        emit CropVerified(tokenId, msg.sender, healthScore);
        
        return tokenId;
    }
    
    /**
     * @dev Mint Disease-Free Certificate
     */
    function mintDiseaseFreeCertificate(
        string memory cropType,
        uint256 quantity
    ) public returns (uint256) {
        uint256 tokenId = nextTokenId;
        nftCertificates[tokenId] = NFTCertificate({
            tokenId: tokenId,
            tokenType: DISEASE_FREE_CERTIFICATE,
            farmer: msg.sender,
            cropType: cropType,
            quantity: quantity,
            healthScore: 100,
            timestamp: block.timestamp,
            verified: true,
            metadata: "Premium Disease-Free Certification"
        });
        
        farmerNFTs[msg.sender].push(tokenId);
        nftBalances[DISEASE_FREE_CERTIFICATE][msg.sender] += 1;
        _registerFarmer(msg.sender);
        totalNFTsMinted++;
        nextTokenId++;
        
        emit NFTMinted(tokenId, DISEASE_FREE_CERTIFICATE, msg.sender, cropType, quantity);
        
        return tokenId;
    }
    
    /**
     * @dev Mint Disease Alert NFT
     */
    function mintDiseaseAlertNFT(
        string memory cropType,
        string memory diseaseType,
        uint256 quantity
    ) public returns (uint256) {
        uint256 tokenId = nextTokenId;
        nftCertificates[tokenId] = NFTCertificate({
            tokenId: tokenId,
            tokenType: DISEASE_ALERT_NFT,
            farmer: msg.sender,
            cropType: cropType,
            quantity: quantity,
            healthScore: 0,
            timestamp: block.timestamp,
            verified: true,
            metadata: diseaseType
        });
        
        farmerNFTs[msg.sender].push(tokenId);
        nftBalances[DISEASE_ALERT_NFT][msg.sender] += 1;
        _registerFarmer(msg.sender);
        totalNFTsMinted++;
        nextTokenId++;
        
        emit NFTMinted(tokenId, DISEASE_ALERT_NFT, msg.sender, cropType, quantity);
        
        return tokenId;
    }
    
    /**
     * @dev Mint Soil Health NFT
     */
    function mintSoilHealthNFT(
        uint256 soilScore,
        string memory soilType
    ) public returns (uint256) {
        require(soilScore >= 70, "Soil score too low for NFT");
        
        uint256 tokenId = nextTokenId;
        nftCertificates[tokenId] = NFTCertificate({
            tokenId: tokenId,
            tokenType: SOIL_HEALTH_NFT,
            farmer: msg.sender,
            cropType: soilType,
            quantity: 1,
            healthScore: soilScore,
            timestamp: block.timestamp,
            verified: true,
            metadata: "Soil Health Certification"
        });
        
        farmerNFTs[msg.sender].push(tokenId);
        nftBalances[SOIL_HEALTH_NFT][msg.sender] += 1;
        _registerFarmer(msg.sender);
        totalNFTsMinted++;
        nextTokenId++;
        
        emit NFTMinted(tokenId, SOIL_HEALTH_NFT, msg.sender, soilType, 1);
        
        return tokenId;
    }
    
    /**
     * @dev Tokenize Yield
     */
    function tokenizeYield(
        string memory cropName,
        uint256 yieldAmount,
        uint256 qualityScore
    ) public returns (uint256) {
        require(yieldAmount > 0, "Yield amount must be positive");
        require(qualityScore >= 60, "Quality too low for tokenization");
        
        uint256 tokenId = nextTokenId;
        nftCertificates[tokenId] = NFTCertificate({
            tokenId: tokenId,
            tokenType: YIELD_TOKEN,
            farmer: msg.sender,
            cropType: cropName,
            quantity: yieldAmount,
            healthScore: qualityScore,
            timestamp: block.timestamp,
            verified: true,
            metadata: "Tokenized Yield"
        });
        
        farmerNFTs[msg.sender].push(tokenId);
        nftBalances[YIELD_TOKEN][msg.sender] += yieldAmount;
        _registerFarmer(msg.sender);
        totalNFTsMinted++;
        nextTokenId++;
        
        emit NFTMinted(tokenId, YIELD_TOKEN, msg.sender, cropName, yieldAmount);
        emit YieldTokenized(tokenId, msg.sender, yieldAmount);
        
        return tokenId;
    }
    
    /**
     * @dev Mint Carbon Credit NFT
     */
    function mintCarbonCreditNFT(
        uint256 carbonOffset,
        string memory practiceType
    ) public returns (uint256) {
        uint256 tokenId = nextTokenId;
        nftCertificates[tokenId] = NFTCertificate({
            tokenId: tokenId,
            tokenType: CARBON_CREDIT_NFT,
            farmer: msg.sender,
            cropType: practiceType,
            quantity: carbonOffset,
            healthScore: 100,
            timestamp: block.timestamp,
            verified: true,
            metadata: "Carbon Credit Certificate"
        });
        
        farmerNFTs[msg.sender].push(tokenId);
        nftBalances[CARBON_CREDIT_NFT][msg.sender] += carbonOffset;
        _registerFarmer(msg.sender);
        totalNFTsMinted++;
        nextTokenId++;
        
        emit NFTMinted(tokenId, CARBON_CREDIT_NFT, msg.sender, practiceType, carbonOffset);
        emit CarbonCreditIssued(tokenId, msg.sender, carbonOffset);
        
        return tokenId;
    }
    
    /**
     * @dev Mint Organic Certification
     */
    function mintOrganicCertification(
        string memory cropType
    ) public returns (uint256) {
        uint256 tokenId = nextTokenId;
        nftCertificates[tokenId] = NFTCertificate({
            tokenId: tokenId,
            tokenType: ORGANIC_CERTIFICATION,
            farmer: msg.sender,
            cropType: cropType,
            quantity: 1,
            healthScore: 100,
            timestamp: block.timestamp,
            verified: true,
            metadata: "Organic Certification"
        });
        
        farmerNFTs[msg.sender].push(tokenId);
        nftBalances[ORGANIC_CERTIFICATION][msg.sender] += 1;
        _registerFarmer(msg.sender);
        totalNFTsMinted++;
        nextTokenId++;
        
        emit NFTMinted(tokenId, ORGANIC_CERTIFICATION, msg.sender, cropType, 1);
        
        return tokenId;
    }
    
    /**
     * @dev Mint Weather Survival NFT
     */
    function mintWeatherSurvivalNFT(
        string memory cropType,
        string memory weatherEvent
    ) public returns (uint256) {
        uint256 tokenId = nextTokenId;
        nftCertificates[tokenId] = NFTCertificate({
            tokenId: tokenId,
            tokenType: WEATHER_SURVIVAL_NFT,
            farmer: msg.sender,
            cropType: cropType,
            quantity: 1,
            healthScore: 100,
            timestamp: block.timestamp,
            verified: true,
            metadata: weatherEvent
        });
        
        farmerNFTs[msg.sender].push(tokenId);
        nftBalances[WEATHER_SURVIVAL_NFT][msg.sender] += 1;
        _registerFarmer(msg.sender);
        totalNFTsMinted++;
        nextTokenId++;
        
        emit NFTMinted(tokenId, WEATHER_SURVIVAL_NFT, msg.sender, cropType, 1);
        
        return tokenId;
    }
    
    /**
     * @dev Get farmer's NFTs
     */
    function getFarmerNFTs(address farmer) public view returns (uint256[] memory) {
        return farmerNFTs[farmer];
    }
    
    /**
     * @dev Get NFT certificate details
     */
    function getNFTCertificate(uint256 tokenId) public view returns (NFTCertificate memory) {
        return nftCertificates[tokenId];
    }
    
    /**
     * @dev Get NFT balance by type
     */
    function getNFTBalance(uint256 tokenType, address farmer) public view returns (uint256) {
        return nftBalances[tokenType][farmer];
    }
    
    /**
     * @dev Register farmer (internal)
     */
    function _registerFarmer(address farmer) internal {
        if (!registeredFarmers[farmer]) {
            registeredFarmers[farmer] = true;
            totalFarmersRegistered++;
        }
    }
    
    // ============================================
    // SECTION 4: PLATFORM STATISTICS
    // ============================================
    
    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() public view returns (
        uint256 totalCropsListed,
        uint256 totalStorageSlots,
        uint256 totalNFTs,
        uint256 totalFarmers
    ) {
        return (
            nextCropId,
            nextSlotId,
            totalNFTsMinted,
            totalFarmersRegistered
        );
    }
    
    /**
     * @dev Get farmer profile
     */
    function getFarmerProfile(address farmer) public view returns (
        uint256 cropsListed,
        uint256 storageSlotsCount,
        uint256 nftsOwned,
        bool isRegistered
    ) {
        return (
            farmerCrops[farmer].length,
            farmerSlots[farmer].length,
            farmerNFTs[farmer].length,
            registeredFarmers[farmer]
        );
    }
}
