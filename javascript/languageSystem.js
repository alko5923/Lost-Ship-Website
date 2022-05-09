
var language = 'eng'

language_flags = {
    'eng' : "images/uk_flag.png",
    'swe' : "images/swe_flag.png",
    'slo' : "images/slo_flag.png"
};

function getString(key) {
    return dict[language][key];
}

function getFlag() {
    return language_flags[language];
}

function changeLang() {
    if (language === 'eng') {
        language = 'swe';
    }

    else if (language === 'swe') {
        language = 'slo';
    }

    else {
        language = 'eng';
    }
    updateView();
}

function updateView() {
    keys = Object.keys(dict.eng);
    for(i in keys) {
        key = keys[i];
        $("." + key).text(getString(key));
        $("#" + key).text(getString(key));
    }
    $(".flag").attr('src', getFlag());
}

$(document).ready(function() {
    updateView();
})