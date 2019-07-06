const { BN, constants, expectRevert } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const { shouldBehaveLikeTokenFaucet } = require('./TokenFaucet.behaviour');

const TokenFaucet = artifacts.require('TokenFaucet');
const ERC20Mock = artifacts.require('ERC20Mock');

contract('TokenFaucet', function (accounts) {
  const [
    tokenOwner,
    tokenFaucetOwner,
    recipient,
    referral,
    thirdParty,
  ] = accounts;

  const initialBalance = new BN(1000000000);

  const dailyRate = new BN(50);
  const referralPerMille = new BN(100);

  beforeEach(async function () {
    this.token = await ERC20Mock.new(tokenOwner, initialBalance, { from: tokenOwner });
  });

  context('creating a valid faucet', function () {
    describe('if token address is the zero address', function () {
      it('reverts', async function () {
        await expectRevert.unspecified(
          TokenFaucet.new(ZERO_ADDRESS, dailyRate, referralPerMille, { from: tokenFaucetOwner })
        );
      });
    });

    describe('if daily rate is zero', function () {
      it('reverts', async function () {
        await expectRevert.unspecified(
          TokenFaucet.new(this.token.address, 0, referralPerMille, { from: tokenFaucetOwner })
        );
      });
    });

    describe('if referral per mille is zero', function () {
      it('reverts', async function () {
        await expectRevert.unspecified(
          TokenFaucet.new(this.token.address, dailyRate, 0, { from: tokenFaucetOwner })
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
          thirdParty,
        ],
        initialBalance,
        dailyRate,
        referralPerMille,
      );
    });
  });
});
