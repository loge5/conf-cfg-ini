var Mocha = require('mocha');
var mocha = new Mocha({});
mocha.addFile('./conf-cfg-ini.spec');
mocha.run();

