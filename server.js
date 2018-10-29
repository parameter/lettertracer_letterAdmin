// content of index.js
const http = require('http');
const express = require('express');

const app = express();
const path = require('path');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/saveLetter', function(req, res) {
	console.log(req, res);
	res.sendStatus(200);
});

console.log('trying')

app.listen(3000, function() {
	console.log('Example app listening on port 3000!')
})