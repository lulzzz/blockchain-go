/*creating animated blocks for monitor*/
let block = 0;
let space = 32;
let blocksArray = [];

function getStats() {
    $.get('/chainfo', function (data) {
        blocksArray.push(data);
        console.log("data.height: " + data.height + "array \n" + JSON.stringify(blocksArray));
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

$(document).on('mouseover', '.block', function (event) {
    show_details(event, Number($(this).html()));
});

$(document).on('mouseleave', '.block', function () {
    $('#details').fadeOut();
});


function show_details(event, id) {
    console.log(event + " || " + id);
    var left = event.pageX - $('#details').parent().offset().left - 100;
    if (left < 0) left = 0;
    var html = '<p class="blckLegend"> Block Height: ' + blocksArray[id].height + '</p>';
    html += '<hr class="line"/><p>Created: &nbsp;' + formatDate(blocksArray[id].created * 1000, '%M-%d-%Y %I:%m%p') + ' UTC</p>';
    html += '<p> UUID: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + blocksArray[id].uuid + '</p>';
    html += '<p> Type:  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + blocksArray[id].type + '</p>';
    html += '<p> consensusMetadata:  &nbsp;&nbsp;&nbsp;&nbsp;' + blocksArray[id].consensusMetadata + '</p>';
    html += '<p> Payload:  &nbsp;</p>';
    $('#details').html(html).css('left', left).fadeIn();
}

function formatDate(date, fmt) {
    date = new Date(date);
    function pad(value) {
        return (value.toString().length < 2) ? '0' + value : value;
    }
    return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
        var tmp;
        switch (fmtCode) {
            case 'Y':								//Year
                return date.getUTCFullYear();
            case 'M':								//Month 0 padded
                return pad(date.getUTCMonth() + 1);
            case 'd':								//Date 0 padded
                return pad(date.getUTCDate());
            case 'H':								//24 Hour 0 padded
                return pad(date.getUTCHours());
            case 'I':								//12 Hour 0 padded
                tmp = date.getUTCHours();
                if (tmp === 0) tmp = 12;				//00:00 should be seen as 12:00am
                else if (tmp > 12) tmp -= 12;
                return pad(tmp);
            case 'p':								//am / pm
                tmp = date.getUTCHours();
                if (tmp >= 12) return 'pm';
                return 'am';
            case 'P':								//AM / PM
                tmp = date.getUTCHours();
                if (tmp >= 12) return 'PM';
                return 'AM';
            case 'm':								//Minutes 0 padded
                return pad(date.getUTCMinutes());
            case 's':								//Seconds 0 padded
                return pad(date.getUTCSeconds());
            case 'r':								//Milliseconds 0 padded
                return pad(date.getUTCMilliseconds(), 3);
            case 'q':								//UTC timestamp
                return date.getTime();
            default:
                throw new Error('Unsupported format code: ' + fmtCode);
        }
    });
}