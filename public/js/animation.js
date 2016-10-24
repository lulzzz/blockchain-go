/*creating animated blocks for monitor*/
let block = 0;


//Events listenner
function startStats() {
    console.log("getting stats " + status);
    let trigger = setInterval(function () {
        getStats();
    }, 3000);
}

function getStats() {
    block = block + 1;
    $(".animationDiv").append("<div id='box" + block + "' class='block'>values</div>");
    //$("#box" + block_id).animate({ left: move + 'px' });    
    $('.block:last').animate({ opacity: 1, left: (block * 36) }, 600, function () {
        $('.lastblock').removeClass('lastblock');
        $('.block:last').addClass('lastblock');
    });
    block++;
}