// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract Land is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard, Pausable {

    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// STATES ////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////
    IERC20 public immutable paymentStableToken; // Stablecoin used for this property
    uint256 public tokenIdCounter = 1;

    uint256 public immutable i_initialValue; // Total property value for tokenization
    uint256 public immutable i_totalSupply; // Maximum tokens
    uint256 public yieldRate; // Rental yield per block per token (mutable)
    uint256 public immutable i_startDate; // Project start date (minting ends, yield begins)
    uint256 public immutable i_landType; // Property type identifier

    uint256 public constant MONTH_IN_BLOCKS = 216000; // approximately 30 days in blocks (assuming 12s block time)

    bool public redeemable = false;
    bool public funded = false; // this variable acted as a flag when the tokenizer funded the contract for redemption
    
    mapping(address => uint256) public lastWithdraw; // each holder's last withdraw block number
    mapping(uint256 => bool) public monthlyDepositsComplete; // Track which months are funded
    uint256 public lastYieldDeposit; // Track last deposit block number

    error InsufficientYieldReserved();

    modifier onlyWhenRedeemable() {
        require(redeemable == true, "Redemption not allowed yet");
        _;
    }

    modifier isFunded() {
        require(funded == true, "Contract not funded yet");
        _;
    }

    modifier mintable() {
        require(tokenIdCounter <= i_totalSupply, "All tokens have been minted");
        require(block.number < i_startDate, "Minting period has ended");
        _;
    }

    modifier haveYieldReserved() {
        uint256 currentMonth = getCurrentMonth();
        require(currentMonth > 0, "Project not started yet");
        require(monthlyDepositsComplete[currentMonth], "Current month not funded by tokenizer");
        
        // Check if there's enough balance for this withdrawal
        // NOTE: Yield is calculated per token, but reserves are based on i_totalSupply
        uint256 userBalance = balanceOf(msg.sender);
        uint256 blocksPassed = block.number - lastWithdraw[msg.sender];
        uint256 requiredYield = yieldRate * blocksPassed * userBalance;
        require(paymentStableToken.balanceOf(address(this)) >= requiredYield, "Insufficient yield balance");
        _;
    }

    modifier canWithdrawYield() {
        require(block.number >= i_startDate, "Project not started yet");
        require(balanceOf(msg.sender) > 0, "No tokens owned");
        
        // Calculate yield amount for this user
        uint256 blocksPassed = block.number - lastWithdraw[msg.sender];
        uint256 yieldAmount = yieldRate * blocksPassed * balanceOf(msg.sender);
        
        require(yieldAmount > 0, "No yield to withdraw");
        require(paymentStableToken.balanceOf(address(this)) >= yieldAmount, "Insufficient contract balance for your withdrawal");
        _;
    }

    modifier hasTokens(address user) {
        require(balanceOf(user) > 0, "No tokens to redeem");
        _;
    }

    event Minted(address indexed to, uint256 tokenId);
    event YieldWithdrawn(address indexed holder, uint256 amount);
    event Redeemed(address indexed redeemer, uint256 amount);
    event EmergencyRedemptionTriggered();
    event FundingValidated();
    event MonthlyYieldDeposited(uint256 indexed month, uint256 amount);
    event EmergencyYieldWithdrawal(uint256 amount);
    event YieldRateUpdated(uint256 oldYieldRate, uint256 newYieldRate);

    constructor(
        address _paymentStableToken, // Stablecoin address for this property
        uint256 _initialValue, // Total property value
        uint256 _totalSupply, // Max tokens for fractional ownership
        uint256 _yieldRate, // Rental yield per block per token
        uint256 _startDate, // When minting ends and yield begins
        uint256 _landType, // Property type
        string memory _name,
        string memory _symbol
    )
    ERC721( _name, _symbol) 
    Ownable(msg.sender) {
        require(_paymentStableToken != address(0), "Invalid stablecoin address");
        paymentStableToken = IERC20(_paymentStableToken);
        i_initialValue = _initialValue;
        i_totalSupply = _totalSupply;
        yieldRate = _yieldRate;
        i_startDate = _startDate;
        i_landType = _landType;
    }

    function mint(address to) external mintable nonReentrant {
        uint256 tokenPrice = i_initialValue / i_totalSupply;
        paymentStableToken.transferFrom(to, address(this), tokenPrice);

        _safeMint(to, tokenIdCounter);

        lastWithdraw[to] = block.number;
        tokenIdCounter++;
        emit Minted(to, tokenIdCounter - 1);
    }

    function withdrawYield() external nonReentrant canWithdrawYield {
        uint256 blocksPassed = block.number - lastWithdraw[msg.sender];
        uint256 yieldAmount = yieldRate * blocksPassed * balanceOf(msg.sender);

        // Transfer yield to user
        paymentStableToken.transfer(msg.sender, yieldAmount);
        
        // Update last withdrawal block
        lastWithdraw[msg.sender] = block.number;
        
        emit YieldWithdrawn(msg.sender, yieldAmount);
    }

    /**
     * @dev This function is called by the validator third party 
     * @dev The reason for this to trigger is listed on the app
     */
    function emergencyRedemption() external onlyOwner {
        redeemable = true;
        emit EmergencyRedemptionTriggered();
    }


    function validateFundingForRedemption() external onlyOwner {
        funded = true;
        emit FundingValidated();
    }

    function redeem() external nonReentrant onlyWhenRedeemable isFunded hasTokens(msg.sender) {
        uint256 userTokens = balanceOf(msg.sender);
        uint256 nftWorth = i_initialValue / i_totalSupply;
        uint256 redemptionAmount = nftWorth * userTokens;
        
        require(paymentStableToken.balanceOf(address(this)) >= redemptionAmount, "Insufficient funds for redemption");
        
        // Burn all user's tokens (iterate backwards to avoid index shifting)
        while(balanceOf(msg.sender) > 0) {
            uint256 tokenId = tokenOfOwnerByIndex(msg.sender, 0);
            _burn(tokenId);
        }
        
        paymentStableToken.transfer(msg.sender, redemptionAmount);
        emit Redeemed(msg.sender, redemptionAmount);
    }

    function getCurrentReserved() external view returns (uint256) {
        return paymentStableToken.balanceOf(address(this));
    }

    /**
     * @dev Get available yield for a specific user
     * @param user Address to check yield for
     * @return yieldAmount Available yield amount
     * @return canWithdraw Whether user can withdraw (has tokens and project started)
     * @return hasBalance Whether contract has enough balance to pay
     */
    function getAvailableYield(address user) external view returns (
        uint256 yieldAmount,
        bool canWithdraw,
        bool hasBalance
    ) {
        // Check if project has started and user has tokens
        canWithdraw = (block.number >= i_startDate) && (balanceOf(user) > 0);
        
        if (canWithdraw) {
            uint256 blocksPassed = block.number - lastWithdraw[user];
            yieldAmount = yieldRate * blocksPassed * balanceOf(user);
            hasBalance = paymentStableToken.balanceOf(address(this)) >= yieldAmount;
        } else {
            yieldAmount = 0;
            hasBalance = false;
        }
    }

    function getCurrentHolders() external view returns (uint256) {
        return totalSupply();
    }

    /**
     * @dev Get user's yield information
     * @param user Address to check
     * @return tokensOwned Number of tokens owned by user
     * @return lastWithdrawBlock Block number of user's last withdrawal
     * @return yieldPerBlockPerToken Current yield rate per block per token
     * @return blocksSinceLastWithdraw Blocks passed since last withdrawal
     * @return currentYieldAccrued Current accrued yield amount
     */
    function getUserYieldInfo(address user) external view returns (
        uint256 tokensOwned,
        uint256 lastWithdrawBlock,
        uint256 yieldPerBlockPerToken,
        uint256 blocksSinceLastWithdraw,
        uint256 currentYieldAccrued
    ) {
        tokensOwned = balanceOf(user);
        lastWithdrawBlock = lastWithdraw[user];
        yieldPerBlockPerToken = yieldRate;
        blocksSinceLastWithdraw = block.number - lastWithdrawBlock;
        currentYieldAccrued = yieldRate * blocksSinceLastWithdraw * tokensOwned;
    }

    /**
     * @dev Get token statistics
     */
    function getTokenStats() external view returns (
        uint256 activeTokens,      // Currently existing tokens (not burned)
        uint256 totalEverMinted,   // Total tokens ever minted
        uint256 maxSupply,         // Maximum possible tokens
        uint256 remainingToMint,   // Tokens still available to mint
        bool mintingOpen,          // Whether minting is still allowed
        uint256 tokenPrice         // Price per token
    ) {
        activeTokens = totalSupply();
        totalEverMinted = tokenIdCounter - 1;
        maxSupply = i_totalSupply;
        remainingToMint = maxSupply - totalEverMinted;
        mintingOpen = block.number < i_startDate && totalEverMinted < maxSupply;
        tokenPrice = i_initialValue / i_totalSupply;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Update the yield rate for the property
     * @param _newYieldRate New yield rate per block per token
     */
    function setYieldRate(uint256 _newYieldRate) external onlyOwner {
        require(_newYieldRate > 0, "Yield rate must be greater than 0");
        uint256 oldYieldRate = yieldRate;
        yieldRate = _newYieldRate;
        emit YieldRateUpdated(oldYieldRate, _newYieldRate);
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// MONTHLY YIELD SYSTEM ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev Tokenizer must deposit yield for each month to ensure users can withdraw
     * @dev This prevents the tokenizer from underfunding the contract
     */
    function depositMonthlyYield() external onlyOwner {
        uint256 currentMonth = getCurrentMonth();
        require(currentMonth > 0, "Project not started yet");
        require(!monthlyDepositsComplete[currentMonth], "This month already funded");
        
        uint256 requiredDeposit = calculateRequiredMonthlyYield();
        require(requiredDeposit > 0, "No yield required this month");
        
        paymentStableToken.transferFrom(msg.sender, address(this), requiredDeposit);
        monthlyDepositsComplete[currentMonth] = true;
        lastYieldDeposit = block.number;
        
        emit MonthlyYieldDeposited(currentMonth, requiredDeposit);
    }

    /**
     * @dev Calculate required yield deposit for current month based on TOTAL SUPPLY, not minted tokens
     * @dev Yield is distributed based on total possible tokens, regardless of how many were actually minted
     */
    function calculateRequiredMonthlyYield() public view returns (uint256) {
        // Use i_totalSupply (max possible tokens) not totalSupply() (actually minted)
        // This ensures yield is distributed proportionally among all token slots
        return yieldRate * MONTH_IN_BLOCKS * i_totalSupply;
    }

    /**
     * @dev Get current month since project start (1-indexed)
     */
    function getCurrentMonth() public view returns (uint256) {
        if(block.number < i_startDate) return 0;
        return ((block.number - i_startDate) / MONTH_IN_BLOCKS) + 1;
    }



    /**
     * @dev Check if current month is funded
     */
    function isCurrentMonthFunded() external view returns (bool) {
        uint256 currentMonth = getCurrentMonth();
        if(currentMonth == 0) return true; // Before project start
        return monthlyDepositsComplete[currentMonth];
    }

    /**
     * @dev Check if specific month is funded
     */
    function isMonthFunded(uint256 month) external view returns (bool) {
        return monthlyDepositsComplete[month];
    }

    /**
     * @dev Get total unfunded months
     */
    function getUnfundedMonths() external view returns (uint256[] memory) {
        uint256 currentMonth = getCurrentMonth();
        uint256 unfundedCount = 0;
        
        // Count unfunded months
        for(uint256 i = 1; i <= currentMonth; i++) {
            if(!monthlyDepositsComplete[i]) {
                unfundedCount++;
            }
        }
        
        // Create array of unfunded months
        uint256[] memory unfundedMonths = new uint256[](unfundedCount);
        uint256 index = 0;
        for(uint256 i = 1; i <= currentMonth; i++) {
            if(!monthlyDepositsComplete[i]) {
                unfundedMonths[index] = i;
                index++;
            }
        }
        
        return unfundedMonths;
    }

    /**
     * @dev Emergency function to withdraw unclaimed yield (owner discretion)
     */
    function emergencyWithdrawUnclaimedYield() external onlyOwner {
        uint256 contractBalance = paymentStableToken.balanceOf(address(this));
        require(contractBalance > 0, "No yield to withdraw");
        
        paymentStableToken.transfer(owner(), contractBalance);
        emit EmergencyYieldWithdrawal(contractBalance);
    }

    /**
     * @dev Get all token IDs owned by user
     */
    function getUserTokens(address user) external view returns (uint256[] memory) {
        uint256 userBalance = balanceOf(user);
        uint256[] memory tokenIds = new uint256[](userBalance);
        
        for(uint256 i = 0; i < userBalance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(user, i);
        }
        
        return tokenIds;
    }

    /**
     * @dev Get project status information
     */
    function getProjectStatus() external view returns (
        uint256 currentMonth,
        bool currentMonthFunded,
        bool projectActive,
        bool redemptionAvailable
    ) {
        currentMonth = getCurrentMonth();
        currentMonthFunded = currentMonth > 0 ? monthlyDepositsComplete[currentMonth] : true;
        projectActive = block.number >= i_startDate; // Project is always active after start date
        redemptionAvailable = redeemable; // Only based on owner's decision now
    }

    /**
     * @dev Get yield economics information
     * @dev IMPORTANT: Yield deposits are based on i_totalSupply (max tokens), not totalSupply() (minted tokens)
     * @dev This ensures fair distribution regardless of actual minting rate
     */
    function getYieldEconomics() external view returns (
        uint256 yieldRatePerBlock,
        uint256 yieldRatePerMonth,
        uint256 totalSupplyBasis,
        uint256 actualMinted,
        uint256 monthlyYieldRequired,
        uint256 currentReserves
    ) {
        yieldRatePerBlock = yieldRate;
        yieldRatePerMonth = yieldRate * MONTH_IN_BLOCKS;
        totalSupplyBasis = i_totalSupply; // Yield calculations based on this
        actualMinted = totalSupply(); // Actually minted tokens
        monthlyYieldRequired = calculateRequiredMonthlyYield();
        currentReserves = paymentStableToken.balanceOf(address(this));
    }

    /**
     * @dev Calculate how much yield a single token generates per month
     */
    function getYieldPerTokenPerMonth() external view returns (uint256) {
        return yieldRate * MONTH_IN_BLOCKS;
    }

    /**
     * @dev Calculate monthly yield liability if all tokens were minted
     */
    function getMonthlyYieldLiability() external view returns (uint256) {
        return yieldRate * MONTH_IN_BLOCKS * i_totalSupply;
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// REQUIRED OVERRIDES ////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}