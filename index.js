const admin = require("firebase-admin");
const http = require('http');
const serviceAccount = require("./auth/serviceAccountKey.json");

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/'));

const ICOcontractAddress = '0x47B8B6256F49CBA6c8bd37361cAc8b0Fe324D605';
const ICOcontractABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lcSold","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"period3Numerator","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"priceLC","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"LC","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"endTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"beneficiary","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"weiRaised","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"manualLCs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"premiumValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"time1","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"period2Numerator","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"period3Denominator","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"startTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_sender","type":"address"},{"name":"_value","type":"uint256"}],"name":"manualSell","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"period2Denominator","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"finishCrowdsale","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"priceETH","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"time2","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"investorCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"crowdsaleFinished","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_lcAddr","type":"address"},{"name":"_beneficiary","type":"address"},{"name":"_priceETH","type":"uint256"},{"name":"_priceLC","type":"uint256"},{"name":"_startTime","type":"uint256"},{"name":"_period1","type":"uint256"},{"name":"_period2","type":"uint256"},{"name":"_duration","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amountRaised","type":"uint256"}],"name":"GoalReached","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"holder","type":"address"},{"indexed":false,"name":"tokenAmount","type":"uint256"},{"indexed":false,"name":"etherAmount","type":"uint256"}],"name":"NewContribution","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];
const ICOcontract = new web3.eth.Contract(ICOcontractABI, ICOcontractAddress);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lordmancer-2-ico.firebaseio.com"
});

let investorCount = 1473;
let weiRaised = 1437;
const priceETH = 1;
const priceLC = 2970;
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

admin.database().ref("ico/progress/usdRaised").on("value", (data) => {
	usdRaised = data.val();
	// console.log(`usdRaised =  ${usdRaised}`);
}, (err) => {
	console.log(`The read failed: ${err.code}`);
});

const update = async () => {
    try {

	    investorCount = Number(await ICOcontract.methods.investorCount().call());
			weiRaised = (Number(await ICOcontract.methods.weiRaised().call()) / Math.pow(10,18)).toFixed(2);
			 lcManual = (Number(await ICOcontract.methods.manualLCs().call()) / Math.pow(10,18)).toFixed(2); 
			   lcSold = (Number(await ICOcontract.methods.lcSold().call()) / Math.pow(10,18)).toFixed(2);

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