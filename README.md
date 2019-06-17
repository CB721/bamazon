Bamazon - CLI Shopping App

Bamazon is a CLI app where the user can view and purchase products.  The app will take in the order and remove the stock from the inventory (database).

The user is shown the Bamazon logo, a greeting and then a list of products they can purchase.  The list includes a product id, a description, the price and how many are in stock.  From there, they can either view their cart, or select an item to purchase.  If the cart is empty, they are told so and redirected to the products list.

The user tells Bamazon which item they want by selecting the id for the product.  Once selected, they are prompted to input how much of that item they would like.  If they attempt to purchase more of a product than what is available, they receive an error message and are redirected to the products list.

After the quantity has been entered, the user is presented with the option to either look at additional products or the checkout.  If they select checkout, all the items they have selected are displayed with their total costs and the total cost of the order.

From there, the user is again asked if they would like to continue shopping or if they would like to proceed with checkout.  If they proceed with checkout, they are prompted to provide their name, address and contact information.  If the user attempts to put in an invalid email or phone number, they are prompted to enter a valid one.

Once all of the shipping information has been collected, they are asked one final time if they would like to complete the purchase.  If they say no, they are redirected to the products list.  If they say yes, they are thanked for their purchase, their cart is emptied and they are taken back to the opening logo page.