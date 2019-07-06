#!/usr/bin/env bash

surya inheritance dist/TokenFaucet.dist.sol | dot -Tpng > analysis/inheritance-tree/TokenFaucet.png

surya graph dist/TokenFaucet.dist.sol | dot -Tpng > analysis/control-flow/TokenFaucet.png

surya mdreport analysis/description-table/TokenFaucet.md dist/TokenFaucet.dist.sol
