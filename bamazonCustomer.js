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
    start()
});


// Open page icon
function start() {
    console.log("\n");
    console.log("*******************                                            ****");
    console.log("**********************                                         ****");
    console.log("***********************                                        ****");
    console.log("****               *****                                       ****");
    console.log("****                ****                                       ****");
    console.log("****               *****                                       ****");
    console.log("***********************                                        ****");
    console.log("***********************      ***********     ****** ******     ****");
    console.log("****               *****    *************    *************");
    console.log("****                ****    *************    *************");
    console.log("****               *****    ****     ****    *** ***** ***     ****");
    console.log("***********************     ****     ****    ***  ***  ***     ****");
    console.log("**********************      ********** **    ***   *   ***     ****");
    console.log("*********************        ********  **    ***       ***     ****");
    console.log("\n");
    displayProducts();
}


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
                    type: "rawlist",
                    message: "Would you like to do?",
                    choices: [
                        "Shop!",
                        "View my cart"
                    ]
                }
            ])
            .then(function (response) {
                if (response.cartView === "View my cart") {
                    // Go to cart
                    checkCart();
                } else {
                    makePurchase(results);
                }
            })
    })
}

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
        if (updateQuantity >= 0) {
            // Order success message
            console.log("Added " + orderQuantity + " " + results[0].product_name + "'s to your cart!\n");
            // Subtract from database
            connection.query("UPDATE products SET stock_quantity =' " + updateQuantity + " 'WHERE id = " + itemID, function (error) {
                if (error) throw error;
            })
            // Push object to cart array
            var orderValue = { item: results[0].product_name, quantity: orderQuantity, price: results[0].price };
            // Push to cart array
            cart.push(orderValue)
            // Go to cart
            checkCart();
        } else {
            // If there isn't enought - insufficient quantity message and prevent order from going through
            console.log("Insufficient quantity.  Please check availability and try again.\n");
            console.log("----------------------------------------------------------------\n");
            // Redisplay all available items
            displayProducts()
        }
    })
}

// Empty array for the cart
var cart = [];

// Clear all values from cart array
function emptyCart() {
    cart.length = 0;
}

function checkCart() {
    // Check if anything is in the cart
    if (cart.length > 0) {
        var soMuchCart = function () {
            return new Promise(resolve => {
                for (var i = 0; i < cart.length; i++) {
                    var itemQuantity = cart[i].quantity
                    var item = cart[i].item;
                    var price = cart[i].price;
                    displayCart(item, itemQuantity, price);
                }
                resolve();
            });
        };
        var functionOrder = async function () {
            const random = await soMuchCart();
            const randomMore = await orderTotal();
            const randomToo = await confirmTotal();
        }
        functionOrder();
    } else {
        // If cart is empty, display error
        console.log("\n" + "Sorry, your cart is empty.  Please add an item and check back later.\n");
        console.log("Taking you back to the home page...\n");
        displayProducts()
    }
}

// Empty array for order total
var orderTotalArr = [];

// Empty order total array if user does not complete purchase
    //  If not emptied, it will keep re-adding the same items and give a false total
function emptyOrderTotal () {
    orderTotalArr.length = 0;
}

function displayCart(item, quantity, price) {
    // Item total rounded to two decimal places
    var itemTotal = (price * quantity).toFixed(2);
    // Log each item with total
    console.log(item + " || " + " Quantity: " + quantity + " || " + " Price per item: $" + price + " || " + " Item Total: $" + itemTotal + "\n");
    // Add each item total to order total array
    orderTotalArr.push(itemTotal);
}

function orderTotal () {
    var total = 0;
    for (var i = 0; i < orderTotalArr.length; i++) {
        total += parseFloat(orderTotalArr[i]);
    }
    console.log("Order total: $" + total + "\n");
}

function confirmTotal() {
    return new Promise(resolve => {
        // Ask if they would like to continue shopping or complete purchase
        inquirer
            .prompt([
                {
                    name: "confirmPurchase",
                    type: "rawlist",
                    message: "What would you like to do next?",
                    choices: [
                        'Continue shopping!',
                        'Checkout'
                    ]
                }
            ]).then(function (answers) {
                if (answers.confirmPurchase === 'Continue shopping!') {
                    console.log("Returning to the item selection page...\n");
                    emptyOrderTotal();
                    displayProducts();
                } else if (answers.confirmPurchase === 'Checkout') {
                    console.log("Taking you to the payment page...\n");
                    paymentPage();
                } else {
                    console.log("Invalid selection.\n");
                }
            })
        resolve();
    });
}

function paymentPage() {
    console.log("Please enter your shipping information...\n");
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'first_name',
                message: "What's your first name?",
                default: function () {
                    return 'Will';
                }
            },
            {
                type: 'input',
                name: 'last_name',
                message: "What's your last name?",
                default: function () {
                    return 'Smith';
                }
            },
            {
                type: 'input',
                name: 'address',
                message: "What's your address?",
                default: function () {
                    return 'West Philadephia'
                }
            },
            {
                type: 'input',
                name: 'email',
                message: "What's your email?",
                default: function () {
                    return 'freshprince@belair.gov'
                },
                // Provide error if user inputs an invalid email address
                validate: function (value) {
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
                default: function () {
                    return '2061234567'
                },
                // Provide error if user inputs an invalid phone number
                validate: function (value) {
                    var pass = value.match(
                        /^([01]{1})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i
                    );
                    if (pass) {
                        return true;
                    }

                    return 'Please enter a valid phone number';
                }
            },
            {
                type: 'input',
                name: 'creditcard',
                message: "Please enter your credit card number..."
            }
        ]).then(function (answers) {
            var userInfo = {
                first_name: answers.first_name, last_name: answers.last_name, address: answers.address, email: answers.email, phone: answers.phone, payment: answers.creditcard
            };
            console.log("\n");
            console.table(userInfo);
            console.log("\n");
            finalizePurchase(userInfo);
        })
}

// Finalize purchase
function finalizePurchase(userInfo) {
    inquirer
        .prompt([
            {
                name: "purchase",
                type: "confirm",
                message: "Please confirm your shipping details...",
                default: true
            }
        ]).then(function (response) {
            if (response.purchase) {
                console.log("\n" + userInfo.first_name + " you have completed your purchase.  Thank you for your business!\n");
                console.log("Signing out...\n");
                console.log("---------------------------------------------------------------\n");
                // empty cart function
                emptyCart();
                // empty order total
                emptyOrderTotal();
                // Restart application
                start();
            } else {
                console.log("\n");
                paymentPage();
            }
        })
}