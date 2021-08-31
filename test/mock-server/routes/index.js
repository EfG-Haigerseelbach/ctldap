var express = require('express');
var router = express.Router();

var crypto = require('crypto');
const chalk = require('chalk');

var config = {
  errorDuringFetchOfCsrfToken: false,
  loggedIn: false
};

console.log(chalk.blue(`[Mock-Server] adding routes`));

router.get('*', function (req, res, next) {
  console.log(chalk.blue(`[Mock-Server] received GET for URL ${req.originalUrl}`));
  if (req.originalUrl.endsWith("/api/csrftoken")) {
    console.log(chalk.blue(`[Mock-Server] client tries fetch a CSRF-token`));
    if (!config.errorDuringFetchOfCsrfToken) {
      var csrfToken = crypto.createHash('sha256').update('secret').digest('base64');
      res.send({ data: csrfToken });
    } else {
      console.log(chalk.blue('[Mock-Server] Simulating an error during fetch of the CSRF-token'));
      res.send({}); // do not send a 'data' object
    }
  } else {
    res.send('OK');
  }
});



router.post('*', function (req, res, next) {
  console.log(chalk.blue(`[Mock-Server] received POST for URL ${req.originalUrl}`));
  if (req.body.func == 'login') {
    console.log(chalk.blue(`[Mock-Server] client tries to login using email '${req.body.email}' and password '${req.body.password}'`));
    res.send({ status: 'success' });
    config.loggedIn = true;
  } else if (req.body.func == 'getUsersData') {
    console.log(chalk.blue('[Mock-Server] client tries to get user data'));
    if (config.loggedIn == false) {
      console.log(chalk.blue('[Mock-Server] client did not log in yet'));
      res.send({ status: "error", message: "Session expired!" });
    } else {
      var data = {
        "status": "success",
        "data": {
          "users": [
            {
              "id": "1",
              "cmsuserid": "johannesgilbert",
              "vorname": "Johannes",
              "name": "Gilbert",
              "email": "johannes.gilbert@posteo.de",
              "telefonhandy": "+491703752093",
              "telefonprivat": "",
              "plz": "35708",
              "strasse": "Eschenweg 3",
              "ort": "Haiger-Allendorf"
            }],
          "userGroups": {
            "1": ["Website", "Königskinder Mitarbeiter", "IT", "K5-Leitertraining", "Königskinder", "Technische Benutzer", "Gemeindeinfo", "Königskinder Themen"]
          }
        }
      };
      res.send(data);
    }
  } else {
    console.log(chalk.blue(JSON.stringify(req.body)));
    res.send();
  }
});

module.exports = { router, config };
