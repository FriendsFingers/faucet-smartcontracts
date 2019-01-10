pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "eth-token-recover/contracts/TokenRecover.sol";

/**
 * @title TokenFaucet
 * @author Vittorio Minacori (https://github.com/vittominacori)
 * @dev Implementation of a TokenFaucet
 */
contract TokenFaucet is TokenRecover {
  using SafeMath for uint256;

  // struct representing the faucet status for an account
  struct RecipientDetail {
    bool exists;
    uint256 tokens;
    uint256 lastUpdate;
  }

  // the token to distribute
  ERC20 internal _token;

  // the max token cap to distribute
  uint256 private _cap;

  // the daily rate of tokens distributed
  uint256 private _dailyRate;

  // the sum of distributed tokens
  uint256 private _totalDistributedTokens;

  // map of address and received token amount
  mapping (address => RecipientDetail) private _recipientList;

  // list of addresses who received tokens
  address[] private _recipients;

  /**
   * @param token Address of the token being distributed
   * @param cap Max amount of token to be distributed
   * @param dailyRate Daily rate of tokens distributed
   */
  constructor(address token, uint256 cap, uint256 dailyRate) public {
    require(token != address(0));
    require(cap > 0);
    require(dailyRate > 0);

    _token = ERC20(token);
    _cap = cap;
    _dailyRate = dailyRate;
  }

  /**
   * @dev fallback
   */
  function () external payable {
    getTokens();
  }

  /**
   * @dev function to be called to receive tokens
   */
  function getTokens() public payable {
    // update state
    _totalDistributedTokens = _totalDistributedTokens.add(_dailyRate);

    // check if cap reached
    require(_totalDistributedTokens <= _cap);

    // distribute tokens
    _distributeTokens(msg.sender, _dailyRate);
  }

  /**
   * @return the token to distribute
   */
  function token() public view returns(ERC20) {
    return _token;
  }

  /**
   * @return the max token cap to distribute
   */
  function cap() public view returns(uint256) {
    return _cap;
  }

  /**
   * @return the daily rate of tokens distributed
   */
  function dailyRate() public view returns(uint256) {
    return _dailyRate;
  }

  /**
   * @return the sum of distributed tokens
   */
  function totalDistributedTokens() public view returns(uint256) {
    return _totalDistributedTokens;
  }

  /**
   * @param account The address to check
   * @return received token amount for the given address
   */
  function receivedTokens(address account) public view returns(uint256) {
    return _recipientList[account].tokens;
  }

  /**
   * @param account The address to check
   * @return last tokens received timestamp
   */
  function lastUpdate(address account) public view returns(uint256) {
    return _recipientList[account].lastUpdate;
  }

  /**
   * @dev return the number of remaining tokens to distribute
   * @return uint256
   */
  function remainingTokens() public view returns(uint256) {
    return _cap.sub(_totalDistributedTokens);
  }

  /**
   * @return address of a recipient by list index
   */
  function getRecipientAddress(uint256 index) public view returns(address) {
    return _recipients[index];
  }

  /**
   * @dev return the recipients length
   * @return uint
   */
  function getRecipientsLength() public view returns (uint) {
    return _recipients.length;
  }

  /**
   * @dev distribute tokens
   * @param account Address being distributing
   * @param amount Amount of token distributed
   */
  function _distributeTokens(address account, uint256 amount) internal {
    if (!_recipientList[account].exists) {
      _recipients.push(account);
      _recipientList[account].exists = true;
    }

    _recipientList[account].tokens = _recipientList[account].tokens.add(amount);
    _recipientList[account].lastUpdate = block.timestamp; // solium-disable-line  security/no-block-members

    _token.transfer(account, amount);
  }
}
