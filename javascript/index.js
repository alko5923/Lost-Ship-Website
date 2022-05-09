function openStaffForm() {
    closeLoginForms(); // Close other forms before opening a new one.
    $("#loginStaff").show();
}

function openVipForm() {
    closeLoginForms(); // Close other forms before opening a new one.
    $("#loginVip").show();
}

// The user shouldn't have multiple forms open anyway so
// it's easier to just have a button that closes all of them.
function closeLoginForms() {
    $(".form-login").hide();
}

// check if the user is a staff member
function checkUserStaff() {
    var username = document.getElementById("usernameStaff").value;
    var password = document.getElementById("passwordStaff").value;

    logIn(username, password);
    closeLoginForms();
    if(!isStaffUser() && !isOwnerUser()) {
        logOut();
        return 0;
    }
    if(isStaffUser()){
        changePage("staff");
    }
    if(isOwnerUser()) {
        changePage("owner");
    }
    return 1;
}

// check if the user is a VIP member
function checkUserVip() {
    var username = document.getElementById("usernameVip").value;
    var password = document.getElementById("passwordVip").value;

    logIn(username, password);
    closeLoginForms();
    if(!isVipUser()) {
        logOut();
        return 0;
    }
    changePage("vip");
    return 1;
}
