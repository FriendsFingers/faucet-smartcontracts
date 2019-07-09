const { BN, constants, expectRevert } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const { shouldBehaveLikeTokenFaucet } = require('./TokenFaucet.behaviour');

const ERC1363Mock = artifacts.require('ERC1363Mock');
const DAO = artifacts.require('DAO');
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
    genericAddress,
  ] = accounts;

  const initialERC1363Supply = new BN(1000000000);

  beforeEach(async function () {
    this.erc1363token = await ERC1363Mock.new(daoOwner, initialERC1363Supply, { from: daoOwner });
    this.dao = await DAO.new(this.erc1363token.address, { from: daoOwner });
  });

  context('creating a valid faucet', function () {
    describe('requires a non-null dao', function () {
      it('reverts', async function () {
        await expectRevert.unspecified(
          TokenFaucet.new(ZERO_ADDRESS, { from: tokenFaucetOwner }),
          'TokenFaucet: dao is the zero address'
        );
      });
    });
  });

  context('testing behaviours', function () {
    beforeEach(async function () {
      this.tokenFaucet = await TokenFaucet.new(this.dao.address, { from: tokenFaucetOwner });
    });

    context('like a TokenFaucet', function () {
      shouldBehaveLikeTokenFaucet(
        [
          tokenOwner,
          tokenFaucetOwner,
          daoOwner,
          dappMock,
          recipient,
          referral,
          thirdParty,
          genericAddress,
        ]
      );
    });
  });
});
