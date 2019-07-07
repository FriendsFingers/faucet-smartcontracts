const { BN, constants, expectRevert } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const { shouldBehaveLikeTokenFaucet } = require('./TokenFaucet.behaviour');

const ERC1363Mock = artifacts.require('ERC1363Mock');
const DAO = artifacts.require('DAO');
const ERC20Mock = artifacts.require('ERC20Mock');
const TokenFaucet = artifacts.require('TokenFaucet');

contract('TokenFaucet', function (accounts) {
  const [
    tokenOwner,
    tokenFaucetOwner,
    daoOwner,
    dappMock,
    recipient,
    referral,
    thirdParty,
  ] = accounts;

  const initialERC1363Supply = new BN(1000000000);
  const initialBalance = new BN(1000000000);

  const dailyRate = new BN(50);
  const referralPerMille = new BN(100);

  beforeEach(async function () {
    this.erc1363token = await ERC1363Mock.new(daoOwner, initialERC1363Supply, { from: daoOwner });
    this.dao = await DAO.new(this.erc1363token.address, { from: daoOwner });

    this.token = await ERC20Mock.new(tokenOwner, initialBalance, { from: tokenOwner });
  });

  context('creating a valid faucet', function () {
    describe('requires a non-null token', function () {
      it('reverts', async function () {
        await expectRevert(
          TokenFaucet.new(ZERO_ADDRESS, dailyRate, referralPerMille, this.dao.address, { from: tokenFaucetOwner }),
          'TokenFaucet: token is the zero address'
        );
      });
    });

    describe('requires a non-null dailyRate', function () {
      it('reverts', async function () {
        await expectRevert(
          TokenFaucet.new(this.token.address, 0, referralPerMille, this.dao.address, { from: tokenFaucetOwner }),
          'TokenFaucet: dailyRate is 0'
        );
      });
    });

    describe('requires a non-null referralPerMille', function () {
      it('reverts', async function () {
        await expectRevert.unspecified(
          TokenFaucet.new(this.token.address, dailyRate, 0, this.dao.address, { from: tokenFaucetOwner }),
          'TokenFaucet: referralPerMille is 0'
        );
      });
    });

    describe('requires a non-null dao', function () {
      it('reverts', async function () {
        await expectRevert.unspecified(
          TokenFaucet.new(this.token.address, dailyRate, 0, ZERO_ADDRESS, { from: tokenFaucetOwner }),
          'TokenFaucet: referralPerMille is 0'
        );
      });
    });
  });

  context('testing behaviours', function () {
    beforeEach(async function () {
      this.tokenFaucet = await TokenFaucet.new(
        this.token.address,
        dailyRate,
        referralPerMille,
        this.dao.address,
        { from: tokenFaucetOwner }
      );

      await this.token.transfer(this.tokenFaucet.address, initialBalance, { from: tokenOwner });
    });

    context('like a TokenFaucet', function () {
      shouldBehaveLikeTokenFaucet(
        [
          tokenFaucetOwner,
          recipient,
          referral,
          daoOwner,
          dappMock,
          thirdParty,
        ],
        initialBalance,
        dailyRate,
        referralPerMille,
      );
    });
  });
});
