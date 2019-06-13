//inquirer for prompts
var inquirer = require("inquirer");
//mysql for database
var mysql = require("mysql");
//env to hide database password
require("dotenv").config();

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
    displayProducts()
});

// Display all available items
function displayProducts () {
    connection.query("SELECT * FROM products", function (error, results) {
        if (error) throw error;
        console.log(results);
    })
}
// User prompt with questions
    // Option to view cart
    // Ask for ID of item they want
    // Ask how many they'd like
// Placing order, check against quantity in database
    // If there is enough - order success message, subtract from database
    // If there isn't enought - insufficient quantity message and prevent order from going through
        // Redisplay all available items
// Add item(s) and cost to shopping cart
// Ask if user would like to purchase another item or view cart
    // If they would like to purchase other items - redisplay all available items
    // If they would like to view the cart - display all items they have selected
// User is viewing cart
    // Ask for address and payment information
    // Provide final cost and amount owed - prompt user to okay purchase
        // If user declines purchase - take them back to the cart
        // If user accepts purchase - purchase success message, display all available items




