const inquirer = require("inquirer");
const fs = require("fs");
const util = require("util");
var pdf = require('html-pdf');
const generate = require('./generateHTML');
const axios = require("axios");
const open = require('open');

const writeFileAsync = util.promisify(fs.writeFile);


function promptUser() {
    return inquirer.prompt([
        {
            type: "input",
            name: "username",
            message: "What is your GitHub Username?"
        },
        {
            type: "input",
            name: "color",
            message: "What is your favorite color?"
        }

    ]);
}


let userAnswers = {};
promptUser()
    .then(function (answers) {
        userAnswers = answers;
        console.log(answers);


        const queryUrl = `https://api.github.com/users/${answers.username}`;
        return axios.get(queryUrl)


    })
    .then(function (response) {
        console.log(response);
        const html = generate(userAnswers, response);

        return writeFileAsync("index.html", html);

    })
    .then(function () {
        console.log("Successfully wrote to index.html");

        var htmlPDF = fs.readFileSync('./index.html', 'utf8');
        var options = { format: 'Letter' };

        return new Promise((resolve, reject) => {
            pdf.create(htmlPDF, options).toFile('./index.pdf', function (err, res) {

                if (err) return reject(err);
                return resolve(res);

            })
        })

    })

    .then(function (res) {
        console.log("This works!", res);

        open('index.pdf');
    })
    .catch(function (err) {
        console.log(err);

    });