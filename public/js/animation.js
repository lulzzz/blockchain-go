/*creating animated blocks for monitor*/
let block = 0;
let space = 32;

function getStats() {
    $.get('/chainfo', function (data) {
        block = block + 1;
        $(".animationDiv").append("<div id='box" + block + "' class='block'>" + data.height + "</div>");
        $('.block:last').animate({ opacity: 1, left: (block * space) }, 1000, function () {
            $('.lastblock').removeClass('lastblock');
            $('.block:last').addClass('lastblock');
        });
        console.log(JSON.stringify(data) + typeof (data));
        block++;
    });
}

function sendBlocks(payload) {
    payload.user = currentPlayer.getTitle();
    payload.action = "transfer";
    doTransaction(payload);
    console.log("sendBlocks: " + JSON.stringify(payload));
}

function getDeploymentBlock() {
    $.get('/deployed', function (deployed) {
        block = block + 1;
        $(".animationDiv").append("<div id='firstBlockBox'class='block'>" + deployed.height + "</div>");
        $('.block:last').animate({ opacity: 1, left: (block * space) }, 1000, function () {
            $('.lastblock').removeClass('lastblock');
            $('.block:last').addClass('lastblock');
        });
        block++;
    });
}
