pragma solidity ^0.5.10;

import "erc-payable-token/contracts/token/ERC1363/ERC1363.sol";

// mock class using ERC1363
contract ERC1363Mock is ERC1363 {
    constructor(address initialAccount, uint256 initialBalance) public {
        _mint(initialAccount, initialBalance);
    }

    function mintMock(address account, uint256 amount) public {
        _mint(account, amount);
    }
}
