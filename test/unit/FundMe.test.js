const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")


describe("FundMe", async function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture("all")
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    })
    
    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async () => {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("Fails if you do not send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.reverted
        })
        it("updated the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to array of funders", async function () {
            await fundMe.fund({ value: sendValue})
            const funder = await fundMe.s_funders(0)
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async function () {
        //before a withdraw can be tested alone the contract needs some funds on it already
        beforeEach( async function () {
            await fundMe.fund({ value: sendValue})
        })

        it("Withdraw ETH from a single founder", async function () {
            //getBalance() is a function of provider (which I'm guessing is built into something here. possibly hardhat)

            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            //pulling gasUsed and effectiveGasPrice from transactionReceipt
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            //multiplying 'big numbers' so we use .mul() function
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })

        it("Withdraw ETH from multiple funders", async function () {
            const accounts = await ethers.getSigners()
            for ( let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({ value: sendValue})
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            //pulling gasUsed and effectiveGasPrice from transactionReceipt
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            //multiplying 'big numbers' so we use .mul() function
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
            
            //make sure funders array/mapping is reset
            await expect(fundMe.s_funders(0)).to.be.reverted

        })

        it("Only allows owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const fundMeConnectedContract = await fundMe.connect(accounts[1])
            await expect(fundMeConnectedContract.withdraw()).to.be.reverted

        })
    })

})