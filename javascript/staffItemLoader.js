
/**
 * This function fills the menu page with beverages from the database
 * with a certain sorting order and filter.
 * 
 * sort_by is a string containing the property of the beverages
 * that the list should be sorted by. Example: "alkoholhalt", "ursprunglandnamn"
 * 
 * if reverse_order is true the list of beverages will be sorted
 * in the reverse order of the property in sort_by.
 * 
 * filter_function is the filter. For example, to only display wine
 * use the function ( bev => bev.varugrupp == "vin" ).
 */

function staffLoadBeverages(sort_by = "namn", reverse_order = false, filter_function = () => true) {

    var menu = tempdb.filter(filter_function).sort((a, b) => {
        let as = a[sort_by];
        let bs = b[sort_by];
        if(!isNaN(parseInt(as))) return parseInt(as) - parseInt(bs);
        return as.localeCompare(bs);
    });
    if(reverse_order) menu = menu.reverse();

    $("#staff-menu-browser").empty();
    for (i = 0; i < menu.length; i++) {
        let html = htmlFromBeverageData(menu[i]);
        $("#staff-menu-browser").append(html);
    }

/* ADDED THIS */
    // Get a list of all items in the vip menu browser
    let elem = document.getElementById("staff-menu-browser");
    let menuItems = elem.getElementsByClassName("staff-menu-browser-entry");

    // Get a list of the names of items
    let nameList = elem.getElementsByClassName('staffItemName');

    // Set the items' ids to the ones in tempdb
    for(var i = 0; i < nameList.length; i++) {
        let elem=nameList[i].textContent;
        //console.log(elem);
        for(var j = 0; j < tempdb.length; j++) {
            if(elem.includes(tempdb[j].namn)) {
                menuItems[i].setAttribute('id', tempdb[j].artikelid);
            }
        }
    }

    updateView();
}

/**
 * This takes a beverage as it is defined in the database and turns
 * it into a string of html.
 */
function htmlFromBeverageData(beverage) {

    // Translate between the database names and the language selector names.
    // "beer", "whisky", "wine", "Bottle", and "plastic-bottle" are tags used
    // by the translation system.
    var varugrupp;
    if(beverage.varugrupp == "öl") varugrupp = "beer";
    if(beverage.varugrupp == "sprit") varugrupp = "whisky";
    if(beverage.varugrupp == "vin") varugrupp = "wine";
    var forpackning;
    if(beverage.forpackning == "Flaska") forpackning = "bottle";
    if(beverage.forpackning == "PET-flaska") forpackning = "plastic-bottle";

    return `
        <div class="staff-menu-browser-entry">
            <p class="itemName">${beverage.namn}${beverage.argang ? ", " + beverage.argang : ""}</p>
        <p>
            <span class="${beverage.varugrupp}"></span><span class="${beverage.undergrupp || ""}">, ${beverage.undergrupp || ""}</span>
        </p>
        <p><span class="${beverage.storlek}">${beverage.storlek}</span>, ${beverage.storlekml}ml</p>
        <p><span class="alkoholhalt"></span>: ${beverage.alkoholhalt}%</p>
        <p><span class="prisinklmoms"></span>: ${beverage.prisinklmoms} <span class="sek"></span></p>
        <p><span class="stock"></span>: ${beverage.stock} <span class="items"></span>             
    \
    </div>
`;
}


$(document).ready(() => {
    staffLoadBeverages();
});