const { BN, constants, expectRevert, time } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const { shouldBehaveLikeTokenRecover } = require('eth-token-recover/test/TokenRecover.behaviour');

const ERC20Mock = artifacts.require('ERC20Mock');

function shouldBehaveLikeTokenFaucet (accounts) {
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

  const initialBalance = new BN(1000000000);

  const dailyRate = new BN(50);
  const referralPerMille = new BN(100);

  const referralTokens = dailyRate.mul(referralPerMille).divn(1000);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await time.advanceBlock();
  });

  context('after creation', function () {
    describe('if valid', function () {
      it('has a valid dao', async function () {
        (await this.tokenFaucet.dao()).should.be.equal(this.dao.address);
      });

      context('creating a faucet', function () {
        beforeEach(async function () {
          this.token = await ERC20Mock.new(tokenOwner, initialBalance, { from: tokenOwner });
        });

        describe('if caller is not the owner', function () {
          it('reverts', async function () {
            await expectRevert(
              this.tokenFaucet.createFaucet(this.token.address, dailyRate, referralPerMille, { from: thirdParty }),
              'Ownable: caller is not the owner'
            );
          });
        });

        describe('if faucet owner is calling', function () {
          describe('requires a non-null token', function () {
            it('reverts', async function () {
              await expectRevert(
                this.tokenFaucet.createFaucet(ZERO_ADDRESS, dailyRate, referralPerMille, { from: tokenFaucetOwner }),
                'TokenFaucet: token is the zero address'
              );
            });
          });

          describe('requires a non-null dailyRate', function () {
            it('reverts', async function () {
              await expectRevert(
                this.tokenFaucet.createFaucet(this.token.address, 0, referralPerMille, { from: tokenFaucetOwner }),
                'TokenFaucet: dailyRate is 0'
              );
            });
          });

          describe('requires a non-null referralPerMille', function () {
            it('reverts', async function () {
              await expectRevert(
                this.tokenFaucet.createFaucet(this.token.address, dailyRate, 0, { from: tokenFaucetOwner }),
                'TokenFaucet: referralPerMille is 0'
              );
            });
          });

          describe('if valid', function () {
            beforeEach(async function () {
              this.tokenFaucet.createFaucet(
                this.token.address,
                dailyRate,
                referralPerMille,
                { from: tokenFaucetOwner }
              );
            });

            it('faucet is enabled', async function () {
              (await this.tokenFaucet.isEnabled(this.token.address)).should.be.equal(true);
            });

            context('disabling faucet', function () {
              describe('if faucet does not exist', function () {
                it('reverts', async function () {
                  await expectRevert(
                    this.tokenFaucet.disableFaucet(genericAddress, { from: tokenFaucetOwner }),
                    'TokenFaucet: token faucet does not exist'
                  );
                });
              });

              describe('if caller is not the owner', function () {
                it('reverts', async function () {
                  await expectRevert(
                    this.tokenFaucet.disableFaucet(this.token.address, { from: thirdParty }),
                    'Ownable: caller is not the owner'
                  );
                });
              });

              describe('if success', function () {
                beforeEach(async function () {
                  await this.tokenFaucet.disableFaucet(this.token.address, { from: tokenFaucetOwner });
                });

                it('faucet is disabled', async function () {
                  (await this.tokenFaucet.isEnabled(this.token.address)).should.be.equal(false);
                });
              });
            });

            context('changing rates', function () {
              const newDailyRate = new BN(100);
              const newReferralPerMille = new BN(200);

              describe('if faucet does not exist', function () {
                it('reverts', async function () {
                  await expectRevert(
                    this.tokenFaucet.setFaucetRates(
                      genericAddress,
                      newDailyRate,
                      newReferralPerMille,
                      { from: tokenFaucetOwner }
                    ),
                    'TokenFaucet: token faucet does not exist'
                  );
                });
              });

              describe('if daily rate is zero', function () {
                it('reverts', async function () {
                  await expectRevert(
                    this.tokenFaucet.setFaucetRates(
                      this.token.address,
                      0,
                      newReferralPerMille,
                      { from: tokenFaucetOwner }
                    ),
                    'TokenFaucet: dailyRate is 0'
                  );
                });
              });

              describe('if referral per mille is zero', function () {
                it('reverts', async function () {
                  await expectRevert(
                    this.tokenFaucet.setFaucetRates(this.token.address, newDailyRate, 0, { from: tokenFaucetOwner }),
                    'TokenFaucet: referralPerMille is 0'
                  );
                });
              });

              describe('if caller is not the owner', function () {
                it('reverts', async function () {
                  await expectRevert(
                    this.tokenFaucet.setFaucetRates(
                      this.token.address,
                      newDailyRate,
                      newReferralPerMille,
                      { from: thirdParty }
                    ),
                    'Ownable: caller is not the owner'
                  );
                });
              });

              describe('if success', function () {
                beforeEach(async function () {
                  await this.tokenFaucet.setFaucetRates(
                    this.token.address,
                    newDailyRate,
                    newReferralPerMille,
                    { from: tokenFaucetOwner }
                  );
                });

                it('has a valid daily rate', async function () {
                  (await this.tokenFaucet.getDailyRate(this.token.address))
                    .should.be.bignumber.equal(newDailyRate);
                });

                it('has a valid referral tokens value', async function () {
                  const _referralTokens = newDailyRate.mul(newReferralPerMille).divn(1000);
                  (await this.tokenFaucet.getReferralTokens(this.token.address))
                    .should.be.bignumber.equal(_referralTokens);
                });
              });
            });

            describe('sending tokens to faucet', function () {
              beforeEach(async function () {
                await this.token.transfer(this.tokenFaucet.address, initialBalance, { from: tokenOwner });
              });

              context('claiming tokens', function () {
                describe('before calling getTokens', function () {
                  it('checking initial values', async function () {
                    (await this.tokenFaucet.getRecipientsLength()).should.be.bignumber.equal(new BN(0));

                    (await this.token.balanceOf(recipient)).should.be.bignumber.equal(new BN(0));
                    (await this.tokenFaucet.getReferral(recipient)).should.be.equal(ZERO_ADDRESS);

                    (await this.tokenFaucet.receivedTokens(recipient, this.token.address))
                      .should.be.bignumber.equal(new BN(0));
                    (await this.tokenFaucet.lastUpdate(recipient, this.token.address))
                      .should.be.bignumber.equal(new BN(0));
                    (await this.tokenFaucet.nextClaimTime(recipient, this.token.address))
                      .should.be.bignumber.equal(new BN(0));

                    (await this.tokenFaucet.earnedByReferral(referral, this.token.address))
                      .should.be.bignumber.equal(new BN(0));
                    (await this.tokenFaucet.getReferredAddressesLength(referral))
                      .should.be.bignumber.equal(new BN(0));

                    (await this.tokenFaucet.totalDistributedTokens(this.token.address))
                      .should.be.bignumber.equal(new BN(0));
                    (await this.tokenFaucet.remainingTokens(this.token.address))
                      .should.be.bignumber.equal(initialBalance);
                  });
                });

                describe('calling getTokens the first time', function () {
                  const getTokens = function (recipientAddress, referralAddress) {
                    context('should claim tokens', function () {
                      beforeEach(async function () {
                        if (referralAddress !== ZERO_ADDRESS) {
                          await this.tokenFaucet.getTokensWithReferral(
                            this.token.address,
                            referral,
                            { from: recipientAddress }
                          );
                        } else {
                          await this.tokenFaucet.getTokens(this.token.address, { from: recipientAddress });
                        }
                      });

                      it('should increase recipients length', async function () {
                        (await this.tokenFaucet.getRecipientsLength()).should.be.bignumber.equal(new BN(1));
                      });

                      it('recipients array should start with recipient address', async function () {
                        (await this.tokenFaucet.getRecipientAddress(0)).should.be.equal(recipientAddress);
                      });

                      it('should transfer the daily rate of tokens to recipient', async function () {
                        (await this.token.balanceOf(recipientAddress)).should.be.bignumber.equal(dailyRate);
                      });

                      it('should increase received tokens of the daily rate for recipient', async function () {
                        (await this.tokenFaucet.receivedTokens(recipientAddress, this.token.address))
                          .should.be.bignumber.equal(dailyRate);
                      });

                      it('should adjust last update for recipient', async function () {
                        (await this.tokenFaucet.lastUpdate(recipientAddress, this.token.address))
                          .should.be.bignumber.equal(await time.latest());
                      });

                      it('should have right next claim time', async function () {
                        (await this.tokenFaucet.nextClaimTime(recipientAddress, this.token.address))
                          .should.be.bignumber.equal((await time.latest()).add(time.duration.days(1)));
                      });

                      it('should have the right referral', async function () {
                        (await this.tokenFaucet.getReferral(recipientAddress)).should.be.equal(referralAddress);
                      });

                      if (referralAddress !== ZERO_ADDRESS) {
                        it('referral should have a right length of referred users', async function () {
                          (await this.tokenFaucet.getReferredAddressesLength(referralAddress))
                            .should.be.bignumber.equal(new BN(1));
                        });

                        it('referral should have recipient in its referred list', async function () {
                          const referredAddresses = await this.tokenFaucet.getReferredAddresses(referralAddress);
                          referredAddresses.length.should.be.equal(1);
                          referredAddresses[0].should.be.equal(recipientAddress);
                        });
                      } else {
                        it('should increase total distributed tokens of the daily rate', async function () {
                          (await this.tokenFaucet.totalDistributedTokens(this.token.address))
                            .should.be.bignumber.equal(dailyRate);
                        });
                      }

                      it('should decrease remaining tokens', async function () {
                        (await this.tokenFaucet.remainingTokens(this.token.address)).should.be.bignumber.equal(
                          await this.token.balanceOf(this.tokenFaucet.address)
                        );
                      });
                    });

                    if (referralAddress !== ZERO_ADDRESS) {
                      context('if referral is not dao member', function () {
                        beforeEach(async function () {
                          await this.tokenFaucet.getTokensWithReferral(
                            this.token.address,
                            referral,
                            { from: recipientAddress }
                          );
                        });

                        it('referral should not receive the referral per mille', async function () {
                          (await this.token.balanceOf(referralAddress)).should.be.bignumber.equal(new BN(0));
                        });

                        it('should increase total distributed tokens of the daily rate', async function () {
                          (await this.tokenFaucet.totalDistributedTokens(this.token.address))
                            .should.be.bignumber.equal(dailyRate);
                        });
                      });

                      context('if referral is dao member', function () {
                        beforeEach(async function () {
                          await this.dao.join({ from: referralAddress });
                          await this.tokenFaucet.getTokensWithReferral(
                            this.token.address,
                            referral,
                            { from: recipientAddress }
                          );
                        });

                        it('should transfer the referral per mille to referral', async function () {
                          (await this.token.balanceOf(referralAddress)).should.be.bignumber.equal(referralTokens);
                        });

                        it('should increase referral earned token by referral per mille', async function () {
                          (await this.tokenFaucet.earnedByReferral(referralAddress, this.token.address))
                            .should.be.bignumber.equal(referralTokens);
                        });

                        it('should increase total distributed tokens of the daily rate plus referral per mille',
                          async function () {
                            (await this.tokenFaucet.totalDistributedTokens(this.token.address))
                              .should.be.bignumber.equal(dailyRate.add(referralTokens));
                          });
                      });
                    }

                    context('if recipient has staked tokens', function () {
                      beforeEach(async function () {
                        const tokenAmount = new BN(10);

                        await this.erc1363token.mintMock(recipient, tokenAmount, { from: daoOwner });
                        await this.erc1363token.transferAndCall(this.dao.address, tokenAmount, { from: recipient });

                        if (referralAddress !== ZERO_ADDRESS) {
                          await this.tokenFaucet.getTokensWithReferral(
                            this.token.address,
                            referral,
                            { from: recipientAddress }
                          );
                        } else {
                          await this.tokenFaucet.getTokens(this.token.address, { from: recipientAddress });
                        }
                      });

                      it('should transfer a double daily rate of tokens to recipient', async function () {
                        (await this.token.balanceOf(recipientAddress)).should.be.bignumber.equal(dailyRate.muln(2));
                      });

                      it('should increase received tokens of a double daily rate for recipient', async function () {
                        (await this.tokenFaucet.receivedTokens(recipientAddress, this.token.address))
                          .should.be.bignumber.equal(dailyRate.muln(2));
                      });

                      it('should increase total distributed tokens of a double daily rate', async function () {
                        (await this.tokenFaucet.totalDistributedTokens(this.token.address))
                          .should.be.bignumber.equal(dailyRate.muln(2));
                      });
                    });

                    context('if recipient has used tokens', function () {
                      beforeEach(async function () {
                        const tokenAmount = new BN(10);

                        await this.erc1363token.mintMock(recipient, tokenAmount, { from: daoOwner });
                        await this.erc1363token.transferAndCall(this.dao.address, tokenAmount, { from: recipient });

                        await this.dao.addOperator(daoOwner, { from: daoOwner });
                        await this.dao.addDapp(dappMock, { from: daoOwner });

                        await this.dao.use(recipient, tokenAmount, { from: dappMock });

                        if (referralAddress !== ZERO_ADDRESS) {
                          await this.tokenFaucet.getTokensWithReferral(
                            this.token.address,
                            referral,
                            { from: recipientAddress }
                          );
                        } else {
                          await this.tokenFaucet.getTokens(this.token.address, { from: recipientAddress });
                        }
                      });

                      it('should transfer a double daily rate of tokens to recipient', async function () {
                        (await this.token.balanceOf(recipientAddress)).should.be.bignumber.equal(dailyRate.muln(2));
                      });

                      it('should increase received tokens of a double daily rate for recipient', async function () {
                        (await this.tokenFaucet.receivedTokens(recipientAddress, this.token.address))
                          .should.be.bignumber.equal(dailyRate.muln(2));
                      });

                      it('should increase total distributed tokens of a double daily rate', async function () {
                        (await this.tokenFaucet.totalDistributedTokens(this.token.address))
                          .should.be.bignumber.equal(dailyRate.muln(2));
                      });
                    });

                    context('if recipient has both used and staked tokens', function () {
                      beforeEach(async function () {
                        const tokenAmount = new BN(10);

                        await this.erc1363token.mintMock(recipient, tokenAmount, { from: daoOwner });
                        await this.erc1363token.transferAndCall(this.dao.address, tokenAmount, { from: recipient });

                        await this.dao.addOperator(daoOwner, { from: daoOwner });
                        await this.dao.addDapp(dappMock, { from: daoOwner });

                        await this.dao.use(recipient, tokenAmount.divn(2), { from: dappMock });

                        if (referralAddress !== ZERO_ADDRESS) {
                          await this.tokenFaucet.getTokensWithReferral(
                            this.token.address,
                            referral,
                            { from: recipientAddress }
                          );
                        } else {
                          await this.tokenFaucet.getTokens(this.token.address, { from: recipientAddress });
                        }
                      });

                      it('should transfer a fourfold daily rate of tokens to recipient', async function () {
                        (await this.token.balanceOf(recipientAddress)).should.be.bignumber.equal(dailyRate.muln(4));
                      });

                      it('should increase received tokens of a fourfold daily rate for recipient', async function () {
                        (await this.tokenFaucet.receivedTokens(recipientAddress, this.token.address))
                          .should.be.bignumber.equal(dailyRate.muln(4));
                      });

                      it('should increase total distributed tokens of a fourfold daily rate', async function () {
                        (await this.tokenFaucet.totalDistributedTokens(this.token.address))
                          .should.be.bignumber.equal(dailyRate.muln(4));
                      });
                    });
                  };

                  describe('via getTokens', function () {
                    describe('if recipient is not dao member', function () {
                      it('reverts', async function () {
                        await expectRevert(
                          this.tokenFaucet.getTokens(this.token.address, { from: recipient }),
                          'TokenFaucet: message sender is not dao member'
                        );
                      });
                    });

                    describe('if recipient is dao member', function () {
                      beforeEach(async function () {
                        await this.dao.join({ from: recipient });
                      });

                      describe('if faucet does not exist', function () {
                        it('reverts', async function () {
                          await expectRevert(
                            this.tokenFaucet.getTokens(genericAddress, { from: recipient }),
                            'TokenFaucet: token faucet does not exist'
                          );
                        });
                      });

                      getTokens(recipient, ZERO_ADDRESS);
                    });
                  });

                  describe('via getTokensWithReferral', function () {
                    describe('if recipient is not dao member', function () {
                      it('reverts', async function () {
                        await expectRevert(
                          this.tokenFaucet.getTokensWithReferral(this.token.address, referral, { from: recipient }),
                          'TokenFaucet: message sender is not dao member'
                        );
                      });
                    });

                    describe('if recipient is dao member', function () {
                      beforeEach(async function () {
                        await this.dao.join({ from: recipient });
                      });

                      describe('if faucet does not exist', function () {
                        it('reverts', async function () {
                          await expectRevert(
                            this.tokenFaucet.getTokensWithReferral(genericAddress, referral, { from: recipient }),
                            'TokenFaucet: token faucet does not exist'
                          );
                        });
                      });

                      describe('if referral is msg sender', function () {
                        it('reverts', async function () {
                          await expectRevert(
                            this.tokenFaucet.getTokensWithReferral(this.token.address, recipient, { from: recipient }),
                            'TokenFaucet: referral cannot be message sender'
                          );
                        });
                      });

                      getTokens(recipient, referral);
                    });
                  });
                });

                describe('calling twice in the same day', function () {
                  describe('via getTokens', function () {
                    beforeEach(async function () {
                      await this.dao.join({ from: recipient });
                      await this.tokenFaucet.getTokens(this.token.address, { from: recipient });
                    });

                    it('reverts', async function () {
                      await expectRevert(
                        this.tokenFaucet.getTokens(this.token.address, { from: recipient }),
                        'TokenFaucet: next claim date is not passed'
                      );
                    });
                  });

                  describe('via getTokensWithReferral', function () {
                    beforeEach(async function () {
                      await this.dao.join({ from: recipient });
                      await this.tokenFaucet.getTokensWithReferral(this.token.address, referral, { from: recipient });
                    });

                    it('reverts', async function () {
                      await expectRevert(
                        this.tokenFaucet.getTokensWithReferral(this.token.address, referral, { from: recipient }),
                        'TokenFaucet: next claim date is not passed'
                      );
                    });
                  });
                });

                describe('calling twice in different days', function () {
                  describe('via getTokens', function () {
                    beforeEach(async function () {
                      await this.dao.join({ from: recipient });
                      await this.tokenFaucet.getTokens(this.token.address, { from: recipient });
                      await time.increaseTo((await time.latest()).add(time.duration.days(1)));
                    });

                    it('success', async function () {
                      await this.tokenFaucet.getTokens(this.token.address, { from: recipient });
                    });
                  });

                  describe('via getTokensWithReferral', function () {
                    beforeEach(async function () {
                      await this.dao.join({ from: recipient });
                      await this.tokenFaucet.getTokensWithReferral(this.token.address, referral, { from: recipient });
                      await time.increaseTo((await time.latest()).add(time.duration.days(1)));
                    });

                    it('success', async function () {
                      await this.tokenFaucet.getTokensWithReferral(this.token.address, referral, { from: recipient });
                    });
                  });
                });
              });
            });
          });
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
