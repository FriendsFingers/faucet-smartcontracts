## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| dist/TokenFaucet.dist.sol | 6aecd29c5bf5fe87503adad9c3a9a198843e9928 |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **SafeMath** | Library |  |||
| └ | add | Internal 🔒 |   | |
| └ | sub | Internal 🔒 |   | |
| └ | mul | Internal 🔒 |   | |
| └ | div | Internal 🔒 |   | |
| └ | mod | Internal 🔒 |   | |
||||||
| **IERC20** | Interface |  |||
| └ | totalSupply | External ❗️ |   |NO❗️ |
| └ | balanceOf | External ❗️ |   |NO❗️ |
| └ | transfer | External ❗️ | 🛑  |NO❗️ |
| └ | allowance | External ❗️ |   |NO❗️ |
| └ | approve | External ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | External ❗️ | 🛑  |NO❗️ |
||||||
| **Address** | Library |  |||
| └ | isContract | Internal 🔒 |   | |
||||||
| **SafeERC20** | Library |  |||
| └ | safeTransfer | Internal 🔒 | 🛑  | |
| └ | safeTransferFrom | Internal 🔒 | 🛑  | |
| └ | safeApprove | Internal 🔒 | 🛑  | |
| └ | safeIncreaseAllowance | Internal 🔒 | 🛑  | |
| └ | safeDecreaseAllowance | Internal 🔒 | 🛑  | |
| └ | callOptionalReturn | Private 🔐 | 🛑  | |
||||||
| **Ownable** | Implementation |  |||
| └ | \<Constructor\> | Internal 🔒 | 🛑  | |
| └ | owner | Public ❗️ |   |NO❗️ |
| └ | isOwner | Public ❗️ |   |NO❗️ |
| └ | renounceOwnership | Public ❗️ | 🛑  | onlyOwner |
| └ | transferOwnership | Public ❗️ | 🛑  | onlyOwner |
| └ | _transferOwnership | Internal 🔒 | 🛑  | |
||||||
| **TokenRecover** | Implementation | Ownable |||
| └ | recoverERC20 | Public ❗️ | 🛑  | onlyOwner |
||||||
| **ERC165Checker** | Library |  |||
| └ | _supportsERC165 | Internal 🔒 |   | |
| └ | _supportsInterface | Internal 🔒 |   | |
| └ | _supportsAllInterfaces | Internal 🔒 |   | |
| └ | _supportsERC165Interface | Private 🔐 |   | |
| └ | _callERC165SupportsInterface | Private 🔐 |   | |
||||||
| **IERC165** | Interface |  |||
| └ | supportsInterface | External ❗️ |   |NO❗️ |
||||||
| **ERC165** | Implementation | IERC165 |||
| └ | \<Constructor\> | Internal 🔒 | 🛑  | |
| └ | supportsInterface | External ❗️ |   |NO❗️ |
| └ | _registerInterface | Internal 🔒 | 🛑  | |
||||||
| **IERC1363** | Implementation | IERC20, ERC165 |||
| └ | transferAndCall | Public ❗️ | 🛑  |NO❗️ |
| └ | transferAndCall | Public ❗️ | 🛑  |NO❗️ |
| └ | transferFromAndCall | Public ❗️ | 🛑  |NO❗️ |
| └ | transferFromAndCall | Public ❗️ | 🛑  |NO❗️ |
| └ | approveAndCall | Public ❗️ | 🛑  |NO❗️ |
| └ | approveAndCall | Public ❗️ | 🛑  |NO❗️ |
||||||
| **IERC1363Receiver** | Implementation |  |||
| └ | onTransferReceived | Public ❗️ | 🛑  |NO❗️ |
||||||
| **IERC1363Spender** | Implementation |  |||
| └ | onApprovalReceived | Public ❗️ | 🛑  |NO❗️ |
||||||
| **ERC1363Payable** | Implementation | IERC1363Receiver, IERC1363Spender, ERC165 |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | onTransferReceived | Public ❗️ | 🛑  |NO❗️ |
| └ | onApprovalReceived | Public ❗️ | 🛑  |NO❗️ |
| └ | acceptedToken | Public ❗️ |   |NO❗️ |
| └ | _transferReceived | Internal 🔒 | 🛑  | |
| └ | _approvalReceived | Internal 🔒 | 🛑  | |
||||||
| **Roles** | Library |  |||
| └ | add | Internal 🔒 | 🛑  | |
| └ | remove | Internal 🔒 | 🛑  | |
| └ | has | Internal 🔒 |   | |
||||||
| **DAORoles** | Implementation | Ownable |||
| └ | \<Constructor\> | Internal 🔒 | 🛑  | |
| └ | isOperator | Public ❗️ |   |NO❗️ |
| └ | isDapp | Public ❗️ |   |NO❗️ |
| └ | addOperator | Public ❗️ | 🛑  | onlyOwner |
| └ | addDapp | Public ❗️ | 🛑  | onlyOperator |
| └ | removeOperator | Public ❗️ | 🛑  | onlyOwner |
| └ | removeDapp | Public ❗️ | 🛑  | onlyOperator |
| └ | _addOperator | Internal 🔒 | 🛑  | |
| └ | _addDapp | Internal 🔒 | 🛑  | |
| └ | _removeOperator | Internal 🔒 | 🛑  | |
| └ | _removeDapp | Internal 🔒 | 🛑  | |
||||||
| **Organization** | Library |  |||
| └ | isMember | Internal 🔒 |   | |
| └ | creationDateOf | Internal 🔒 |   | |
| └ | stakedTokensOf | Internal 🔒 |   | |
| └ | usedTokensOf | Internal 🔒 |   | |
| └ | isApproved | Internal 🔒 |   | |
| └ | getMember | Internal 🔒 |   | |
| └ | addMember | Internal 🔒 | 🛑  | |
| └ | stake | Internal 🔒 | 🛑  | |
| └ | unstake | Internal 🔒 | 🛑  | |
| └ | use | Internal 🔒 | 🛑  | |
| └ | setApproved | Internal 🔒 | 🛑  | |
| └ | setData | Internal 🔒 | 🛑  | |
| └ | getFingerprint | Private 🔐 |   | |
||||||
| **DAO** | Implementation | ERC1363Payable, DAORoles |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | ERC1363Payable |
| └ | \<Fallback\> | External ❗️ |  💵 |NO❗️ |
| └ | join | External ❗️ | 🛑  |NO❗️ |
| └ | newMember | External ❗️ | 🛑  | onlyOperator |
| └ | setApproved | External ❗️ | 🛑  | onlyOperator |
| └ | setData | External ❗️ | 🛑  | onlyOperator |
| └ | use | External ❗️ | 🛑  | onlyDapp |
| └ | unstake | Public ❗️ | 🛑  |NO❗️ |
| └ | membersNumber | Public ❗️ |   |NO❗️ |
| └ | totalStakedTokens | Public ❗️ |   |NO❗️ |
| └ | totalUsedTokens | Public ❗️ |   |NO❗️ |
| └ | isMember | Public ❗️ |   |NO❗️ |
| └ | creationDateOf | Public ❗️ |   |NO❗️ |
| └ | stakedTokensOf | Public ❗️ |   |NO❗️ |
| └ | usedTokensOf | Public ❗️ |   |NO❗️ |
| └ | isApproved | Public ❗️ |   |NO❗️ |
| └ | getMemberByAddress | Public ❗️ |   |NO❗️ |
| └ | getMemberById | Public ❗️ |   |NO❗️ |
| └ | recoverERC20 | Public ❗️ | 🛑  | onlyOwner |
| └ | _transferReceived | Internal 🔒 | 🛑  | |
| └ | _approvalReceived | Internal 🔒 | 🛑  | |
| └ | _newMember | Internal 🔒 | 🛑  | |
| └ | _stake | Internal 🔒 | 🛑  | |
||||||
| **TokenFaucet** | Implementation | TokenRecover |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | dao | Public ❗️ |   |NO❗️ |
| └ | isEnabled | Public ❗️ |   |NO❗️ |
| └ | getDailyRate | Public ❗️ |   |NO❗️ |
| └ | getReferralRate | Public ❗️ |   |NO❗️ |
| └ | totalDistributedTokens | Public ❗️ |   |NO❗️ |
| └ | remainingTokens | Public ❗️ |   |NO❗️ |
| └ | getRecipientAddress | Public ❗️ |   |NO❗️ |
| └ | getRecipientsLength | Public ❗️ |   |NO❗️ |
| └ | receivedTokens | Public ❗️ |   |NO❗️ |
| └ | lastUpdate | Public ❗️ |   |NO❗️ |
| └ | getReferral | Public ❗️ |   |NO❗️ |
| └ | earnedByReferral | Public ❗️ |   |NO❗️ |
| └ | getReferredAddresses | Public ❗️ |   |NO❗️ |
| └ | getReferredAddressesLength | Public ❗️ |   |NO❗️ |
| └ | nextClaimTime | Public ❗️ |   |NO❗️ |
| └ | createFaucet | Public ❗️ | 🛑  | onlyOwner |
| └ | setFaucetRates | Public ❗️ | 🛑  | onlyOwner |
| └ | disableFaucet | Public ❗️ | 🛑  | onlyOwner |
| └ | enableFaucet | Public ❗️ | 🛑  | onlyOwner |
| └ | getTokens | Public ❗️ | 🛑  |NO❗️ |
| └ | getTokensWithReferral | Public ❗️ | 🛑  |NO❗️ |
| └ | _getRecipientTokenAmount | Internal 🔒 |   | |
| └ | _getReferralTokenAmount | Internal 🔒 |   | |
| └ | _distributeTokens | Internal 🔒 | 🛑  | |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
