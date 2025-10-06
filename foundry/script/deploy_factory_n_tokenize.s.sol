// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/landTokenizer.sol";
import "../src/land.sol";
import "../src/mock/mockStableToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployFactoryWithProperties is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        address deployer = vm.addr(deployerPrivateKey);
        console.log("=== Deploying to U2U Testnet ===");
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance / 1e18, "U2U");
        console.log("Current block:", block.number);
        
        // Use existing Mock USDT
        address usdtAddress = 0x5Df5E5FD5396e1387A982a7A7450D0c7CEaB40B8;
        mockStableToken usdt = mockStableToken(usdtAddress);
        console.log("Using existing Mock USDT:", address(usdt));
        
        // Deploy Factory
        LandTokenizer tokenizer = new LandTokenizer();
        console.log("Factory:", address(tokenizer));
        
        // Add stablecoin
        tokenizer.addSupportedStablecoin(usdtAddress);
        
        // Property arrays
        string[8] memory names = [
            "Saigon Pearl Residence", "Hanoi Horizon Towers", "Da Nang Marina Bay", "Nha Trang Skyline",
            "Mekong Riverside Villas", "Hue Imperial Garden", "Phu Quoc Oceanfront Estate", "Sapa Highland Retreat"
        ];
        
        string[8] memory symbols = [
            "SGP", "HHT", "DNB", "NTS", "MKV", "HIG", "PQE", "SHR"
        ];
        
        uint256[8] memory values;
        values[0] = 150000e18; values[1] = 180000e18; values[2] = 120000e18; values[3] = 200000e18;
        values[4] = 175000e18; values[5] = 190000e18; values[6] = 110000e18; values[7] = 160000e18;
        
        uint256[8] memory supplies;
        supplies[0] = 500; supplies[1] = 600; supplies[2] = 400; supplies[3] = 800;
        supplies[4] = 700; supplies[5] = 750; supplies[6] = 350; supplies[7] = 550;
        
        uint256[8] memory landTypes;
        landTypes[0] = 1; landTypes[1] = 2; landTypes[2] = 3; landTypes[3] = 4;
        landTypes[4] = 1; landTypes[5] = 2; landTypes[6] = 3; landTypes[7] = 4;
        
        console.log("\n=== Deploying 8 Properties ===");
        
        // Deploy properties
        for (uint i = 0; i < 8; i++) {
            uint256 apy = 5 + (i % 3); // 5%, 6%, 7%
            uint256 yieldRate = calculateYieldRate(values[i], supplies[i], apy);
            
            // Each NFT starts 100 blocks after the previous one, with minimum 100 blocks delay
            // This gives people time to mint before yield starts
            uint256 startBlock = block.number + 100 + (i * 100);
            
            address propertyAddress = tokenizer.tokenizeProperty(
                usdtAddress,
                names[i],
                symbols[i],
                values[i],
                supplies[i],
                yieldRate,
                startBlock,
                landTypes[i]
            );
            
            console.log("Property", i + 1, ":", propertyAddress);
            console.log("  APY:", apy, "%");
            console.log("  Yield rate per block:", yieldRate);
            console.log("  Start block:", startBlock);
            console.log("  Delay: ~", ((100 + i * 100) * 12 / 60), "minutes from deployment");
        }
        
        // Mint test tokens
        usdt.mint(deployer, 5000000e18); // 5M for testing
        
        console.log("\n=== Deployment Complete ===");
        console.log("Factory Address:", address(tokenizer));
        console.log("Mock USDT Address:", usdtAddress);
        console.log("Total Properties:", tokenizer.landCount());
        console.log("Test tokens minted: 5,000,000 Mock USDT");
        console.log("\n*** IMPORTANT: Update frontend contracts.ts with new addresses! ***");
        console.log("USDT:", usdtAddress);
        console.log("LAND_TOKENIZER:", address(tokenizer));
        
        vm.stopBroadcast();
    }
    
    function calculateYieldRate(uint256 totalValue, uint256 totalSupply, uint256 apyPercent) 
        internal pure returns (uint256) {
        // 12-second blocks: 365 * 24 * 60 * 60 / 12 = 2,628,000 blocks per year
        uint256 BLOCKS_PER_YEAR = 2628000;
        uint256 tokenPrice = totalValue / totalSupply;
        uint256 annualYieldPerToken = (tokenPrice * apyPercent) / 100;
        uint256 yieldPerBlock = annualYieldPerToken / BLOCKS_PER_YEAR;
        
        console.log("    Token price:", tokenPrice / 1e18, "USDT");
        console.log("    Annual yield per token:", annualYieldPerToken / 1e18, "USDT");
        console.log("    Yield per block:", yieldPerBlock);
        
        return yieldPerBlock;
    }
}