const admin = require("firebase-admin");
const http = require('http');
const serviceAccount = require("./auth/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lordmancer-2-ico.firebaseio.com"
});

let investorsCount = 0;
let weiRaised = 0;
const update = () => {
	investorsCount += 1;
	weiRaised += (1000 + Math.floor(500 * Math.random()));

	admin.Database().ref("preico/progress").set({
		investorsCount,
		weiRaised
	});
};

// TODO http health check

const timer = setInterval(update, 10000);

const beforeDie = () => {
	clearInterval(timer);
	server.close(() => console.log("Died!"));
};

const server = http.createServer((req, res) => {
  res.end();
});
server.listen(8080);

process.on('SIGTERM', beforeDie);
process.on('SIGINT', beforeDie);