console.log("oi1");
const express = require('express');
console.log("oi2");
const path = require('path');
console.log("oi3");
const nomeApp = process.env.npm_package_name;
console.log("oi4");
const app = express();
console.log("oi5");
app.use(express.static(`${__dirname}/dist/${nomeApp}`));
console.log("oi6");
app.get('/*', (req, res) => {
res.sendFile(path.join(`${__dirname}/dist/${nomeApp}/index.html`));
});
console.log("oi7");
app.listen(process.env.PORT || 8080);
console.log("oi8");
