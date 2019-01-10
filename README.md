# Token faucet

[![Build Status](https://travis-ci.org/comethio/faucet-smartcontracts.svg?branch=master)](https://travis-ci.org/comethio/faucet-smartcontracts) 
[![Coverage Status](https://coveralls.io/repos/github/comethio/faucet-smartcontracts/badge.svg?branch=master)](https://coveralls.io/github/comethio/faucet-smartcontracts?branch=master)

Smart Contracts for an ERC20 token faucet with referral system.


## Installation

Install truffle.

```bash
npm install -g truffle      // Version 4.1.15+ required
```

## Install dependencies

```bash
npm install
```

## Linter

Use Ethlint

```bash
npm run lint:sol
```

Use ESLint

```bash
npm run lint:js
```

#### Note

IMPORTANT: Before commit run the lint and fix command:

```bash
npm run lint:fix
```

## Compile and test the contracts
 
Open the Truffle console

```bash
truffle develop
```

Compile 

```bash
compile 
```

Test

```bash
test
```

## Optional

Install the [truffle-flattener](https://github.com/alcuadrado/truffle-flattener)

```bash
npm install -g truffle-flattener
```

Usage

```bash
truffle-flattener contracts/faucet/TokenFaucet.sol > .dist/TokenFaucet.dist.sol
```

## License

Code released under the [MIT License](https://github.com/comethio/faucet-smartcontracts/blob/master/LICENSE).
