/*creating animated blocks for monitor*/
let block = 0;
let space = 32, currentPayload;
let blocksArray = [];

function getStats() {
    $.get('/chainfo', function (data) {
        let found = false;
        blocksArray.forEach(function (seekAndDestroy) {
            if (seekAndDestroy.height === data.height) {
                console.log(`block allready exists ${data.height}`);
                found = true;
                return;
            }
        });
        if (!found) {
            blocksArray.push(data);
            payloadHistory[payloadHistory.length - 1].height = data.height;
            console.log("data.height: " + data.height + "last \n" + JSON.stringify(payloadHistory[payloadHistory.length - 1].height));
            block = block + 1;
            $(".animationDiv").append("<div id='box" + block + "' class='block'>" + data.height + "</div>");
            $('.block:last').animate({ opacity: 1, left: (block * space) }, 1000, function () {
                $('.lastblock').removeClass('lastblock');
                $('.block:last').addClass('lastblock');
            });
            //console.log(JSON.stringify(data) + typeof (data));
            block++;
        }
    });
}

function sendBlocks(payload) {
    payload.user = currentPlayer.getTitle();
    payload.action = "transfer";
    doTransaction(payload);
    //console.log("sendBlocks: " + JSON.stringify(payload));
}

function getDeploymentBlock() {
    $.get('/deployed', function (deployed) {
        blocksArray.push(deployed);
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
    let height = Number($(this).html());
    payloadHistory.forEach(function (dataHistory) {
        //console.log("dataHistory " + JSON.stringify(dataHistory));
        if (dataHistory.height === height) {
            currentPayload = dataHistory;
        }
    });
    show_details(event, height, currentPayload);
});

$(document).on('mouseleave', '.block', function () {
    $('#details').fadeOut();
});

//Missing payload info
function show_details(event, id, message) {
    let currentBlock;
    blocksArray.forEach(function (current) {
        if (current.height === id) {
            currentBlock = current;
            console.log(currentBlock.height + " || " + id + " || " + message.height);
        } if (id !== message.height) {
            message = { "deployment": "first block!", "created": message.lastTransaction }
        }
    });
    var left = event.pageX - $('#details').parent().offset().left - 120;
    if (left < 0) left = 0;
    var html = '<p class="blckLegend"> Ledger Block Height: ' + currentBlock.height + '</p>';
    html += '<hr class="line"/><p>Created: &nbsp;' + formatDate(currentBlock.created * 1000, '%M-%d-%Y %I:%m%p') + ' UTC</p>';
    html += '<p> UUID: ' + currentBlock.uuid + '</p>';
    //html += '<p> Type: &nbsp;&nbsp;' + message.type + '</p>';
    html += '<p> ConsensusMetadata:  &nbsp;&nbsp;&nbsp;&nbsp;' + currentBlock.consensusMetadata + '</p>';
    html += '<p> Payload:' + JSON.stringify(message) + '</p>';
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