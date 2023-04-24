// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

//creating a library

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {

    function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint256) {
        // ABI  
        // Address 0x694AA1769357215DE4FAC081bf1f309aDC325306
        (, int256 price ,,,) = priceFeed.latestRoundData();
        // ETH in terms of USD
        return uint256(price * 1e10); //msg.value is 18 decimals. ETH is 8. Add the extra 10 

    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        return priceFeed.version();
    }

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns(uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmoutInUSD = (ethPrice * ethAmount) / 1e18;
        return ethAmoutInUSD;
    }
}