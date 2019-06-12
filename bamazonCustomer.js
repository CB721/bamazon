//inquirer for prompts
var inquirer = require("inquirer");
//mysql for database
var mysql = require("mysql");
//env to hide database password
require("dotenv").config();

//sql variable
// var sqlDatabase = new sqlDatabase (keys.sqlDatabase);

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    //username
    user: "root",

    //password
    password: "9z5-gwF-kBn-BCy",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
});