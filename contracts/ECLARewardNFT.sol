// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7; 

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract ECLARewardNft is ERC1155, Ownable{
    uint256 constant public ONEMONTH = 0;
    uint256 constant public TWOMONTHS = 1;
    uint256 constant public THREEMONTHS = 2;
    uint256 constant public SIXMONTHS = 3;

    uint256[] public durationReward = [ONEMONTH,TWOMONTHS,THREEMONTHS,SIXMONTHS];
    uint256[] public durationRewardSupply = [10000,5000,2500,1250];
    uint256[] public durationRewardClaimed = [0,0,0,0];

    address public StakingContractAddress;

    // Reward days
    uint256 day14 = 14 days; 
    uint256 month1 = 28 days; 
    uint256 month2 = 56 days; 
    uint256 month3 = 84 days; 
    uint256 month6 = 168 days; 


    constructor() ERC1155("") {
        _mint(msg.sender, ONEMONTH, 10000, "");
        _mint(msg.sender, TWOMONTHS, 5000, "");
        _mint(msg.sender, THREEMONTHS, 2500, "");
        _mint(msg.sender, SIXMONTHS, 1250, "");
    }

    function setStakingContract(address stakingContract) external {
        StakingContractAddress = stakingContract;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(uint256 id, uint256 amount)
        public
        onlyOwner
    {   
        _mint(msg.sender, id, amount, "");
    }

    function claimNftReward(address _staker) external payable returns(uint256 _amountStaked, uint256 _lastUpdate, uint256 _unclaimedRewards){
        ECLAStaking stakingContract = ECLAStaking(StakingContractAddress);
        (_amountStaked, _lastUpdate, _unclaimedRewards) = stakingContract.getStakerDetails(_staker);
        require(_amountStaked > 0, "you have no tokens staked");
        require(block.timestamp - _lastUpdate >= 28 days, "cannot claim NFT if duration less than 1 month");
        require(_unclaimedRewards > 0, "You have no unclaimed rewards");
        
        // Get claim NFT for staking duration
        uint256 duration = (block.timestamp -  _lastUpdate)/1 days;
        
        if(duration >= month1 && duration < month2){
            _safeTransferFrom(owner(), _staker, 0, 1, "0x0");
        }if(duration >= month2 && duration < month3){
            _safeTransferFrom(owner(), _staker, 1, 1, "0x0");
        }if(duration >= month3 && duration < month6){
            _safeTransferFrom(owner(), _staker, 2, 1, "0x0");
        }if(duration >= month6){
            _safeTransferFrom(owner(), _staker, 3, 1, "0x0");
        }
    }
}

interface ECLAStaking{
    function getStakerDetails(address _staker)external view returns(uint256 _amountStaked, uint256 _lastUpdate, uint256 _unclaimedRewards);
}