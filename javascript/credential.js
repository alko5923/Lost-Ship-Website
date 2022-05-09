
var userdb = DB.users;
var creditdb = DB.account;

// The user id of the logged in user, or undefined if not logged in.
var nmLoggedId = undefined;

function dbg_autologIn(credentials) {
    while(true) {
        var user = userdb[Math.floor(Math.random() * userdb.length)];
        if(parseInt(user.credentials) === credentials) {
            nmLoggedId = user.user_id;
            updateLoginView();
            return;
        }
    }
}

function loadUserData(id) {
    for(var user of userdb) {
        if(parseInt(user.user_id) === parseInt(id)) return user;
    }
    return null;
}

function logOut() {
    nmLoggedId = undefined;
    updateLoginView();
}

function logIn(username, password) {
    for(var user of userdb) {
        if(user.username == username) {
            if(user.password != password) return false;
            nmLoggedId = user.user_id;
            updateLoginView();
            return true;
        }
    }
    return false;
}

function isLoggedIn() {
    return nmLoggedId !== undefined;
}

function isRegularUser() {
    return !isLoggedIn();
}

function isVipUser() {
    if(isRegularUser()) return false;
    return parseInt(loadUserData(nmLoggedId).credentials) === 3;
}

function isStaffUser() {
    if(isRegularUser()) return false;
    return parseInt(loadUserData(nmLoggedId).credentials) === 0;
}

function isOwnerUser() {
    if(isRegularUser()) return false;
    return parseInt(loadUserData(nmLoggedId).credentials) === 1;
}

function getUserFirstName() {
    if(isRegularUser()) return "patron";
    return loadUserData(nmLoggedId).first_name;
}

function getUserLastName() {
    if(isRegularUser()) return "patron";
    return loadUserData(nmLoggedId).last_name;
}

function getUserName() {
    if(isRegularUser()) return "patron";
    return getUserFirstName() + " " + getUserLastName();
}

function getUserUser() {
    if(isRegularUser()) return "patron";
    return loadUserData(nmLoggedId).username;
}

function getUserEmail() {
    if(isRegularUser()) return null;
    return loadUserData(nmLoggedId).email;
}

function getUserPhone() {
    if(isRegularUser()) return null;
    return loadUserData(nmLoggedId).phone;
}

function getUserCredits() {
    if(!isVipUser()) return "Only VIPs have credits!";
    for(var cd of creditdb) {
        if(parseInt(cd.user_id) === parseInt(nmLoggedId)) return parseInt(cd.creditSEK);
    }
    creditdb.push({
        "user_id": nmLoggedId,
        "creditSEK": 0
    });
    return 0;
}

function setUserCredits(cred) {
    if(!isVipUser()) return "Only VIPs have credits!";
    for(var cd of creditdb) {
        if(parseInt(cd.user_id) === parseInt(nmLoggedId)) {
            cd.creditSEK = cred;
            return;
        }
    }
    creditdb.push({
        "user_id": nmLoggedId,
        "creditSEK": cred
    });
}


function updateLoginView() {
    $(".show-if-regular").toggle(isRegularUser());
    $(".show-if-vip").toggle(isVipUser());
    $(".show-if-staff").toggle(isStaffUser());
    $(".show-if-logged").toggle(isLoggedIn());
    
    $(".logged-user-firstname").text(getUserFirstName());
    $(".logged-user-lastname").text(getUserLastName());
    $(".logged-user-fullname").text(getUserName());
    $(".logged-user-username").text(getUserUser());
    $(".logged-user-email").text(getUserEmail());
    $(".logged-user-phone").text(getUserPhone());
    $(".logged-user-credits").text(getUserCredits());

    $("#userInfo").text(getUserFirstName());
}

$(document).ready(() => {
    updateLoginView();
});