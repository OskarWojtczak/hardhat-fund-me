# Funding Smart Contract with Hardhat 

This repository contains a Hardhat project that deploys a simple funding smart contract to a local development network and to test networks like Sepolia. The project includes unit and staging test scripts, as well as a mock contract to simulate an aggregator for local use.

## Installation

Clone the repository:

```bash
git clone https://github.com/OskarWojtczak/hardhat-fund-me.git
```
Install the dependencies:

```bash
cd hardhat-fund-me
npm install  //or yarn install
```
Compile the contracts:

```bash
npx hardhat compile //or yarn hardhat compile
```

## Usage

:warning:DISCLAIMER: Please do not share your private account key with anybody for any reason! My suggestion, should anyone like to test or deploy this contract is to make a new account that will only ever hold test currency like SepoliaETH.:warning:

To run tests or deploy to any test network please ensure to configure and provide (in a .env file or else):
 
1. The RPC url associated with the network
2. An Account Private Key for an account with sufficient test currency. (eg, SepoliaETH)
3. An Etherscan API key to verify the contract on etherscan.io (Optional)

Testnet currency can be obtained here: [https://faucets.chain.link](https://faucets.chain.link)

```bash
import foobar

# Run the unit tests
yarn hardhat test

# Run the staging test
yarn hardhat test --network sepolia

# Deploy contract to local network
yarn hardhat deploy

# Deploy contract to Sepolia network
yarn hardhat deploy --network sepolia
```


## Contract Details

The Fund Me smart contract is located in the contracts/FundMe.sol file. It has the following features:

- It allows people to send funds to the contract
- It stores information about who has funded the contract
- Funds can be withdrawn from the contract by the owner of the contract only

## Mock Contract

The mock contract is located in the contracts/test/MockV3Aggregator.js file. It can be used to test the code without deploying the actual contract to a network. The mock contract has the same interface as the real contract, but it doesn't interact with the blockchain.

## License

[MIT](https://choosealicense.com/licenses/mit/)
