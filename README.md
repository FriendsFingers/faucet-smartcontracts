# Token faucet

[![Build Status](https://travis-ci.org/comethio/faucet-smartcontracts.svg?branch=master)](https://travis-ci.org/comethio/faucet-smartcontracts) 
[![Coverage Status](https://coveralls.io/repos/github/comethio/faucet-smartcontracts/badge.svg?branch=master)](https://coveralls.io/github/comethio/faucet-smartcontracts?branch=master)

Smart Contracts for an ERC20 token faucet with referral system.


## Development

Install Truffle if you want to run your own node

Version 4.1.15 required

```bash
npm install -g truffle
```

### Install dependencies

```bash
npm install
```

### Linter

Use Ethlint

```bash
npm run lint:sol
```

Use ESLint

```bash
npm run lint:js
```

Use both and fix

```bash
npm run lint:fix
```

## Usage
 
### Compile

```bash
npm run compile
```

### Test 

```bash
npm run test 
```

### Code Coverage

```bash
npm run coverage
```

### Profiling

```bash
npm run profile
```

## Optional

Install the [truffle-flattener](https://github.com/alcuadrado/truffle-flattener)

```bash
npm install -g truffle-flattener
```

Usage

```bash
truffle-flattener contracts/faucet/TokenFaucet.sol > dist/TokenFaucet.dist.sol
```

## License

Code released under the [MIT License](https://github.com/comethio/faucet-smartcontracts/blob/master/LICENSE).
