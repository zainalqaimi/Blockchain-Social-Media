var fs = require("fs");

fs.copyFile("build/contracts/NewoData.json", "../src/contracts/newoDataContract.json", (err) => {
  if (err) throw err;
  console.log("✅ Your NewoData contract's ABI was copied to the frontend");
});

fs.copyFile("build/contracts/NewoMarket.json", "../src/contracts/newoMarketContract.json", (err) => {
  if (err) throw err;
  console.log("✅ Your NewoMarket contract's ABI was copied to the frontend");
});

// create another one for marketplace
// i.e. have to json files: NewoData.json and NewoMarket.json