const shouldFail = require('openzeppelin-solidity/test/helpers/shouldFail');

const { shouldBehaveLikeTokenFaucet } = require('./TokenFaucet.behaviour');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

const TokenFaucet = artifacts.require('TokenFaucet');
const ERC20Mock = artifacts.require('ERC20Mock');

const { ZERO_ADDRESS } = require('openzeppelin-solidity/test/helpers/constants');

contract('TokenFaucet', function (accounts) {
  const [
    tokenOwner,
    tokenFaucetOwner,
    recipient,
    referral,
    thirdParty,
  ] = accounts;

  const _initialBalance = new BigNumber(web3.toWei(1000000, 'ether'));

  const _cap = new BigNumber(web3.toWei(20000, 'ether'));
  const _dailyRate = new BigNumber(web3.toWei(5, 'ether'));
  const _referralPerMille = new BigNumber(100);

  beforeEach(async function () {
    this.token = await ERC20Mock.new(tokenOwner, _initialBalance, { from: tokenOwner });
  });

  context('creating a valid faucet', function () {
    describe('if token address is the zero address', function () {
      it('reverts', async function () {
        await shouldFail.reverting(
          TokenFaucet.new(ZERO_ADDRESS, _cap, _dailyRate, _referralPerMille, { from: tokenFaucetOwner })
        );
      });
    });

    describe('if cap is zero', function () {
      it('reverts', async function () {
        await shouldFail.reverting(
          TokenFaucet.new(this.token.address, 0, _dailyRate, _referralPerMille, { from: tokenFaucetOwner })
        );
      });
    });

    describe('if daily rate is zero', function () {
      it('reverts', async function () {
        await shouldFail.reverting(
          TokenFaucet.new(this.token.address, _cap, 0, _referralPerMille, { from: tokenFaucetOwner })
        );
      });
    });

    describe('if referral per mille is zero', function () {
      it('reverts', async function () {
        await shouldFail.reverting(
          TokenFaucet.new(this.token.address, _cap, _dailyRate, 0, { from: tokenFaucetOwner })
        );
      });
    });
  });

  context('testing behaviours', function () {
    beforeEach(async function () {
      this.tokenFaucet = await TokenFaucet.new(
        this.token.address,
        _cap,
        _dailyRate,
        _referralPerMille,
        { from: tokenFaucetOwner }
      );

      await this.token.transfer(this.tokenFaucet.address, _initialBalance, { from: tokenOwner });
    });

    context('like a TokenFaucet', function () {
      shouldBehaveLikeTokenFaucet(
        [
          tokenFaucetOwner,
          recipient,
          referral,
          thirdParty,
        ],
        _cap,
        _dailyRate,
        _referralPerMille,
      );
    });
  });
});
