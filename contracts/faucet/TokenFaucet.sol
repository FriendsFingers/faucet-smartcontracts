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
    address referral;
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

  // map of address and referred addresses
  mapping (address => address[]) private _referrals;

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
    // distribute tokens
    _distributeTokens(msg.sender, address(0));
  }

  /**
   * @dev function to be called to receive tokens
   * @param referral Address to an account that is referring
   */
  function getTokensWithReferral(address referral) public payable {
    // distribute tokens
    _distributeTokens(msg.sender, referral);
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
   * @param account The address to check
   * @return referral for given address
   */
  function getReferral(address account) public view returns(address) {
    return _recipientList[account].referral;
  }

  /**
   * @param account The address to check
   * @return referred addresses for given address
   */
  function getReferredAddresses(address account) public view returns(address[]) {
    return _referrals[account];
  }

  /**
   * @param account The address to check
   * @return referred addresses for given address
   */
  function getReferredAddressesLength(address account) public view returns(uint) {
    return _referrals[account].length;
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
   * @dev update the faucet status
   * @param amount Number of tokens being distributed
   */
  function _updateFaucetStatus(uint256 amount) internal {
    _totalDistributedTokens = _totalDistributedTokens.add(amount);
    require(_totalDistributedTokens <= _cap);
  }

  /**
   * @dev distribute tokens
   * @param account Address being distributing
   * @param referral Address to an account that is referring
   */
  function _distributeTokens(address account, address referral) internal {
    // update faucet status
    _updateFaucetStatus(_dailyRate);

    if (!_recipientList[account].exists) {
      _recipients.push(account);
      _recipientList[account].referral = referral;
      _recipientList[account].exists = true;

      _referrals[referral].push(account);
    }

    // solium-disable-next-line  security/no-block-members
    _recipientList[account].lastUpdate = block.timestamp;
    _recipientList[account].tokens = _recipientList[account].tokens.add(_dailyRate);

    // transfer tokens
    _token.transfer(account, _dailyRate);
  }
}
