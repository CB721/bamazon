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
                    makePurchase(results);
                }
            })
    })
}

// Make purchase
function makePurchase(results) {
    // Ask for ID of item they want
    inquirer
        .prompt([
            {
                name: "productID",
                type: "rawlist",
                choices: function () {
                    var choicesArr = [];
                    for (var i = 0; i < results.length; i++) {
                        choicesArr.push(results[i].id);
                    }
                    return choicesArr;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "How many would you like to purchase?"
            }
        ]).then(function (answer) {
            var orderQuantity = answer.quantity;
            var itemID = answer.productID;
            stockUpdate(orderQuantity, itemID);
        })
}

// Empty array for cart
    // ID : Quantity
var cart = [];

// View cart 
function viewCart() {
    // Check if anything is in the cart
    if (cart.length > 0) {
        console.log(cart);
    } else {
        console.log("Sorry, your cart is empty.  Please add an item and check back later.\n");
        console.log("Taking you back to the home page.\n");
        displayProducts()
    }
    // Display total of each item with price
    // Total price of order
}

// Placing order, check against quantity in database
function stockUpdate(orderQuantity, itemID) {
    console.log("Order Quanity: " + orderQuantity);
    console.log("Item ID: " + itemID);
    // Select by ID
    connection.query("SELECT * FROM products WHERE id = " + itemID, function (error, results) {
        if (error) throw error;
        // Quantity available in database
        var dbQuantity = results[0].stock_quantity;
        // Updated quantity available in database
        var updateQuantity = dbQuantity - orderQuantity;
        // If there is enough
        if (updateQuantity > 0) {
            // Order success message
            console.log("Added " + orderQuantity + " " + results[0].product_name + "'s to your cart!\n");
            // Subtract from database
            connection.query("UPDATE products SET stock_quantity =' " + updateQuantity + " 'WHERE id = " + itemID, function (error, results2) {
                if (error) throw error;
            })
            // Value to go to cart
            var cartValue = itemID + " : " + orderQuantity;
            // Push to cart array
            cart.push(cartValue)
            // Go to cart
            viewCart();
        } else {
            // If there isn't enought - insufficient quantity message and prevent order from going through
            console.log("Insufficient quantity.  Please check availability and try again.\n");
            console.log("---------------------------\n");
            // Redisplay all available items
            displayProducts()
        }
    })
}

    
// Add item(s) and cost to shopping cart
// Ask if user would like to purchase another item or view cart
    // If they would like to purchase other items - redisplay all available items
    // If they would like to view the cart - display all items they have selected
// User is viewing cart
    // Ask for address and payment information
    // Provide final cost and amount owed - prompt user to okay purchase
        // If user declines purchase - take them back to the cart
        // If user accepts purchase - purchase success message, display all available items