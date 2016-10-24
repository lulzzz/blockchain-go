/*creating animated blocks for monitor*/
let block = 0;
var trigger2;

//Events listenner
function startStats() {
    console.log("getting stats " + status);
    trigger2 = setInterval(function () {
        getStats();
    }, 5000);
}

function getStats() {
    $.get('/chainfo', function (data) {
        let space = 32;
        block = block + 1;
        $(".animationDiv").append("<div id='box" + block + "' class='block'>" + data.blocks.height + data.blocks.currentBlockHash.substring(0, 5) + "</div>");
        $('.block:last').animate({ opacity: 1, left: (block * space) }, 1000, function () {
            $('.lastblock').removeClass('lastblock');
            $('.block:last').addClass('lastblock');
        });
        console.log(JSON.stringify(data) + typeof (data));
        block++;
    });
}
