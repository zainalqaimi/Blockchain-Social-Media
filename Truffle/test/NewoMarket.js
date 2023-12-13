const NewoMarket = artifacts.require("NewoMarket");
const NewoData = artifacts.require("NewoData");

contract('NewoMarket', (accounts) => {
  it('should list token on market', async () => {
    
    const newoMarketInstance = await NewoMarket.deployed();
    const newoDataInstance = await NewoData.deployed();
    console.log(newoMarketInstance.address);
    console.log(newoDataInstance.address);

    const originalOwner = accounts[0];

    const profile ="123";
    const friends = "456";
    const posts = "789";
    await newoDataInstance.mintNewo(profile, friends, posts, {from: originalOwner});

    // need to get contract address
    const dataAddress = newoDataInstance.address;
    const marketAddress = newoMarketInstance.address;

    const tokenId = 1;

    const price = 1;
    await newoDataInstance.approve(marketAddress, tokenId, {from: originalOwner});
    await newoMarketInstance.createMarketItem(dataAddress, tokenId, price, {from: originalOwner});

    // check id to market item and ensure market item properties are correct
    const marketItems = await newoMarketInstance.fetchMarketItems();
    const itemsLength = marketItems.length;
    const item = marketItems[0];
    const seller = item[3];
    const mPrice = item[5];
    // const owner = item[4];

    const owner = await newoDataInstance.ownerOf(tokenId);

    // check ownerOf newoData token and assert that it is market contract address

    // get owner of token id 1

    assert.equal(itemsLength, 1, "Incorrect number of items on the market")
    assert.equal(owner, marketAddress, "Market contract not listed as token owner")
    assert.equal(seller, originalOwner, "Seller is not original token owner");
    assert.equal(mPrice, price, "Price of market item is not same as what lister set");
  });
  it('should transfer token to buyer address', async () => {
    const buyer = accounts[2];

    const newoMarketInstance = await NewoMarket.deployed();
    const newoDataInstance = await NewoData.deployed();
    console.log(newoMarketInstance.address);
    console.log(newoDataInstance.address);

    const originalOwner = accounts[1];

    const profile ="123";
    const friends = "456";
    const posts = "789";
    await newoDataInstance.mintNewo(profile, friends, posts, {from: originalOwner});

    // need to get contract address
    const dataAddress = newoDataInstance.address;
    const marketAddress = newoMarketInstance.address;

    const tokenId = 2;

    const price = 1;
    await newoDataInstance.approve(marketAddress, tokenId, {from: originalOwner});
    await newoMarketInstance.createMarketItem(dataAddress, tokenId, price, {from: originalOwner});

    const itemId = 2;
    await newoMarketInstance.createMarketSale(dataAddress, itemId, {from: buyer, value: 1});

    const newOwner = await newoDataInstance.ownerOf(tokenId);

    assert.equal(newOwner, buyer, 'Token not transferred to buyer');
  });
});