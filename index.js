const admin = require("firebase-admin");
const http = require('http');
const serviceAccount = require("./auth/serviceAccountKey.json");

// const Web3 = require('web3')
// const web3 = new Web3(new Web3.providers.HttpProvider('https://pub-node26224.etherscan.io'));

// const ICOcontractAddress = '';
// const ICOcontractABI = ;
// const ICOcontract = new web3.eth.Contract(ICOcontractABI, ICOcontractAddress);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lordmancer-2-ico.firebaseio.com"
});

let investorCount = 1473;
// let weiRaised = 1437;
// const priceETH = Number(await ICOcontract.methods.priceETH().call());
// const priceLC = Number(await ICOcontract.methods.priceLC().call());
const priceETH = 1;
const priceLC = 330;
const lcCap = 13000000;
let lcManual = 165360;
let lcSold = 625200;
let usdRaised = 16536;
let objectToSave = {
			investorCount,
			weiRaised,
			priceETH,
			priceLC,
			lcCap,
			lcManual,
			lcSold,
			usdRaised
};

let timer;

const update = async () => {
    try {

	  //   investorCount = Number(await ICOcontract.methods.investorCount().call());
			// weiRaised = (Number(await ICOcontract.methods.weiRaised().call()) / Math.pow(10,18)).toFixed(2);
			//  lcManual = (Number(await ICOcontract.methods.manualLCs().call()) / Math.pow(10,18)).toFixed(2); 
			//    lcSold = (Number(await ICOcontract.methods.lcSold().call()) / Math.pow(10,18)).toFixed(2);

	    investorCount++;
			weiRaised++;
			 lcManual++; 
			   lcSold++;
			usdRaised++;

		let needUpdate = 
			(objectToSave.investorCount != investorCount) ||
			(objectToSave.weiRaised != weiRaised) ||
			(objectToSave.lcManual != lcManual) ||
			(objectToSave.lcSold != lcSold);

		objectToSave = {
			investorCount,
			weiRaised,
			priceETH,
			priceLC,
			lcCap,
			lcManual,
			lcSold,
			usdRaised
		};

		if (needUpdate) {
			admin.database().ref("ico/progress").set(objectToSave);
		}

	} catch (e) {
		console.log(e);
	} finally {
		timer = setTimeout(update, 10000);
	}
};

timer = setTimeout(update, 10000);

const beforeDie = () => {
	clearTimeout(timer);
	server.close(() => console.log("Died!"));
};

const server = http.createServer((req, res) => {
  res.end();
});
server.listen(8080);

process.on('SIGTERM', beforeDie);
process.on('SIGINT', beforeDie);