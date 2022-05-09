//This is the global function which will determine what operation to do
var globalFunction = null;
var selected_row_id = null;

//The stacks used in the undo-redo parts
let undostack = [];
let redostack = [];

/**
 * This function iterates over the menu-database where it sends 
 * the entry to the html-creator
 */
function createMenuTable() {
    tempdb.sort((a, b) => a.namn.localeCompare(b.namn));
    for (var i = 0; i < tempdb.length; i++) {
        let html = tableRow(tempdb[i]);
        $("#menuTable").append(html);
    }
}

/**
 * Creates a table row with the name of the beberage and the stock
 * If one were to click the row, then the global function will be executed
 * on that particular row
 */
function tableRow(menuEntry) {
    var classes = "";
    if(menuEntry.stock < 3) classes += " low-stock";
    if(parseInt(menuEntry.artikelid) == selected_row_id) classes += " selected-row";
    
    return `
    <tr id="${menuEntry.namn}" class="${classes}" onclick="ownerSelectRow(${menuEntry.artikelid})">
        <td>${menuEntry.namn}</td>
        <td>${menuEntry.stock}</td>
        <td>${menuEntry.prisinklmoms} SEK</td>
    </tr>
    `
}

function ownerSelectRow(id) {
    selected_row_id = parseInt(id);
    updateTable();
}

function refillBeverage(r) {
    if(selected_row_id == null) return alert("First you must select a row to refill.");

    for (var i = 0; i < tempdb.length; i++) {
        var bev = tempdb[i];
        
        if (bev.artikelid == selected_row_id) {
            var stock = parseInt(bev.stock)

            pushUndo(() => {
                bev.stock = stock;
            }, () => {
                bev.stock = stock + 5;
            });

            bev.stock = stock + 5;
            break;
        }
    }
    updateTable();
}

var next_artikelid = 1;
function addBeverage() {
    var old_artikelid = next_artikelid;
    

    var beverage = {
        "artikelid" : next_artikelid++,
        "namn" : $("#beverageName").get(0).value,
        "argang" : null,
        "producent" : $("#producerName").get(0).value,
        "ursprunglandnamn" : $("#countryName").get(0).value,
        "varugrupp" : $("#beverageCategory").get(0).value,
        "undergrupp" : $("#beverageSubcategory").get(0).value,
        "alkoholhalt" : $("#alcoholPercent").get(0).value,
        "prisinklmoms" : $("#beveragePrice").get(0).value,
        "storlek" : $("#servingType").get(0).value,
        "storlekml" : $("#servingSize").get(0).value,
        "koscher" : $("#beverageKoscher").get(0).value,
        "ekologisk" : $("#beverageEkologisk").get(0).value,
        "notter" : $("#beverageNotter").get(0).value,
        "gluten" : $("#beverageGluten").get(0).value,
        "laktos" : $("#beverageLaktos").get(0).value,
        "tannin" : $("#beverageTannin").get(0).value,
        "ingredienser": [],
        "stock" : 0
    };
    
    pushUndo(() => {
        tempdb = tempdb.filter(beverage => beverage.artikelid !== old_artikelid);
    }, () => {
        tempdb.push(beverage);
    });
                    
    tempdb.push(beverage);
    updateTable();
    updateVipPage();
    closeAddForm();
}

function openAddForm() {
    $("#addBeverageForm").show();
}

function closeAddForm() {
    $("#addBeverageForm").hide();
}

function removeBeverage() {
    if(selected_row_id == null) return alert("First you must select a row to remove.");

    var to_remove = tempdb.find(beverage => beverage.artikelid == selected_row_id)
    to_remove = JSON.parse(JSON.stringify(to_remove));

    pushUndo(() => {
        tempdb.push(to_remove);
    }, () => {
        tempdb = tempdb.filter(bev => bev.artikelid != to_remove.artikelid);
    });
    
    tempdb = tempdb.filter(bev => bev.artikelid != to_remove.artikelid);
    selected_row_id = null;
    updateTable();
}


function updateTable() {
    document.getElementById("menuTable").innerHTML = "";
    createMenuTable();
}


function pushUndo(undoFunc, redoFunc) {
    if(redostack.length > 0) {
        redostack = [];
    }
    undostack.push([ undoFunc, redoFunc ]);
}

function undo() {
    if (undostack.length == 0) {
        console.log("Nothing to undo");
        return;
    }
    var pair = undostack.pop();
    redostack.push(pair);

    pair[0]();

    updateTable();
}

function redo() {
    if (redostack.length == 0) {
        console.log("Nothing to redo");
        return;
    }
    var pair = redostack.pop();
    undostack.push(pair);

    pair[1]();

    updateTable();
}

$(document).ready(() => {
    createMenuTable();
});