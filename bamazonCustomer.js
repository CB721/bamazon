//inquirer for prompts
var inquirer = require("inquirer");
//mysql for database
var mysql = require("mysql");
//env to hide database password
require("dotenv").config();
//console.table for console formatting
var cTable = require('console.table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "9z5-gwF-kBn-BCy",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    displayProducts()
});

// Display all available items
function displayProducts() {
    connection.query("SELECT * FROM products", function (error, results) {
        if (error) throw error;
        console.table(results);
        // User prompt with questions
        inquirer
            // Option to view cart
            .prompt([
                {
                    name: "cartView",
                    type: "confirm",
                    message: "Would you like to view your cart?",
                    default: true
                }
            ])
            .then(function (response) {
                if (response.cartView) {
                    // Go to cart
                    viewCart();
                } else {
                    // Ask for ID of item they want
                    inquirer
                        .prompt([
                            {
                                name: "productIDSelection",
                                type: "rawlist",
                                choices: function () {
                                    var choicesArr = [];
                                    for (var i = 0; i < results.length; i++) {
                                        choicesArr.push(results[i].id);
                                    }
                                    return choicesArr;
                                }
                            }
                        ]).then(function (productSelction) {
                            var userSelection = connection.query("SELECT product_name FROM products WHERE ?",
                                {
                                    id: productSelction.productIDSelection
                                },
                                function (error) {
                                    if (error) throw error;
                                    console.log(userSelection);
                                    orderQuantity();
                                }
                            )
                        })
                }
            })
    })
}


// View cart 
function viewCart() {
    console.log("view cart success");
    console.log("--------------------------------");
    displayProducts()
}

// Ask how many they'd like
function orderQuantity() {
    console.log("Order quantity");
}

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




