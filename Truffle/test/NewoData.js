const NewoData = artifacts.require("NewoData");

contract('NewoData', (accounts) => {
  it('sends new token to minter', async () => {
    const profile ="123";
    const friends = "456";
    const posts = "789";
    const newoDataInstance = await NewoData.deployed();
    await newoDataInstance.mintNewo(profile, friends, posts);

    // get owner of token id 1
    const balance = await newoDataInstance.balanceOf(accounts[0]);
    const owner = await newoDataInstance.ownerOf(1);
    console.log(accounts[0]);
    assert.equal(balance, 1, "Balance of minter did not increment after minting");
    assert.equal(owner, accounts[0], "Token did not get sent to minter address");
  });
  it('should correctly store stream ids', async () => {
    const profile ="123";
    const friends = "456";
    const posts = "789";
    const newoDataInstance = await NewoData.deployed();
    await newoDataInstance.mintNewo(profile, friends, posts);
    const profileId = await newoDataInstance.getProfile(1);
    const friendsId = await newoDataInstance.getFriends(1);
    const postsId = await newoDataInstance.getPosts(1);

    assert.equal(profileId, profile, 'Profile Stream ID not stored correctly');
    assert.equal(friendsId, friends, 'Friends Stream ID not stored correctly');
    assert.equal(postsId, posts, 'Posts Stream ID not stored correctly');
  });
});