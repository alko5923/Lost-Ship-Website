
/**
 * Loads the tempdb database with a certain sorting order and filter.
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
function loadTempdb(sort_by = "namn", reverse_order = false, filter_function = () => true) {

    var menuVip = tempdb.filter(filter_function).sort((a, b) => {
        let as = a[sort_by];
        let bs = b[sort_by];
        if(!isNaN(parseInt(as))) return parseInt(as) - parseInt(bs);
        return as.localeCompare(bs);
    });
    if(reverse_order) menuVip = menuVip.reverse();

    return menuVip;
}

// Load the beverage with artikelid 'id' from tempdb.
function loadFromTempdbById(id) {
    for(var bev of tempdb) {
        if(bev.artikelid == id) return bev;
    }
    console.error("No beverage with artikelid " + id + " in tempdb.");
}

// Get a dict mapping the value of the property 'prop_name' over all entries in 'database' to the number of times
// that specific value of the property shows up.
// For example, getStringPropertyCount(db, 'varugrupp') could return { 'öl' : 5, 'vin' : 2, 'sprit': 11, ... }.
function getStringPropertyCount(database, prop_name) {
    var propCountMap = {};
    for(var bev of database) {
        var propValue = bev[prop_name];
        if(propValue == undefined) continue;
        if(propCountMap[propValue] == undefined) propCountMap[propValue] = 0;
        propCountMap[propValue] += 1;
    }
    return propCountMap;
}

// Get the range of the value of the property 'prop_name' over all entries in 'database'.
// Returns an object with the properties 'min' and 'max' set to the min and max values.
// For example, getNumericPropertyRange(db, 'alkoholhalt') could return { min = 5, max = 40 }.
function getNumericPropertyRange(database, prop_name) {
    var propRangeObj = {};
    for(var bev of database) {
        var propValue = parseInt(bev[prop_name]);
        if(isNaN(propValue)) continue;
        if(propRangeObj.min == undefined || propRangeObj.min > propValue) propRangeObj.min = propValue;
        if(propRangeObj.max == undefined || propRangeObj.max < propValue) propRangeObj.max = propValue;
    }
    return propRangeObj;
}

// Checks if the value of the property 'prop_name' of the entries in 'database' is a number.
function isNumericProperty(database, prop_name) {
    for(var bev of database) {
        if(bev[prop_name] == undefined) continue;
        return !isNaN(parseInt(bev[prop_name]));
    }
    return false;
}



