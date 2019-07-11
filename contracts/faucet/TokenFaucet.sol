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

    event FaucetCreated(address indexed token);

    // struct representing the enabled faucet
    struct FaucetDetail {
        bool exists;
        bool enabled;
        uint256 dailyRate;
        uint256 referralRate;
        uint256 totalDistributedTokens;
    }

    // struct representing the faucet status for an account
    struct RecipientDetail {
        bool exists;
        mapping(address => uint256) tokens;
        mapping(address => uint256) lastUpdate;
        address referral;
    }

    // struct representing the referral status
    struct ReferralDetail {
        mapping(address => uint256) tokens;
        address[] recipients;
    }

    // the time between two tokens claim
    uint256 private _pauseTime = 1 days;

    // the DAO smart contract
    DAO private _dao;

    // list of addresses who received tokens
    address[] private _recipients;

    // map of address and faucet details
    mapping(address => FaucetDetail) private _faucetList;

    // map of address and received token amount
    mapping(address => RecipientDetail) private _recipientList;

    // map of address and referred addresses
    mapping(address => ReferralDetail) private _referralList;

    /**
     * @param dao DAO the decentralized organization address
     */
    constructor(address payable dao) public {
        require(dao != address(0), "TokenFaucet: dao is the zero address");

        _dao = DAO(dao);
    }

    /**
     * @return the DAO smart contract
     */
    function dao() public view returns (DAO) {
        return _dao;
    }

    /**
     * @param token The token address to check
     * @return if faucet is enabled or not
     */
    function isEnabled(address token) public view returns (bool) {
        return _faucetList[token].enabled;
    }

    /**
     * @param token The token address to check
     * @return the daily rate of tokens distributed
     */
    function getDailyRate(address token) public view returns (uint256) {
        return _faucetList[token].dailyRate;
    }

    /**
     * @param token The token address to check
     * @return the value earned by referral for each recipient
     */
    function getReferralRate(address token) public view returns (uint256) {
        return _faucetList[token].referralRate;
    }

    /**
     * @param token The token address to check
     * @return the sum of distributed tokens
     */
    function totalDistributedTokens(address token) public view returns (uint256) {
        return _faucetList[token].totalDistributedTokens;
    }

    /**
     * @dev return the number of remaining tokens to distribute
     * @param token The token address to check
     * @return uint256
     */
    function remainingTokens(address token) public view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
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
     * @param account The address to check
     * @param token The token address to check
     * @return received token amount for the given address
     */
    function receivedTokens(address account, address token) public view returns (uint256) {
        return _recipientList[account].tokens[token];
    }

    /**
     * @param account The address to check
     * @param token The token address to check
     * @return last tokens received timestamp
     */
    function lastUpdate(address account, address token) public view returns (uint256) {
        return _recipientList[account].lastUpdate[token];
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
     * @param token The token address to check
     * @return earned tokens by referrals
     */
    function earnedByReferral(address account, address token) public view returns (uint256) {
        return _referralList[account].tokens[token];
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
     * @param account The address to check
     * @param token The token address to check
     * @return time of next available claim or zero
     */
    function nextClaimTime(address account, address token) public view returns (uint256) {
        return lastUpdate(account, token) == 0 ? 0 : lastUpdate(account, token) + _pauseTime;
    }

    /**
     * @param token Address of the token being distributed
     * @param dailyRate Daily rate of tokens distributed
     * @param referralRate The value earned by referral
     */
    function createFaucet(address token, uint256 dailyRate, uint256 referralRate) public onlyOwner {
        require(!_faucetList[token].exists, "TokenFaucet: token faucet already exists");
        require(token != address(0), "TokenFaucet: token is the zero address");
        require(dailyRate > 0, "TokenFaucet: dailyRate is 0");
        require(referralRate > 0, "TokenFaucet: referralRate is 0");

        _faucetList[token].exists = true;
        _faucetList[token].enabled = true;
        _faucetList[token].dailyRate = dailyRate;
        _faucetList[token].referralRate = referralRate;

        emit FaucetCreated(token);
    }

    /**
     * @dev change daily referral rate
     * @param token Address of tokens being updated
     * @param newDailyRate Daily rate of tokens distributed
     * @param newReferralRate The value earned by referral
     */
    function setFaucetRates(address token, uint256 newDailyRate, uint256 newReferralRate) public onlyOwner {
        require(_faucetList[token].exists, "TokenFaucet: token faucet does not exist");
        require(newDailyRate > 0, "TokenFaucet: dailyRate is 0");
        require(newReferralRate > 0, "TokenFaucet: referralRate is 0");

        _faucetList[token].dailyRate = newDailyRate;
        _faucetList[token].referralRate = newReferralRate;
    }

    /**
     * @dev disable a faucet
     * @param token Address of tokens being updated
     */
    function disableFaucet(address token) public onlyOwner {
        require(_faucetList[token].exists, "TokenFaucet: token faucet does not exist");

        _faucetList[token].enabled = false;
    }

    /**
     * @dev enable a faucet
     * @param token Address of tokens being updated
     */
    function enableFaucet(address token) public onlyOwner {
        require(_faucetList[token].exists, "TokenFaucet: token faucet does not exist");

        _faucetList[token].enabled = true;
    }

    /**
     * @dev function to be called to receive tokens
     * @param token The token address to distribute
     */
    function getTokens(address token) public {
        require(_faucetList[token].exists, "TokenFaucet: token faucet does not exist");
        require(_dao.isMember(msg.sender), "TokenFaucet: message sender is not dao member");

        // distribute tokens
        _distributeTokens(token, msg.sender, address(0));
    }

    /**
     * @dev function to be called to receive tokens
     * @param token The token address to distribute
     * @param referral Address to an account that is referring
     */
    function getTokensWithReferral(address token, address referral) public {
        require(_faucetList[token].exists, "TokenFaucet: token faucet does not exist");
        require(_dao.isMember(msg.sender), "TokenFaucet: message sender is not dao member");
        require(referral != msg.sender, "TokenFaucet: referral cannot be message sender");

        // distribute tokens
        _distributeTokens(token, msg.sender, referral);
    }

    /**
     * @dev The way in which faucet tokens rate is calculated for recipient
     * @param token Address of tokens being distributed
     * @param account Address receiving the tokens
     * @return Number of tokens that can be received
     */
    function _getRecipientTokenAmount(address token, address account) internal view returns (uint256) {
        uint256 tokenAmount = getDailyRate(token);

        if (_dao.stakedTokensOf(account) > 0) {
            tokenAmount = tokenAmount.mul(2);
        }

        if (_dao.usedTokensOf(account) > 0) {
            tokenAmount = tokenAmount.mul(2);
        }

        return tokenAmount;
    }

    /**
     * @dev The way in which faucet tokens rate is calculated for referral
     * @param token Address of tokens being distributed
     * @param account Address receiving the tokens
     * @return Number of tokens that can be received
     */
    function _getReferralTokenAmount(address token, address account) internal view returns (uint256) {
        uint256 tokenAmount = 0;

        if (_dao.isMember(account)) {
            tokenAmount = getReferralRate(token);

            if (_dao.stakedTokensOf(account) > 0) {
                tokenAmount = tokenAmount.mul(2);
            }

            if (_dao.usedTokensOf(account) > 0) {
                tokenAmount = tokenAmount.mul(2);
            }
        }

        return tokenAmount;
    }

    /**
     * @dev distribute tokens
     * @param token The token being distributed
     * @param account Address being distributing
     * @param referral Address to an account that is referring
     */
    function _distributeTokens(address token, address account, address referral) internal {
        // solhint-disable-next-line not-rely-on-time
        require(nextClaimTime(account, token) <= block.timestamp, "TokenFaucet: next claim date is not passed");

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

        uint256 recipientTokenAmount = _getRecipientTokenAmount(token, account);

        // update recipient status

        // solhint-disable-next-line not-rely-on-time
        _recipientList[account].lastUpdate[token] = block.timestamp;
        _recipientList[account].tokens[token] = _recipientList[account].tokens[token].add(recipientTokenAmount);

        // update faucet status
        _faucetList[token].totalDistributedTokens = _faucetList[token].totalDistributedTokens.add(recipientTokenAmount);

        // transfer tokens to recipient
        IERC20(token).safeTransfer(account, recipientTokenAmount);

        // check referral

        if (_recipientList[account].referral != address(0)) {
            // referral is only the first one referring
            address firstReferral = _recipientList[account].referral;

            uint256 referralTokenAmount = _getReferralTokenAmount(token, firstReferral);

            // referral can earn only if it is dao member
            if (referralTokenAmount > 0) {
                // update referral status
                _referralList[firstReferral].tokens[token] = _referralList[firstReferral].tokens[token].add(referralTokenAmount);

                // update faucet status
                _faucetList[token].totalDistributedTokens = _faucetList[token].totalDistributedTokens.add(referralTokenAmount);

                // transfer tokens to referral
                IERC20(token).safeTransfer(firstReferral, referralTokenAmount);
            }
        }
    }
}
