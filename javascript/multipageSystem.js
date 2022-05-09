
// Once we have loaded the pages, change page to the one that is initially assigned to active_page.
$(document).ready(() => changePage(active_page));

var active_page = "index";
var global_page_map = {}; // maps page name -> mp-page element.

function changePage(new_name) {
    var old_page = global_page_map[active_page];
    var new_page = global_page_map[new_name];

    // Redirect to 404 if new_name doesn't match an existing page.
    if(new_page == undefined) {
        new_name = "404";
        new_page = global_page_map[new_name];
    }

    // Change page.
    $(old_page).hide();
    $(new_page).show();

    // Change active_page, which is used at the top of this function to get the old page.
    active_page = new_name;
    closeLoginForms(); // Close any open forms on page change :)
    updateView(); // This is unnecessary now but for future proofing.
}


// Create the <mp-page> element.
customElements.define("mp-page", class extends HTMLElement {
    connectedCallback() {
        var name = this.getAttribute("name");
        if(name == active_page) $(this).show();
        else $(this).hide();
        global_page_map[name] = this;
    }
});

// Create the <mp-include> element.
customElements.define("mp-include", class extends HTMLElement {
    reload() {
        // Get the page that we will include, it must exist or we error.
        var page = global_page_map[this.getAttribute("name")];
        if(!page) throw console.error("No page for mp-include", this);

        var root = $(this.children[0]); // root is the div created in connectedCallback.

        // We are reloading so there may be stuff left here from an old page if the reload is due to changing my name.
        root.empty();
        root.removeProp("attributes");

        // Append all children from target page to my root. Copy all attributes over too.
        // We remove the "name" and "id" attrs. name because its the name of the page and not related to the content. id because
        // the document must have only one node with a specific id, and we are copying a node in the doc so there would be two
        // nodes with this id if we didn't remove it.
        root.append($(page).children().clone());
        $.each($(page).prop("attributes"), (i, attr) => root.attr(attr.name, attr.value));
        root.removeAttr("name");
        root.removeAttr("id");
        root.show(); // Then we call show because pages are often hidden if they're not the currently displayed page.

        // Now we are going to replace any mp-placeholder nodes with our content.
        // Get a copy of our replacements that we stored for later in connectedCallback. This is later.
        var nodes_left = this.replacements.clone();
        // Find any placeholders and store them as an array.
        var placeholders = root.find("mp-placeholder").toArray();
        // By sorting them according to their specificity we will get the CSS behaviour where if there are for example
        // a placeholder with selector "div" and one with ".class" then an element with the class "class" will always get
        // placed at the one with ".class" rather than the one with "div", even if it's a div.
        placeholders.sort((a,b)=> b.getSpecificity() - a.getSpecificity());
        for(var i in placeholders) {
            var ph = placeholders[i];
            // All our content that matches the placeholder selector gets to replace the placeholder.
            // All our content that doesn't match will be left to replace any further placeholders.
            $(ph).replaceWith(nodes_left.filter(ph.getSelector()).clone());
            nodes_left = nodes_left.not(ph.getSelector());
        }
        // If we have any content that cant be placed on the page because it doesn't match to any placeholders, we error.
        if(nodes_left.length != 0) {
            throw console.error("mp-include couldn't match these elements to a mp-placeholder", nodes_left.toArray(), this, page);
        }

        closeLoginForms(); // Close any open forms on page change :)
        updateView();
    }
    connectedCallback() {
        // Only execute the mp-include logic once all pages have loaded.
        $(document).ready(() => {
            // Detatch my children and replace them with an empty div. Store the children for later.
            // My children are what will replace any mp-placeholder on the target page.
            this.replacements = $(this).children().detach();
            var div = document.createElement("div");
            $(this).append(div);

            this.reload();
        });
    }
});

// Create the <mp-placeholder> element.
customElements.define("mp-placeholder", class extends HTMLElement {
    getSelector() {
        if(this.selector != undefined) return this.selector;
        var attrs = $(this).prop("attributes");
        if(attrs.length>1) throw console.error("mp-placeholder can only have one selector attribute", this);
        if(attrs.length<1) throw console.error("mp-placeholder must have selector attribute", this);
        if(attrs[0].value.length>0) throw console.error("mp-placeholder can only have a selector attribute", this);
        this.selector = attrs[0].name;
        return this.selector;
    }
    getSpecificity() {
        // Very very primitive specificity heuristic.
        // We check for words at the start of the string, which matches element names.
        // We check for a "." followed by a word, which matches classes.
        // And e check for a "#" followed by a word, which matches ids.
        var selector = this.getSelector();
        this.specificity = 0;
        this.specificity += [...selector.matchAll(/^(\w|[-_])/g)].length*1;
        this.specificity += [...selector.matchAll(/\.(\w|[-_])+/g)].length*10;
        this.specificity += [...selector.matchAll(/#(\w|[-_])+/g)].length*100;
        
        // See if the selector contains something we dont check for and error, to prevent our heuristic from giving wrong results.
        // Sorry for the wild regex, it's just the three ones above |'d together (and with a match for * added, to allow wildcards).
        const left = selector.replace(/(^(\w|[-_*]))|(\.(\w|[-_])+)|(#(\w|[-_])+)/g, "");
        if(left !== "") throw console.error("mp-placeholder selector can only specify element name, class, and id", this, left);

        return this.specificity;
    }
});
