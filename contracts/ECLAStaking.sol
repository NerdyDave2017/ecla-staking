// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7; 

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ECLAStaking is Ownable, ReentrancyGuard{

    // reward token
    IERC20 public rewardToken;
    // reward nft
    address public rewardNftCollection;

    // Reward pool
    address public rewardPool;

    // Minimum stake amount
    uint256 public minimumStakeAmount = 100 * 10**18;

    // Commission
    uint256 public commission = 2;

    // Total reward claimed
    uint256 public totalRewardClaimed;

    // Total amount statked
    uint256 public totalAmountStaked;

    // Minimum staking period
    uint256 public minimumStakePeriod = 14 days;

    // Reward per hour
    uint256 rewardPerHour = 100000;

    // Reward days
    uint256 day14 = 14 days; 
    uint256 month1 = 28 days; 
    uint256 month2 = 56 days; 
    uint256 month3 = 84 days; 
    uint256 month6 = 168 days; 

    /**
    @notice reward rate
    * After 14 days of not claiming, daily ROI = 1.00%
    * After  1 month of not claiming, daily ROI = 1.05% 
    * After  1 month of not claiming, daily ROI = 1.10% 
    * After 3 months of not claiming, daily ROI = 1.15% 
    * After 6 months of not claiming, daily ROI = 1.20% 
    **/

    struct Staker{
        // Amount of tokens staked by this user
        uint256 amountStaked;

        // Last time rewards were calculater for this user
        uint256 timeOfLastUpdate;

        // Calculated but unclaimed rewards for this user
        // Rewards are cumulated once every two hours
        uint256 unclaimedRewards;
    }   

    // Mapping of user address to staker info
    mapping(address => Staker) public stakers;



    constructor(address _rewardNftCollection, IERC20 _rewardToken){
        rewardToken = _rewardToken;
        rewardNftCollection = _rewardNftCollection;
    }

    function setRewardToken(IERC20 _rewardToken)external onlyOwner{
        rewardToken = _rewardToken;
    }

    function setRewardNftCollection(address _rewardNftCollection)external onlyOwner{
        rewardNftCollection = _rewardNftCollection;
    }

    function setRewardPool(address _rewardPool)external onlyOwner{
        rewardPool = _rewardPool;
    }

    // Update minimum stake amount
    function setMinimumStake(uint256 _minimumStakeAmount)external onlyOwner{
        minimumStakeAmount = _minimumStakeAmount;
    }

    // Update commission
    function setCommission(uint256 _commission)external onlyOwner{
        commission = _commission;
    }

    // Get total rewards claimed
    function getTotalRewardsClaimed()external view returns(uint256){
        return totalRewardClaimed;
    }

    // Update minimum stake period
    function setMinimumStakePeriod(uint256 _minimumStakePeriod)external onlyOwner{
        minimumStakePeriod = _minimumStakePeriod *  1 days;
    }
    // Update reward per hour
    function setRewardPerHour(uint256 _rewardPerHour)external onlyOwner{
        rewardPerHour = _rewardPerHour;
    }

    function approveSpender(address _spender, uint256 amount)internal {
        rewardToken.approve(_spender, amount);
    }


    function stake(uint256 amount)external nonReentrant{
        require(amount >= minimumStakeAmount, "amount lower than staking amount");

        // Remember to call approve function in frontend for msg.sender

        // If wallet has token staked, calculate the rewards before adding new token
        if(stakers[msg.sender].amountStaked > 0){
            uint256 rewards = calculateRewards(msg.sender);
            stakers[msg.sender].unclaimedRewards += rewards;
        }

        // Transfer the token from the user wallet to the smart contract
        // 2% commission will be charged on staking
        uint256 grossAmount = amount + (commission*amount)/100;
        rewardToken.transferFrom(msg.sender, address(this), grossAmount);

        // increment total amount staked
        totalAmountStaked += amount;

        // increment the amount staked by this user
        stakers[msg.sender].amountStaked += amount;

        // Update timeOfLastUpdate for the user
        stakers[msg.sender].timeOfLastUpdate = block.timestamp;

    }

    function withdraw(uint256 amount)external nonReentrant{
        // Make sure user has token staked
        require(stakers[msg.sender].amountStaked > 0, "you have no tokens staked");
        require(stakers[msg.sender].amountStaked - amount >= 100, "You can not stake less then minimum amount");
        require(block.timestamp - stakers[msg.sender].timeOfLastUpdate >= minimumStakePeriod, "cannot withdraw before minimum stake period");

        // Update the rewards for this user
        uint256 rewards = calculateRewards(msg.sender);
        stakers[msg.sender].unclaimedRewards += rewards;

        // Transfer the token from the user wallet to the smart contract
        // 2% commission will be charged on withdrawal
        uint256 grossAmount = amount - (commission * amount )/100;
        rewardToken.transfer(msg.sender, grossAmount);
        // rewardToken.transferFrom(address(this), msg.sender, grossAmount);

        // decrement total amount staked
        totalAmountStaked -= amount;

        // Decrement the amount staked by this user
        stakers[msg.sender].amountStaked -= amount;

        // Update timeOfLastUpdate for the user
        stakers[msg.sender].timeOfLastUpdate = block.timestamp;
    }

    function unStake()external nonReentrant{
        // Make sure user has token staked
        require(stakers[msg.sender].amountStaked > 0, "you have no tokens staked");
        require(block.timestamp - stakers[msg.sender].timeOfLastUpdate >= minimumStakePeriod, "cannot withdraw before minimum stake period");

        // Update the rewards for this user
        uint256 rewards = calculateRewards(msg.sender);
        stakers[msg.sender].unclaimedRewards += rewards;

        // Transfer the token from the user wallet to the smart contract
        // 2% commission will be charged on unstake
        uint256 stakedAmount = stakers[msg.sender].amountStaked - (commission*stakers[msg.sender].amountStaked)/100;
        
        rewardToken.transfer(msg.sender, stakedAmount);

        rewardToken.transferFrom(rewardPool, msg.sender, stakers[msg.sender].unclaimedRewards);


        // increment total amount staked
        totalAmountStaked -= stakers[msg.sender].amountStaked;

        // Update totalRewardsClaimed
        totalRewardClaimed += stakers[msg.sender].unclaimedRewards;

        // Decrement the amount staked by this user to 0
        stakers[msg.sender].amountStaked = 0;

        // Unclaimed rewards equals 0
        stakers[msg.sender].unclaimedRewards = 0;

        // Update timeOfLastUpdate for the user
        stakers[msg.sender].timeOfLastUpdate = block.timestamp;
    }

    function claimRewards()external nonReentrant{
        require(stakers[msg.sender].amountStaked > 0, "you have no tokens staked");
        require(block.timestamp - stakers[msg.sender].timeOfLastUpdate >= minimumStakePeriod, "cannot withdraw before minimum stake period");

        // Update the rewards for this user
        uint256 rewards = calculateRewards(msg.sender);
        stakers[msg.sender].unclaimedRewards += rewards;

        require(stakers[msg.sender].unclaimedRewards > 0, "You have no unclaimed rewards");

        // Transfer rewards to this user from reward pool
        rewardToken.transferFrom(rewardPool, msg.sender, rewards);

        // Transfer NFT reward if staking duration up to 1 month and above
        if(block.timestamp - stakers[msg.sender].timeOfLastUpdate >= month1){
            ECLARewardNft nftReward = ECLARewardNft(rewardNftCollection);
            nftReward.claimNftReward(msg.sender);
        }

        // Update totalRewardsClaimed
        totalRewardClaimed += stakers[msg.sender].unclaimedRewards;

        // Unclaimed rewards equals 0
        stakers[msg.sender].unclaimedRewards = 0;

        // Update timeOfLastUpdate for the user
        stakers[msg.sender].timeOfLastUpdate = block.timestamp;
    }

    function calculateRewards(address _staker)internal view returns(uint256){
        /**
        @notice reward rate
        * After 14 days of not claiming, daily ROI = 1.00%
        * After  1 month of not claiming, daily ROI = 1.05% 
        * After  1 month of not claiming, daily ROI = 1.10% 
        * After 3 months of not claiming, daily ROI = 1.15% 
        * After 6 months of not claiming, daily ROI = 1.20% 
        **/
        // calculate time since last update in hours
        uint256 duration = (block.timestamp - stakers[_staker].timeOfLastUpdate)/1 days;
        uint256 amountStaked = stakers[_staker].amountStaked;
        uint256 rewardPerDay;

        // Get reward at reward rate per day for _staker
        if(duration >= day14 && duration < month1){
            rewardPerDay = amountStaked / 100 * 1;
        }if(duration >= month1 && duration < month2){
            rewardPerDay = amountStaked / 100 / 100 * 105;
        }if(duration >= month2 && duration < month3){
            rewardPerDay = amountStaked / 100 / 100 * 110;
        }
        if(duration >= month3 && duration < month6){
            rewardPerDay = amountStaked / 100 / 100 * 115;
        }if(duration >= month6){
            rewardPerDay = amountStaked / 100 / 100 * 120;
        }

        // Calculate total reward after current duration.
        uint256 _rewards = duration  * rewardPerDay;

        return _rewards;
    }

    function getStakerDetails(address _staker)external view returns(uint256 _amountStaked, uint256 _lastUpdate, uint256 _unclaimedRewards){
        return (stakers[_staker].amountStaked,stakers[_staker].timeOfLastUpdate, stakers[_staker].unclaimedRewards);
    }

    function availableRewards(address _staker)external view returns(uint256){
        uint256 rewards = calculateRewards(_staker) + stakers[_staker].unclaimedRewards;
        return rewards;
    }

    function balance()public view returns(uint256){
        return rewardToken.balanceOf(address(this));
    }

    function tranferOwner(address _newOwner)public onlyOwner{
        transferOwnership(_newOwner);
    }

    
}

interface ECLARewardNft{
    function claimNftReward(address _staker) external payable returns(uint256 _amountStaked, uint256 _lastUpdate, uint256 _unclaimedRewards);
}