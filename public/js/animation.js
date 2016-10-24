/*creating animated blocks for monitor*/
let block = 0;
var trigger2;

//Events listenner
function startStats() {
    console.log("getting stats " + status);
}

function getStats(stats) {
    let space = 32;
    block = block + 1;
    $(".animationDiv").append("<div id='box" + block + "' class='block'>values</div>");
    $('.block:last').animate({ opacity: 1, left: (block * space) }, 1000, function () {
        $('.lastblock').removeClass('lastblock');
        $('.block:last').addClass('lastblock');
    });
    block++;
}
