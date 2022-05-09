// A global variable holding the open order, containing IDs of item, followed by 
// their respective quantities: { ID1 : quantity1, ID2 : quantity2, ... }
var vipOpenOrderData = {};

// Holds filter data of the form: { category1 : { value1 : true/false, ... }, ... }.
// For example: { 'varugrupp' : { 'öl' : true, 'vin' : false }, 'ursprung' : { 'sverige' : true } }.
var vipStringPropertyFilter = {};


// Holds filter data of the form: { category1 : { min = minvalue1, max = maxvalue1 }, ... }.
// For example: { 'alkoholhalt' : { min = 5, max = 40 }, 'prisinklmoms' : { min = 100, max = 150 } }.
var vipNumericPropertyFilter = {};


/*Creates a new order*/
function createOrder() {
    var elem = document.getElementById("vip-new-order");
    var elemDisplay = window.getComputedStyle(elem).display;

    var elem2 = document.getElementById("vip-order-sum");
    var elem2Display = window.getComputedStyle(elem2).display;

    if (elemDisplay === "none") {
        $("#vip-new-order").show();
    }
    else if (elemDisplay !== "none") {
        $("#vip-new-order").hide();
    }
    $("#VIP-edit-order").show();
    $("#VIP-pay-order").show();
}

function editOrder() {
    return;
}

function payOrder() {
    return;
}

function clearOrder() {
    for(var id in vipOpenOrderData) {
        setOrderBeverageCount(id, 0);
    }
}

/***Functions for drag-and-drop of menu items***/

// Prevent the standard handling of drag-and-drop method
function allowDrop(ev) {
    ev.preventDefault();
}

// Specify what data to drag
function dragBeverage(ev) {
    ev.dataTransfer.setData("order-id", ev.target.id);
}

// Specify what data to drop
function dropBeverageOrder(ev) {
    ev.preventDefault();
    var id = ev.dataTransfer.getData("order-id").toString(); // the ID of the element
    changeOrderBeverageCount(id, 1);
}


// Get the amount of whatever beverage is given by 'id' in the active order.
function getOrderBeverageCount(id) {
    if(vipOpenOrderData[id] == undefined) return 0;
    else return vipOpenOrderData[id];
}

// Set the amount of whatever beverage is given by 'id' to 'count' in the active order.
// If the order has none of that beverage then it will be added to the order.
// If 'count' is 0 then the beverage is removed from the order.
function setOrderBeverageCount(id, count) {
    var current_count = vipOpenOrderData[id];
    if(count <= 0) {
        // remove order.
        $("#dropped-"+id).remove();
        delete vipOpenOrderData[id];
        updateSumView();
    } else {
        if(current_count == undefined) {
            // create new order.
            let html = orderItemHtmlFromId(id);
            $("#vip-new-order").append(html);
        }
        vipOpenOrderData[id] = count;
        updateOrderBeverageView(id);
    }
}

// Increase/decrease the amount of a beverage in the active order by 'relative_change'.
function changeOrderBeverageCount(id, relative_change) {
    setOrderBeverageCount(id, getOrderBeverageCount(id) + relative_change);
}

// Turns a beverage id into the html that represents that beverage in the active order.
function orderItemHtmlFromId(id) {
    var beverage = loadFromTempdbById(id);
    return `
        <tr class="dropped" id="dropped-${id}">
            <td class="itemName">${beverage.namn}</td>
            <td class="dropped-count">0</td>
            <td class="buttons">
                <button class="increase" onClick="changeOrderBeverageCount('${id}', 1)">^</button>
                <button class="decrease" onClick="changeOrderBeverageCount('${id}', -1)">v</button>
            </td>
        </tr>
    `;
}

// Turns a beverage into the html that represents that beverage in the beverage list browser.
function listItemHtmlFromBeverage(beverage) {
    var main = `
        <p class="itemName">${beverage.namn}${beverage.argang ? ", "+beverage.argang : ""}</p>
        <p>
            <span class="${beverage.varugrupp}"></span><span class="${beverage.undergrupp || ""}">, ${beverage.undergrupp || ""}</span>
        </p>
        <p><span class="${beverage.storlek}">${beverage.storlek}</span>, ${beverage.storlekml}ml</p>
        <p><span class="alkoholhalt"></span>: ${beverage.alkoholhalt}%</p>
        <p><span class="prisinklmoms"></span>: ${beverage.prisinklmoms} <span class="sek"></span></p>
    `;
    var ingredients = "";
    for(var ing of beverage.ingredienser) {
        ingredients += `
            <tr>
                <td><span class="${ing.namn}">${ing.namn}</span></td>
                <td>${ing.storlekml}ml</td>
            </tr>
        `;
    }
    return `
        <div class="vip-menu-browser-entry" id="${beverage.artikelid}" draggable="true" ondragstart="dragBeverage(event)">
            ${main}
            <table>
                ${ingredients}
                ${beverage.koscher ? `<tr><td class="inh-koscher"></td></tr>` : ""}
                ${beverage.ekologisk ? `<tr><td class="inh-ekologisk"></td></tr>` : ""}
                ${beverage.notter ? `<tr><td class="inh-notter"></td></tr>` : ""}
                ${beverage.gluten ? `<tr><td class="inh-gluten"></td></tr>` : ""}
                ${beverage.laktos ? `<tr><td class="inh-laktos"></td></tr>` : ""}
                ${beverage.tannin ? `<tr><td class="inh-tannin"></td></tr>` : ""}
                </table>
        </div>
    `;
}

// Calculate the sum of the order.
function calculateSum() {
    var orderSum = 0;
    for(var id in vipOpenOrderData) {
        var order_data = vipOpenOrderData[id]; // order_data is just the count.
        var db_data = loadFromTempdbById(id);

        orderSum += order_data*db_data.prisinklmoms;
    }

    return Math.ceil(orderSum);
}

// Update the html for the beverage given by 'id' in the active order.
function updateOrderBeverageView(id) {
    var count = vipOpenOrderData[id];
    var div = $("#dropped-"+id);
    div.find(".dropped-count").text(count);

    if(count === 1) {
        div.find(".decrease").text("X");
    } else {
        div.find(".decrease").text("v");
    }

    updateSumView();
}

// Update the html for the order total with the calculated sum of all items in the order.
function updateSumView() {
    var sum = calculateSum();
    if(sum == 0) {
        $("#vip-order-total-view").hide();
    } else {
        $("#vip-order-total-view").show();
        $("#vip-order-sum").text(sum);
    }
}

/**
 * Displays the user info when logged in.
 */
 function showUserInfo() {
    $("#userInfo-pane").toggle();
    $("#userInfo-pane").text(getUserFirstName() + ' credits: ' + getUserCredits());
}

// Pay for an order 
function payOrder() {
    sum = calculateSum();
    if (sum > 0) {
        showPaymentPane();
    }
    return 1;
}

function payAtTable() {
    let sum = calculateSum();
    let new_credits = getUserCredits()-sum;
    if(sum < getUserCredits()) {
        setUserCredits(new_credits);
        clearOrder();
        showPaymentPane();
        showCodePane();
        // Shows the code for 5 seconds
        setTimeout(showCodePane, 5000);
    }
    return 1;
}

function payAtBar() {
    let sum = calculateSum();
    if(sum < getUserCredits()) {
        clearOrder();
        showPaymentPane();
    }
    return 1;
}

// shows the payment options pane
function showPaymentPane() {
    $("#paymentInfo-pane").toggle();
}

// shows the code after payment
function showCodePane() {
    $("#paid-code-pane").toggle();
    $("#paid-code-pane").text(getUserFirstName() + ', the code is: 5372');
}

// Update the html for the scrollable beverage browser.
function updateBeverageListView() {
    var sort_by = $("#vip-sort-by").get(0).value;
    var reverse_order = false;

    var filter = (bev) => {
        for(var category in vipStringPropertyFilter) {
            var is_enabled_map = vipStringPropertyFilter[category];
            var value = bev[category];
            if(value === undefined) continue;
            if(is_enabled_map[value] === undefined) continue;
            if(is_enabled_map[value] === false) return false;
        }
        for(var category in vipNumericPropertyFilter) {
            var range = vipNumericPropertyFilter[category];
            var value = parseInt(bev[category]);
            if(value === undefined) continue;
            if(value < range.min) return false;
            if(value > range.max) return false;
        }
        return true;
    };
    
    var list = loadTempdb(sort_by, reverse_order, filter);

    $("#vip-menu-browser").empty();
    for(var bev of list) {
        let html = listItemHtmlFromBeverage(bev);
        $("#vip-menu-browser").append(html);
    }

    updateView();
}

function toggleFilterDropdown() {
    $("#menu-topbar").toggleClass("dropdown-open");
}


// Creates html for specifying a filter based on a string property in the database.
function generateStringPropertyFilterPickerHtml(database, prop_name) {
    prop_name = prop_name.replace(" ", "-");
    var map = getStringPropertyCount(database, prop_name);
    var inner = "";
    for(var value in map) {
        var count = map[value];
        value = value.replace(" ", "-");
        inner += `
                <label class="checkbox-filter">
                    <input type="checkbox" checked
                           style="display: none;"
                           class="filter-${prop_name}-${value}-checkbox"
                           onchange="updateVipStringPropertyFilter()">
                    <span class="${value}">${value}</span>
                </label>
        `;
    }
    return `
        <div class="checkbox-filter">
            <p class="${prop_name}">${prop_name}</p>
            <div style="display:flex;flex-wrap:wrap;">
                ${inner}
            </div>
        </div>
    `;
}

// Update the global vipStringPropertyFilter based upon the generated html from generateStringPropertyFilterPickerHtml.
function updateVipStringPropertyFilter() {
    for(var category in vipStringPropertyFilter) {
        vipStringPropertyFilter[category] = {};
        var db_values = getStringPropertyCount(tempdb, category);
        for(var value in db_values) {
            vipStringPropertyFilter[category][value] = $(".filter-"+category+"-"+value+"-checkbox")?.get(0)?.checked;
        }
    }
    updateBeverageListView();
}

// Creates html for specifying a filter based on a numeric property in the database.
function generateNumericPropertyFilterHtml(database, prop_name) {
    var range = getNumericPropertyRange(database, prop_name);
    var input_max = `
        <label><span class="minimum-string"></span>
            <input type="range"
                   class="filter-${prop_name}-max-range"
                   min="${range.min}" max="${range.max}" value="${range.max}"
                   oninput="updateVipNumericPropertyFilter('${prop_name}')"
                   onchange="updateBeverageListView()">
        </label>
    `;
    var input_min = `
        <label><span class="maximum-string"></span>
            <input type="range"
                   class="filter-${prop_name}-min-range"
                   min="${range.min}" max="${range.max}" value="${range.min}"
                   oninput="updateVipNumericPropertyFilter('${prop_name}')"
                   onchange="updateBeverageListView()">
        </label>
    `;

    return `
        <div class="slider-filter">
            <p><span class="${prop_name}">${prop_name}</span> (<span class="filter-${prop_name}-range-value"></span>)</p>
            <div style="margin-left: 10px; margin-top: -10px;">
                ${input_min}
            </div>
            <div style="margin-left: 10px;">
                ${input_max}
            </div>
        </div>
    `;
}

function updateVipNumericPropertyFilter(property) {
    var div_min = $(`.filter-${property}-min-range`).get(0);
    var div_max = $(`.filter-${property}-max-range`).get(0);
    if(parseInt(div_min.value) > parseInt(div_max.value)) div_min.value = vipNumericPropertyFilter[property].min;
    if(parseInt(div_max.value) < parseInt(div_min.value)) div_max.value = vipNumericPropertyFilter[property].max;
    vipNumericPropertyFilter[property] = {
        'min' : parseInt(div_min.value),
        'max' : parseInt(div_max.value),
    };
    $(`.filter-${property}-range-value`).text(`${div_min.value} - ${div_max.value}`);
}


function updateVipPage() {
    $("#vip-filters-list").empty();
    for(var category of ['varugrupp', 'undergrupp', 'storlek', 'ursprunglandnamn', 'alkoholhalt', 'prisinklmoms']) {
        if(isNumericProperty(tempdb, category)) {
            vipNumericPropertyFilter[category] = {};
            var html = generateNumericPropertyFilterHtml(tempdb, category);
            $("#vip-filters-list").append(html);
            updateVipNumericPropertyFilter(category);
        } else {
            vipStringPropertyFilter[category] = {};
            var html = generateStringPropertyFilterPickerHtml(tempdb, category);
            $("#vip-filters-list").append(html);
        }
    }
    updateVipStringPropertyFilter();
}


$(document).ready(() => {
    updateVipPage();
});