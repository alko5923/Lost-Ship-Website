// Global arrays

// Array of all orders
allOrders = [];

// Array for the current order
currentOrder = [];

// Variable that holds the current table choice
currentTable = null;

// Variable that holds the amount of active orders in the pub
numOrders = 0;

// Notify security
function notifySecurity() {
    alert("Security notified!");
}

// Creates a new order window
function newOrderWindow() {
    var elem = document.getElementById("staff-new-order");
    var elemDisplay = window.getComputedStyle(elem).display;

    //var elem2 = document.getElementById("staff-order-sum");
    //var elem2Display = window.getComputedStyle(elem2).display;

    if (elemDisplay === "none") {
        $("#staff-new-order").show();
    }
    else if (elemDisplay !== "none") {
        $("#staff-new-order").hide();
    }
    $("#staff-edit-order").show();
    $("#staff-pay-order").show();
}


function addItemToOrder() {

    var addedItem = (document.getElementById("add-to-order").elements.namedItem("add-name").value);
    var quantity = (document.getElementById("add-to-order").elements.namedItem("add-quantity").value);
    var table = (document.getElementById("add-to-order").elements.namedItem("add-table").value);


    for (var i = 0; i < tempdb.length; i++) {
        var item = tempdb[i];
        var itemName = item.namn;

        // Loop through each item in the database
        if(itemName.localeCompare(addedItem) === 0) {
            if(quantity != 0) {
                // Checks if the desired quantity is available in stock
                if (quantity <= tempdb[i].stock) {
                    // Pushes the item to the order
                    currentOrder.push(itemName);
                    // Desired quantity
                    currentOrder.push(quantity);
                    // Total price is calculated and added to the array
                    var totalSum = tempdb[i].prisinklmoms * quantity + " SEK";
                    currentOrder.push(totalSum);
                    // The quantity in the database is decreased with the amount of the order
                    tempdb[i].stock -= quantity;

                    // Change the view with the new stock quantity
                    staffLoadBeverages();
                    console.log("New stock is: " + tempdb[i].stock);
                    //break;

                    // TODO: See what table was chosen


                } else {
                    alert("Not enough in stock! Available: " + tempdb[i].stock);
            }} else {
                alert("Quantity can not be 0!");
            }
        } else {
            console.log("Item does not exist, check spelling!");
        }
    }
    if(table == "Bar" || table == "bar" || table == "bar " || table == 0) {
        allTables.splice(0, 0, currentOrder);
        currentTable = 0;
    }
    else {
        allTables.splice(table, 0, currentOrder);
        currentTable = table;
    }
// TODO: debugging
//    console.log(tempdb[0].artikelid);
//    console.log(currentOrder);
    //var display = currentOrder.toString();
    //document.getElementById("staff-order-view").innerHTML = null;
    setOrderView();
}

function editOrder() {
    return;
}

function submitOrder() {
    currentOrder.splice(0, 0, 'Order ' +
        (numOrders+1) );
    allOrders.push(currentOrder);
    numOrders++;
    console.log(allOrders);
    currentOrder = [];
    document.forms['add-to-order'].reset();
    setOrderView();
}


// Creates a table for the order
function setOrderView() {

    if(currentTable == 0) {
        document.getElementById("staff-order-view").innerHTML = "Bar"
    }
    else {
        document.getElementById("staff-order-view").innerHTML =  "Table " + currentTable;
    }

    var tableData = ["Name: ", "Quantity: ", "Price: "];
    var perrow = 3,
        table = document.createElement("table"),
        row = table.insertRow();

    /*if(currentOrder.length == 0) {
        return;
    }*/

    // Creates a row for explanation of the table entries
    for(var j = 0; j < 3; j++) {
        var cell = row.insertCell();
        cell.innerHTML = tableData[j];
        if(j == 2) {
            row = table.insertRow();
        }
    }
    // The actual entries
    for(var i = 0; i < currentOrder.length; i++) {
        cell = row.insertCell();
        cell.innerHTML = currentOrder[i];

        var next = i + 1;
        if(next%perrow == 0 && next != currentOrder.length) {
            row = table.insertRow();
        }
    }
    document.getElementById("staff-order-view").appendChild(table);
}

function editOrder() {
    return;
}

function payOrder() {
    return;
}

function clearOrder(currentOrder) {
    // Put pack the quantity of already ordered items in the database
    // Empty the array of the order.
    var addedItem = (document.getElementById("add-to-order").elements.namedItem("add-name").value);
    var quantity = (document.getElementById("add-to-order").elements.namedItem("add-quantity").value);

    for(var i = 0; i < tempdb.length; i++){
        if(tempdb[i].name.localeCompare(currentOrder[i])) {
            tempdb[i].quantity += quantity;
            currentOrder.splice(i,1);
        }
    }
    setOrderView();
}

/* Functions for tables */
function showTables() {
    var x = allTables.toString();
    document.getElementById("show-tables").innerHTML = x;
    return x;
}

// Updates the table view
function updateTableView() {
    var table = $("#tableOptions :selected").text();
    $("#show-table-choice").text(table);
}

// Global variable for all tables in the pub
var allTables = [];

// Creates all tables in the pub
function createAllTables() {
    // Number of tables in the pub
    var numTables = 11;
    for(var i = 0; i < numTables; ++i) {
        allTables.push(i);
    }
    return allTables;
}

// Sets the HTML code for all tables in the pub
function setTableHtml() {
    createAllTables();
    var chooseTable = document.getElementById("tableOptions");
    //Iterates through the array of tables
    var opt = allTables[i];
    tableOptions.innerHTML += "<option value=\"" + 0 + "\">" + "Bar" + "</option>";
    for(var i = 1; i < allTables.length; i++) {
        var opt = allTables[i]; //[0];
        // Creates html code for each option in array of tables
        tableOptions.innerHTML += "<option value=\"" + i + "\">" + "Table " + opt + "</option>";
    }
}

// Shows the window for all tables
function showTableWindow() {
    var elem = document.getElementById("staff-all-tables");
    var elemDisplay = window.getComputedStyle(elem).display;

    if (elemDisplay === "none") {
        $("#staff-all-tables").show();
    }
    else if (elemDisplay !== "none") {
        $("#staff-all-tables").hide();
    }
}

// Shows the window for all orders
function allOrdersWindow() {
    var elem = document.getElementById("staff-all-orders");
    var elemDisplay = window.getComputedStyle(elem).display;

    if (elemDisplay == "none") {
        $("#staff-all-orders").show();
    }
    else if (elemDisplay !== "none") {
        $("#staff-all-orders").hide();
    }
    setOrdersHtml();
}

// Global variable to keep track of the orders that has gotten set
orderToHtml = 0;

// Creates html for all orders in array orders
function setOrdersHtml() {
    var orderOptions = document.getElementById("order-options");
    /* Iterates through the array of orders */
    console.log(allOrders);

    if(orderToHtml == allOrders.length) {
        staffUpdateOrderView()
    } else {
        for(var i = 0; i < allOrders.length; i++) {
            var opt = allOrders[i][0];
            /* Creates html code for each order available */
            orderOptions.innerHTML += "<option value=\"" + i + "\">" + opt + "</option>";
            orderToHtml++;
        }
        staffUpdateOrderView();
    }

//    staffUpdateOrderView();
}

// Updates view after choosing an order
function staffUpdateOrderView() {
        var order = $("#option-choose-order :selected").text();
        $("#show-order-choice").text(order);

}


/* On start this function should run
* which sets all tables in the pub */
$(document).ready(() => setTableHtml());
