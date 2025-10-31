// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDCoin is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**6; // 1 billion tokens with 6 decimals
    uint256 public constant USER_MINT_AMOUNT = 1000 * 10**6; // 1000 tokens with 6 decimals
    mapping(address => bool) public hasMinted; // track if user has minted

    constructor() ERC20("USDCoin", "USDC") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // Owner can mint additional tokens, unlimited
    function ownerMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // User can only mint once, 1000 tokens
    function userMint() external {
        require(!hasMinted[msg.sender], "Already minted");
        hasMinted[msg.sender] = true;
        _mint(msg.sender, USER_MINT_AMOUNT);
    }

    // Override decimals to match USDC (6 decimals)
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

