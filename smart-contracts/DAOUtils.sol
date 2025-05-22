// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DAOUtils {
    struct Proposal {
        string description;
        uint voteCount;
    }

    Proposal[] public proposals;
    mapping(address => bool) public voted;

    function createProposal(string memory desc) external {
        proposals.push(Proposal(desc, 0));
    }

    function vote(uint proposalId) external {
        require(!voted[msg.sender], "Already voted");
        require(proposalId < proposals.length, "Invalid ID");

        proposals[proposalId].voteCount += 1;
        voted[msg.sender] = true;
    }

    function getProposals() external view returns (Proposal[] memory) {
        return proposals;
    }
}
