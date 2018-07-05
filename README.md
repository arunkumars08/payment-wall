# payment-wall

Steps to run the application

Prerequisites
1. Node and NPM has to be present

Steps:

1. npm install in the project root directory
2. npm start
3. Navigate to http://localhost:8005 to see the application.

Technologies used

1. Javascript
2. HTML5
3. CSS
4. NPM
5. Gulp


1. Loader is shown initially,
2. On load of the application, the JS makes a call to the API to fetch the methods,
3. Fetched methods are populated
4. User can select any of the methods to go to the next screen,
5. The header has the selected method name,
6. It shows a payment form along with the preview of credit card, (hidden on mobiles and small tablets),
7. Validation for all the fields are handled as per the requirement (on button click),
8. As and when the user types the text on any of the text fields, he/she can see the preview appearing on the credit-card-preview area
9. Uses Luhn algorithm for credit card validation,
10. Once all are successfull, it makes a function call to the mockbackend function to check for if CVV is 123 or not.
11. Errors and Confirmations are handled accordingly.
