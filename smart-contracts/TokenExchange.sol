// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TokenExchange {
    mapping(address => uint) public balances;
    uint public rate = 100; // 1 ETH = 100 tokens

    function buyTokens() external payable {
        uint tokens = msg.value * rate;
        balances[msg.sender] += tokens;
    }

    function sellTokens(uint amount) external {
        require(balances[msg.sender] >= amount, "Insufficient tokens");
        uint ethAmount = amount / rate;
        require(address(this).balance >= ethAmount, "Contract has insufficient ETH");

        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(ethAmount);
    }

    receive() external payable {}
}
