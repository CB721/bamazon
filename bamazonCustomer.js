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
    console.log("Welcome to Bamazon!\n");
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

// Finalize purchase
function finalizePurchase (userInfo) {
    inquirer
        .prompt([
            {
                name: "purchase",
                type: "confirm",
                message: "Would you like to proceed with your purchase?",
                default: true
            }
        ]).then(function (response) {
            if (response.purchase) {
                console.log(userInfo.first_name + " you have completed your purchase.  Thank you for your business!\n");
                console.log("Signing out...\n");
                console.log("---------------------------------------------------------------\n");
                // empty cart function
                emptyCart();
                displayProducts();
            } else {
                displayProducts();
            }
        })
}

// Make purchase
function makePurchase(results) {
    console.log("\n");
    // Ask for ID of item they want
    inquirer
        .prompt([
            {
                name: "productID",
                type: "rawlist",
                message: "Please enter the ID of the item you would like to purchase.",
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

// Clear all values from cart array
function emptyCart() {
    cart.length = 0;
}

// Empty array for the cart
var cart = [];

// View cart 
function viewCart() {
    // Check if anything is in the cart
    if (cart.length > 0) {
        for (var i = 0; i < cart.length; i++) {
            var itemQuantity = cart[i].quantity
            var cartID = cart[i].id;
            displayCart(cartID, itemQuantity);
        }
    } else {
        
        console.log("\n" + "Sorry, your cart is empty.  Please add an item and check back later.\n");
        console.log("Taking you back to the home page...\n");
        displayProducts()
    }
}

function displayCart(id, quantity) {
    var orderTotal = "";
    connection.query("SELECT product_name, price FROM products WHERE id = " + id, function (error, results) {
        if (error) throw error;
        for (var i = 0; i < results.length; i++) {
            // Get price from db
            var itemPrice = results[0].price;
            // Item total rounded to two decimal places
            var itemTotal = (itemPrice * quantity).toFixed(2);
            // Log each item with total
            console.log(results[0].product_name + " Quantity: " + quantity + " Price per item: $" + itemPrice + " Item Total: $" + itemTotal + "\n");
            orderTotal += itemTotal;
        }
        // Log order total
        console.log("Your order total is $" + orderTotal + "\n");
        // Ask if they would like to continue shopping or complete purchase
        inquirer
        .prompt([
            {
                name: "confirmPurchase",
                type: "rawlist",
                message: "What would you like to do next?",
                choices: [
                    'Return to store',
                    'Go to checkout'
                ]
            }
        ]).then(function (answers) {
            if (answers.confirmPurchase === 'Return to store') {
                console.log("Return to the homepage...\n");
                displayProducts();
            } else {
                console.log("Taking you to the payment page...\n");
                paymentPage(orderTotal);
            }
        })
    })
}

function paymentPage (orderTotal) {
    console.log("Your order total is $" + orderTotal + "\n")
    console.log("Please enter your shipping information...\n");
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'first_name',
                message: "What's your first name?"
              },
              {
                type: 'input',
                name: 'last_name',
                message: "What's your last name?",
                default: function() {
                  return 'Doe';
                }
              },
              {
                type: 'input',
                name: 'address',
                message: "What's your address",
              },
              {
                  type: 'input',
                  name: 'email',
                  message: "What's your email?",
                  validate: function(value) {
                      var pass = value.match(
                        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                      );
                      if (pass) {
                          return true;
                      }
                      return 'Please enter a valid email address'
                  }
              },
              {
                type: 'input',
                name: 'phone',
                message: "What's your phone number?",
                validate: function(value) {
                  var pass = value.match(
                    /^([01]{1})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i
                  );
                  if (pass) {
                    return true;
                  }
            
                  return 'Please enter a valid phone number';
                }
              }
        ]).then(function (answers) {
            var userInfo = {
                first_name: answers.first_name, last_name: answers.last_name, address: answers.address, email: answers.email, phone: answers.phone
            };
            console.log("\n");
            console.table(userInfo);
            console.log("\n");
            finalizePurchase(userInfo);
        })
}

// Placing order, check against quantity in database
function stockUpdate(orderQuantity, itemID) {
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
            // Push object to cart array
            var orderValue = { id: itemID, quantity: orderQuantity };
            // Push to cart array
            cart.push(orderValue)
            // Go to cart
            viewCart();
        } else {
            // If there isn't enought - insufficient quantity message and prevent order from going through
            console.log("Insufficient quantity.  Please check availability and try again.\n");
            console.log("----------------------------------------------------------------\n");
            // Redisplay all available items
            displayProducts()
        }
    })
}

// User is viewing cart
    // Ask for address and payment information
    // Provide final cost and amount owed - prompt user to okay purchase
        // If user declines purchase - take them back to the cart
        // If user accepts purchase - purchase success message, display all available items