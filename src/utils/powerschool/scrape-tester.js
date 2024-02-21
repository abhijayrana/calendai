const readlineSync = require("readline-sync");
const scrape = require("./scrape.js");

function processData(data) {
  console.log("data", data);
}

let password = readlineSync.question("Please enter your password: ", {
  hideEchoBack: true, // The typed password won't be visible.
});

let email = readlineSync.question("Please enter your email: ", {
  hideEchoBack: false,
});

scrape.loginAndScrapeGrades(processData, "bellarmine", email, password);
