pragma solidity ^0.5.10;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "eth-token-recover/contracts/TokenRecover.sol";
import "dao-smartcontracts/contracts/dao/DAO.sol";

/**
 * @title TokenFaucet
 * @author Vittorio Minacori (https://github.com/vittominacori)
 * @dev Implementation of a TokenFaucet
 */
contract TokenFaucet is TokenRecover {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // struct representing the faucet status for an account
    struct RecipientDetail {
        bool exists;
        uint256 tokens;
        uint256 lastUpdate;
        address referral;
    }

    // struct representing the referral status
    struct ReferralDetail {
        uint256 tokens;
        address[] recipients;
    }

    // the time between two tokens claim
    uint256 private _pauseTime = 1 days;

    // the token to distribute
    IERC20 private _token;

    // the DAO smart contract
    DAO private _dao;

    // the daily rate of tokens distributed
    uint256 private _dailyRate;

    // the value earned by referral per mille
    uint256 private _referralPerMille;

    // the sum of distributed tokens
    uint256 private _totalDistributedTokens;

    // map of address and received token amount
    mapping(address => RecipientDetail) private _recipientList;

    // list of addresses who received tokens
    address[] private _recipients;

    // map of address and referred addresses
    mapping(address => ReferralDetail) private _referralList;

    /**
     * @param token Address of the token being distributed
     * @param dailyRate Daily rate of tokens distributed
     * @param referralPerMille The value earned by referral per mille
     * @param dao DAO the decentralized organization address
     */
    constructor(
        address token,
        uint256 dailyRate,
        uint256 referralPerMille,
        address payable dao
    )
        public
    {
        require(token != address(0), "TokenFaucet: token is the zero address");
        require(dailyRate > 0, "TokenFaucet: dailyRate is 0");
        require(referralPerMille > 0, "TokenFaucet: referralPerMille is 0");
        require(dao != address(0), "TokenFaucet: dao is the zero address");

        _token = IERC20(token);
        _dailyRate = dailyRate;
        _referralPerMille = referralPerMille;
        _dao = DAO(dao);
    }

    /**
     * @dev function to be called to receive tokens
     */
    function getTokens() public {
        require(_dao.isMember(msg.sender), "TokenFaucet: message sender is not dao member");

        // distribute tokens
        _distributeTokens(msg.sender, address(0));
    }

    /**
     * @dev function to be called to receive tokens
     * @param referral Address to an account that is referring
     */
    function getTokensWithReferral(address referral) public {
        require(_dao.isMember(msg.sender), "TokenFaucet: message sender is not dao member");
        require(referral != msg.sender, "TokenFaucet: referral cannot be message sender");

        // distribute tokens
        _distributeTokens(msg.sender, referral);
    }

    /**
     * @return the token to distribute
     */
    function token() public view returns (IERC20) {
        return _token;
    }

    /**
     * @return the daily rate of tokens distributed
     */
    function dailyRate() public view returns (uint256) {
        return _dailyRate;
    }

    /**
     * @return the value earned by referral for each recipient
     */
    function referralTokens() public view returns (uint256) {
        return _dailyRate.mul(_referralPerMille).div(1000);
    }

    /**
     * @return the sum of distributed tokens
     */
    function totalDistributedTokens() public view returns (uint256) {
        return _totalDistributedTokens;
    }

    /**
     * @param account The address to check
     * @return received token amount for the given address
     */
    function receivedTokens(address account) public view returns (uint256) {
        return _recipientList[account].tokens;
    }

    /**
     * @param account The address to check
     * @return last tokens received timestamp
     */
    function lastUpdate(address account) public view returns (uint256) {
        return _recipientList[account].lastUpdate;
    }

    /**
     * @param account The address to check
     * @return time of next available claim or zero
     */
    function nextClaimTime(address account) public view returns (uint256) {
        return !_recipientList[account].exists ? 0 : _recipientList[account].lastUpdate + _pauseTime;
    }

    /**
     * @param account The address to check
     * @return referral for given address
     */
    function getReferral(address account) public view returns (address) {
        return _recipientList[account].referral;
    }

    /**
     * @param account The address to check
     * @return earned tokens by referrals
     */
    function earnedByReferral(address account) public view returns (uint256) {
        return _referralList[account].tokens;
    }

    /**
     * @param account The address to check
     * @return referred addresses for given address
     */
    function getReferredAddresses(address account) public view returns (address[] memory) {
        return _referralList[account].recipients;
    }

    /**
     * @param account The address to check
     * @return referred addresses for given address
     */
    function getReferredAddressesLength(address account) public view returns (uint) {
        return _referralList[account].recipients.length;
    }

    /**
     * @dev return the number of remaining tokens to distribute
     * @return uint256
     */
    function remainingTokens() public view returns (uint256) {
        return _token.balanceOf(address(this));
    }

    /**
     * @return address of a recipient by list index
     */
    function getRecipientAddress(uint256 index) public view returns (address) {
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
     * @dev The way in which faucet tokens rate is calculated
     * @param account Address receiving the tokens
     * @return Number of tokens that can be received
     */
    function getTokenAmount(address account) public view returns (uint256) {
        uint256 tokenAmount = _dailyRate;

        if (_dao.stakedTokensOf(account) > 0) {
            tokenAmount = tokenAmount.mul(2);
        }

        if (_dao.usedTokensOf(account) > 0) {
            tokenAmount = tokenAmount.mul(2);
        }

        return tokenAmount;
    }

    /**
     * @dev change daily rate and referral per mille
     * @param newDailyRate Daily rate of tokens distributed
     * @param newReferralPerMille The value earned by referral per mille
     */
    function setRates(uint256 newDailyRate, uint256 newReferralPerMille) public onlyOwner {
        require(newDailyRate > 0, "TokenFaucet: dailyRate is 0");
        require(newReferralPerMille > 0, "TokenFaucet: referralPerMille is 0");

        _dailyRate = newDailyRate;
        _referralPerMille = newReferralPerMille;
    }

    /**
     * @dev distribute tokens
     * @param account Address being distributing
     * @param referral Address to an account that is referring
     */
    function _distributeTokens(address account, address referral) internal {
        // solhint-disable-next-line not-rely-on-time
        require(nextClaimTime(account) <= block.timestamp, "TokenFaucet: next claim date is not passed");

        uint256 tokenAmount = getTokenAmount(account);

        // check if recipient exists
        if (!_recipientList[account].exists) {
            _recipients.push(account);
            _recipientList[account].exists = true;

            // check if valid referral
            if (referral != address(0)) {
                _recipientList[account].referral = referral;
                _referralList[referral].recipients.push(account);
            }
        }

        // update recipient status

        // solhint-disable-next-line not-rely-on-time
        _recipientList[account].lastUpdate = block.timestamp;
        _recipientList[account].tokens = _recipientList[account].tokens.add(tokenAmount);

        // update faucet status
        _totalDistributedTokens = _totalDistributedTokens.add(tokenAmount);

        // transfer tokens to recipient
        _token.safeTransfer(account, tokenAmount);

        // check referral

        if (_recipientList[account].referral != address(0)) {
            // referral is only the first one referring
            address firstReferral = _recipientList[account].referral;

            uint256 referralEarnedTokens = referralTokens();

            // update referral status
            _referralList[firstReferral].tokens = _referralList[firstReferral].tokens.add(referralEarnedTokens);

            // update faucet status
            _totalDistributedTokens = _totalDistributedTokens.add(referralEarnedTokens);

            // transfer tokens to referral
            _token.safeTransfer(firstReferral, referralEarnedTokens);
        }
    }
}
