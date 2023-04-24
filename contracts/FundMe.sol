// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./PriceConverter.sol";

//this contract will
// 1) get funds from users
// 2) Withdraw funds
// 2) Set minimum funding value in USD

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUMUSD = 50 * 1e18;

    address[] public s_funders;
    mapping(address => uint256) public s_addressToAmountFunded;

    address private immutable i_owner;

    AggregatorV3Interface public s_priceFeed;

    //any func with the modifier in the declaration will run this before it runs the function body
    modifier onlyOwner {
        //require(msg.sender == i_owner, "Sender is not owner!");
        if (msg.sender != i_owner) { revert FundMe__NotOwner();}
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    //if someone sends this contract money without calling the Fund() function
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        //Set a minimum limit for amount of funds sent
        //'require' keyword checks condition and if false 'reverts'. ie. sends funds back (and shows error message)
        //the funds sent back are the amount used to process contract - already spent computation
        //in this case, any code after the require would not be expensed to sender but any before would
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUMUSD, "Insufficient amount sent!");
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }


    function withdraw() public onlyOwner {
        //making func cheaper by not reading global funder array every loop cycle and storing local array in memory for duraction of function
        address[] memory funders = s_funders;
        for (uint256 i = 0; i < funders.length; i++) {
            //more expensive
            //address funder = s_funders[i];
            //cheaper
            address funder = funders[i];
            s_addressToAmountFunded[funder] = 0;
        }
        //reset funders array
        s_funders = new address[](0);

        //msg.sender = address
        //payable(msg.sender) = payable address
        // TRANSFER
        // SEND
        // CALL (recommended)
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call Fails!");

    }

    function getAddressToAmountFunded(address fundingAddress) public view returns (uint256) {
        return s_addressToAmountFunded[fundingAddress];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getOwner() public view returns(address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns(address) {
        return s_funders[index];
    }

}