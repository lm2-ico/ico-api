const admin = require("firebase-admin");
const http = require('http');
const serviceAccount = require("./auth/serviceAccountKey.json");

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('https://pub-node26224.etherscan.io'));

const preICOcontractAddress = '0x5c5E49048a586f256270efAFf84b35FEA6Cc28Ff';
const preICOcontractABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"priceLC","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"LC","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"endTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"beneficiary","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"weiRaised","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"startTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"investorCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"crowdsaleFinished","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"priceWEI","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"_lcAddr","type":"address"},{"name":"_beneficiary","type":"address"},{"name":"_priceETH","type":"uint256"},{"name":"_priceLC","type":"uint256"},{"name":"_startTime","type":"uint256"},{"name":"_duration","type":"uint256"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amountRaised","type":"uint256"}],"name":"GoalReached","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"holder","type":"address"},{"indexed":false,"name":"tokenAmount","type":"uint256"},{"indexed":false,"name":"etherAmount","type":"uint256"}],"name":"NewContribution","type":"event"}];
const preICOcontract = new web3.eth.Contract(preICOcontractABI, preICOcontractAddress);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lordmancer-2-ico.firebaseio.com"
});

let investorCount = 0;
let weiRaised = 0;
let weiCap = 0;
let priceETH = 0;
let priceLC = 0;
let objectToSave = {
		investorCount,
		weiRaised,
		weiCap,
		priceETH,
		priceLC
};

let timer;

const update = async () => {
    try {

	    investorCount = Number(await preICOcontract.methods.investorCount().call());
			weiRaised = Number(await preICOcontract.methods.weiRaised().call()) / Math.pow(10,18);
			 priceETH = Number(await preICOcontract.methods.priceWEI().call());
			  priceLC = Number(await preICOcontract.methods.priceLC().call());
			   weiCap = Math.floor(2000000 * priceETH / priceLC);

		let needUpdate = 
			(objectToSave.investorCount != investorCount) ||
			(objectToSave.weiRaised != weiRaised) ||
			(objectToSave.weiCap != weiCap) ||
			(objectToSave.priceETH != priceETH) ||
			(objectToSave.priceLC != priceLC);

		objectToSave = {
			investorCount,
			weiRaised,
			weiCap,
			priceETH,
			priceLC
		};

		if (needUpdate) {
			admin.database().ref("preico/progress").set(objectToSave);
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