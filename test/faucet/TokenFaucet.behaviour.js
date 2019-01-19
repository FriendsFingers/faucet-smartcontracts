const shouldFail = require('openzeppelin-solidity/test/helpers/shouldFail');
const { advanceBlock } = require('openzeppelin-solidity/test/helpers/advanceToBlock');
const time = require('openzeppelin-solidity/test/helpers/time');

const { shouldBehaveLikeTokenRecover } = require('eth-token-recover/test/TokenRecover.behaviour');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

const { ZERO_ADDRESS } = require('openzeppelin-solidity/test/helpers/constants');

function shouldBehaveLikeTokenFaucet (accounts, cap, dailyRate, referralPerMille) {
  const [
    tokenFaucetOwner,
    recipient,
    referral,
    thirdParty,
  ] = accounts;

  const referralTokens = dailyRate.mul(referralPerMille).div(1000);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await advanceBlock();
  });

  context('after creation', function () {
    describe('if valid', function () {
      it('has a valid token', async function () {
        (await this.tokenFaucet.token()).should.be.equal(this.token.address);
      });

      it('has a valid cap', async function () {
        (await this.tokenFaucet.cap()).should.be.bignumber.equal(cap);
      });

      it('has a valid daily rate', async function () {
        (await this.tokenFaucet.dailyRate()).should.be.bignumber.equal(dailyRate);
      });

      it('has a valid referral tokens value', async function () {
        (await this.tokenFaucet.referralTokens()).should.be.bignumber.equal(referralTokens);
      });
    });
  });

  context('claiming tokens', function () {
    describe('before calling getTokens', function () {
      it('checking initial values', async function () {
        (await this.token.balanceOf(recipient)).should.be.bignumber.equal(0);
        (await this.tokenFaucet.receivedTokens(recipient)).should.be.bignumber.equal(0);
        (await this.tokenFaucet.lastUpdate(recipient)).should.be.bignumber.equal(0);
        (await this.tokenFaucet.getReferral(recipient)).should.be.equal(ZERO_ADDRESS);
        (await this.tokenFaucet.totalDistributedTokens()).should.be.bignumber.equal(0);
        (await this.tokenFaucet.remainingTokens()).should.be.bignumber.equal(cap);
        (await this.tokenFaucet.getRecipientsLength()).should.be.bignumber.equal(0);
      });
    });

    describe('first calling getTokens', function () {
      const getTokens = function (referralAddress) {
        it('should adjust last update for recipient', async function () {
          (await this.tokenFaucet.lastUpdate(recipient)).should.be.bignumber.equal(await time.latest());
        });

        it('should have the right referral', async function () {
          (await this.tokenFaucet.getReferral(recipient)).should.be.equal(referralAddress);
        });

        it('should increase recipients length', async function () {
          (await this.tokenFaucet.getRecipientsLength()).should.be.bignumber.equal(1);
        });

        it('recipients array should start with recipient address', async function () {
          (await this.tokenFaucet.getRecipientAddress(0)).should.be.equal(recipient);
        });

        it('should transfer the daily rate of tokens to recipient', async function () {
          (await this.token.balanceOf(recipient)).should.be.bignumber.equal(dailyRate);
        });

        it('should increase received tokens of the daily rate for recipient', async function () {
          (await this.tokenFaucet.receivedTokens(recipient)).should.be.bignumber.equal(dailyRate);
        });

        if (referralAddress !== ZERO_ADDRESS) {
          it('should transfer the referral per mille to referral', async function () {
            (await this.token.balanceOf(referralAddress)).should.be.bignumber.equal(referralTokens);
          });

          it('should increase referral earned token by referral per mille', async function () {
            (await this.tokenFaucet.earnedByReferral(referralAddress)).should.be.bignumber.equal(referralTokens);
          });

          it('should increase total distributed tokens of the daily rate plus referral per mille', async function () {
            (await this.tokenFaucet.totalDistributedTokens()).should.be.bignumber.equal(dailyRate.add(referralTokens));
          });

          it('should decrease remaining tokens of the daily rate plus referral per mille', async function () {
            (
              await this.tokenFaucet.remainingTokens()
            ).should.be.bignumber.equal(cap.sub(dailyRate.add(referralTokens)));
          });

          it('referral should have recipient in its referred list', async function () {
            const referredAddresses = await this.tokenFaucet.getReferredAddresses(referralAddress);
            referredAddresses.length.should.be.equal(1);
            referredAddresses[0].should.be.equal(recipient);
          });

          it('referral should have a right length of referred users', async function () {
            (await this.tokenFaucet.getReferredAddressesLength(referralAddress)).should.be.bignumber.equal(1);
          });
        } else {
          it('should increase total distributed tokens of the daily rate', async function () {
            (await this.tokenFaucet.totalDistributedTokens()).should.be.bignumber.equal(dailyRate);
          });

          it('should decrease remaining tokens of the daily rate', async function () {
            (await this.tokenFaucet.remainingTokens()).should.be.bignumber.equal(cap.sub(dailyRate));
          });
        }
      };

      describe('via fallback function', function () {
        beforeEach(async function () {
          await this.tokenFaucet.sendTransaction({ value: 0, from: recipient });
        });

        describe('if sending more than 0', function () {
          it('reverts', async function () {
            await shouldFail.reverting(this.tokenFaucet.sendTransaction({ value: 1, from: recipient }));
          });
        });

        getTokens(ZERO_ADDRESS);
      });

      describe('via getTokens', function () {
        beforeEach(async function () {
          await this.tokenFaucet.getTokens({ from: recipient });
        });

        getTokens(ZERO_ADDRESS);
      });

      describe('via getTokensWithReferral', function () {
        beforeEach(async function () {
          await this.tokenFaucet.getTokensWithReferral(referral, { from: recipient });
        });

        getTokens(referral);
      });
    });

    describe('calling twice in the same day', function () {
      describe('via fallback function', function () {
        beforeEach(async function () {
          await this.tokenFaucet.sendTransaction({ value: 0, from: recipient });
        });

        it('reverts', async function () {
          await shouldFail.reverting(this.tokenFaucet.sendTransaction({ value: 0, from: recipient }));
        });
      });

      describe('via getTokens', function () {
        beforeEach(async function () {
          await this.tokenFaucet.getTokens({ from: recipient });
        });

        it('reverts', async function () {
          await shouldFail.reverting(this.tokenFaucet.getTokens({ from: recipient }));
        });
      });

      describe('via getTokensWithReferral', function () {
        beforeEach(async function () {
          await this.tokenFaucet.getTokensWithReferral(referral, { from: recipient });
        });

        it('reverts', async function () {
          await shouldFail.reverting(this.tokenFaucet.getTokensWithReferral(referral, { from: recipient }));
        });
      });
    });

    describe('calling twice in different days', function () {
      describe('via fallback function', function () {
        beforeEach(async function () {
          await this.tokenFaucet.sendTransaction({ value: 0, from: recipient });
          await time.increaseTo((await time.latest()) + time.duration.days(1));
        });

        it('success', async function () {
          await this.tokenFaucet.sendTransaction({ value: 0, from: recipient });
        });
      });

      describe('via getTokens', function () {
        beforeEach(async function () {
          await this.tokenFaucet.getTokens({ from: recipient });
          await time.increaseTo((await time.latest()) + time.duration.days(1));
        });

        it('success', async function () {
          await this.tokenFaucet.getTokens({ from: recipient });
        });
      });

      describe('via getTokensWithReferral', function () {
        beforeEach(async function () {
          await this.tokenFaucet.getTokensWithReferral(referral, { from: recipient });
          await time.increaseTo((await time.latest()) + time.duration.days(1));
        });

        it('success', async function () {
          await this.tokenFaucet.getTokensWithReferral(referral, { from: recipient });
        });
      });
    });
  });

  context('like a TokenRecover', function () {
    beforeEach(async function () {
      this.instance = this.tokenFaucet;
    });

    shouldBehaveLikeTokenRecover([tokenFaucetOwner, thirdParty]);
  });
}

module.exports = {
  shouldBehaveLikeTokenFaucet,
};
