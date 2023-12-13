const NewoData = artifacts.require("NewoData");
const NewoMarket = artifacts.require("NewoMarket");

module.exports = function(deployer) {
  deployer.deploy(NewoData);
  deployer.deploy(NewoMarket);
};
