var map,
    uuid,
    marker,
    route,
    markers,
    trigger,
    trigger$,
    mqttClient,
    currentPlayer,
    dataInfo,
    infowindow,
    humidity,
    verifyValue,
    verifyOwner = "No",
    temperature = 21,
    payloadHistory = [],
    heldAccountable = false,
    count = 1, steps = 0,
    status = 'Satisfied',
    rand = Math.floor((Math.random() * 8000) + 1),
    pack = "Asset Package " + rand,
    now = new Date().toLocaleString(),
    data = { description: pack, user: "Industry", action: "create", temperature: temperature, lastTransaction: now };


var defaultCoordinates = [{
    "lat": -23.56996189423875,
    "lng": -46.65141653365975
}, {
    "lat": -23.57997497987705,
    "lng": -46.6491940773286
}, {
    "lat": -23.581153,
    "lng": -46.663667
}, {
    "lat": -23.581645286215887,
    "lng": -46.64944620296468
}];

var playerSet = [
    ['Industry', defaultCoordinates[0].lat, defaultCoordinates[0].lng, 2],
    ['Shipping Company', defaultCoordinates[1].lat, defaultCoordinates[1].lng, 3],
    ['Customer', defaultCoordinates[2].lat, defaultCoordinates[2].lng, 4]
];

//---------------------//----------------------------//----------------//

/*{@Object data}
 *On ready callback controls all the elements and order on tracking
**/
$(document).ready(function () {

    $('#myModal').modal('show');

    /*@{Object data} creates an asset triggering createAsset & doTransaction*/
    $('.btn-primary').click(function () {
        currentPlayer = markers[0];
        getDeploymentBlock();
        createAsset(data);
    });

    $('#startDemo').click(function () {
        $(".assetContainer").fadeOut("slow");
        setupTracking();
        seePackage();
        $(this).fadeOut();
    });

    $("#btnUpTemp").click(function () {
        temperature++;
        data.temperature = temperature;
        $("#lblTemperature").text(`${temperature} ºC`);
        console.log(data.temperature);
    });

    $("#btnDownTemp").click(function () {
        temperature--;
        data.temperature = temperature;
        $("#lblTemperature").text(`${temperature} ºC`);
        console.log(data.temperature);
    });
});

//------------------//-------------------------//--------------------//

/*@{Object data} - Rest functions*/
function doTransaction(action) {
    //console.log("[doTransaction]request: ${action} " + JSON.stringify(action));
    $.post('/request', action).done(function onSuccess(res) {
        data = res;
        console.log(`[doTransaction]success ${res.description}`);
        if (data.temperature > 24) {
            console.log(`doTransaction - status(return): ${data.status}`);
            data.status = true;
        }
        payloadHistory.push(data);
        getStats(payloadHistory);
        if (data.status === true && data.user === currentPlayer.getTitle()) {
            console.log(`${currentPlayer.getTitle()} = ${data.user}`);
            heldAccountable = true;
            checkStatus(data);
        } else {
            heldAccountable = false;
            data.status === false;
        }
    }).fail(function onError(error) {
        console.log(`error requesting ${error}`);
    });
}

function checkStatus(context) {
    //console.log(`checkStatus ${context.status}`);
    statsEventListenner(context);
    if (temperature > 24) { //heldAccountable || 
        status = "Verify Package! " + currentPlayer.getTitle() + "";
        let alertMsg = "<label class='alert'> " + context.user + " has violated the contract! </label>";
        infowindow.setContent(alertMsg);
        infowindow.open(map, currentPlayer);
        verifyValue = temperature;
        data.status === false;
        console.log(`verifyValue: (checkStatus) ${verifyValue}`);
        console.log(`status: (false?) ${data.status}`);
        for (var i = 1; i < playerSet.length - 1; i++) {
            if (playerSet[i][0] === currentPlayer.getTitle()) {
                verifyOwner = playerSet[i][0];
            }
        }
    } else {
        verifyValue = undefined;
        heldAccountable = false;
        data.status = false;
    }
}

/*@{Function data} - starting animation(executes once - calls playTracking() => interval)*/
function setupTracking() {
    //info balloon notification
    dataInfo = currentPlayer.getTitle() + " is shipping assets";
    infowindow = new google.maps.InfoWindow({
        content: dataInfo,
        maxWidth: 250,
        maxHeight: 80
    });

    infowindow.open(map, currentPlayer);
    trigger = setInterval(function () {
        playTracking(data)
    }, 1000);

    trigger$ = setInterval(function () {
        sendBlocks(data);
    }, 9000)
    //ensuring it has valid objects
    markers.forEach(function (icon) {
        console.log(`marker ${icon.getTitle()}`);
    });
}

/*@{Function data} this function "animates" the icons through the route*/
function playTracking(values) {

    let package = values; //fix error VM311
    //set of variables to hold current and next lat/long(comparision)
    let currentLat = currentPlayer.getPosition().lat();
    let nextLat = markers[count].getPosition().lat();
    let currentLng = currentPlayer.getPosition().lng();
    let nextLng = markers[count].getPosition().lng();
    if (verifyValue !== undefined) {
        package.temperature = verifyValue
        console.log(`Verifying value ${verifyValue} || infractors?: ${verifyOwner} heldAccountable ${heldAccountable}`);
    }

    /*console.log(`heldAccountable ${heldAccountable}`);
      console.log(`status now  ${data.status}`);*/

    //update stats window
    checkStatus(package);
    currentPlayer.setPosition(route[steps + 15]);
    //console.log(`steps ${steps}`);
    if (currentLat - nextLat < 0.0000013522 && currentLng - nextLng < 0.0000013522) {
        console.log(`count ${count}`);
        currentPlayer = markers[count];
        package.user = currentPlayer.getTitle();
        package.action = "transfer";

        //current package's owner
        /*console.log(`interval ${package.user}`);*/

        //request to server
        doTransaction(package);

        //delay to update all UI elements with the new state 
        setTimeout(function () {
            $('#currentPlayer').html(currentPlayer.getTitle());
            infowindow.setContent(package.user + " is shipping assets");
            infowindow.open(map, currentPlayer);
            count++;
            if (count === 3) {
                package.user = currentPlayer.getTitle();
                package.action = "transfer";
                doTransaction(package);
                stopTracking(trigger, trigger$);
                checkStatus(package);
                infowindow.setContent("Order finished");
            }
        }, 500);
    }
    steps++;
}

/*@{Object data} - stops playTracking()*/
function stopTracking(interval, interval$) {
    clearInterval(interval$);
    clearInterval(interval);
    finalSummary();
    //console.log("payloadHistory " + JSON.stringify(payloadHistory));
}

//--------------------------------------------//------------------------------------------------

/*Drawing Map*/
function initMap() {
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer({
        draggable: true,
        suppressMarkers: true
    });

    var mapCenter = new google.maps.LatLng(
        defaultCoordinates[defaultCoordinates.length - 1].lat,
        defaultCoordinates[defaultCoordinates.length - 1].lng);

    var mapOptions = {
        center: mapCenter,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.HYBRID
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    directionsDisplay.setMap(map);
    calculateAndDisplayRoute(directionsService, directionsDisplay);
    setMarkers(map);
}

function setMarkers(map) {
    let image, img;
    markers = [];
    for (var x = 0; x < playerSet.length; x++) {
        let actors = playerSet[x];
        img = x + 1;
        image = 'images/player' + img + '.png';
        marker = new google.maps.Marker({
            position: { lat: actors[1], lng: actors[2] },
            map: map,
            icon: image,
            animation: google.maps.Animation.DROP,
            title: actors[0],
            zIndex: actors[3],
            draggable: false
        });
        markers.push(marker);
        marker.addListener('dragend', function () {
            let player = this.getTitle();
            for (var y in playerSet) {
                if (playerSet[y][0] === player) {
                    playerSet[y][1] = this.getPosition().lat();
                    playerSet[y][2] = this.getPosition().lng();
                }
            }
            calculateAndDisplayRoute(directionsService, directionsDisplay);
        });
    }
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    var waypts = [];

    for (var i = 1; i < playerSet.length - 1; i++) {
        var position = { "lat": playerSet[i][1], "lng": playerSet[i][2] };
        waypts.push({
            location: position,
            stopover: true
        });
    }

    directionsService.route({
        origin: { lat: playerSet[0][1], lng: playerSet[0][2] },
        destination: { lat: playerSet[playerSet.length - 1][1], lng: playerSet[playerSet.length - 1][2] },
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
    }, function (data, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            //preserveViewport: true => solved the zoom issue
            directionsDisplay.setOptions({ preserveViewport: true });
            directionsDisplay.setDirections(data);
            route = data.routes[0].overview_path;

        }
    });
    //map.setZoom(2);
    //console.log(`maps zoom: ${map.getZoom()}`);
}

/*--------------//-----------------------------------//---------------------*/

/*UI events listenner*/

function onLoadAsset() {
    $('.modal-content').empty();
    $('.modal-content').append('<div id="gearsLoad"><img src="./images/CatToast2.gif"><h4>Creating Asset...</h4></div>');
    $(".loading").fadeIn();
}

function createAsset(init) {
    onLoadAsset();
    doTransaction(init);
    let assetContainerBody = $('.assetContainerBody');
    let animationDiv = $('.animationDiv');
    let blockchainInfoDiv = $('.blockchainInfo');
    let assetContainer = $('.assetContainer');
    let btnStart = $('assetContainerBody button');

    setTimeout(function () {
        if (data !== null && data !== undefined) {

            $('.modal-backdrop').fadeOut();
            $('.modal-dialog').fadeOut("slow");
            $('#myModal').modal('hide');

            assetContainerBody.append('<br><img id="packageImg" src="./images/pallete.png"><br>' +
                '<h4>Asset created</h4>' +
                '<br><b>Owner: </b>' + data.user.toUpperCase() +
                '<br><b>Description: </b>' + data.description +
                '<br><b>Registered: </b>' + data.lastTransaction);

            blockchainInfoDiv.fadeIn("slow");
            animationDiv.fadeIn("slow");
            assetContainer.fadeIn("slow");
            assetContainer.addClass("extendContainer");
            assetContainerBody.fadeIn("slow");
            btnStart.fadeIn("slow");
            checkStatus(init);
        }
        else {
            return alert("error creating asset.please try again");
        }
    }, 3000);
}

function seePackage() {
    $("#showPackage").mouseover(function () {
        $(".assetContainer").fadeIn("slow");
    });

    $("#showPackage").mouseout(function () {
        $(".assetContainer").fadeOut("slow");
    });
}

function finalSummary() {

    let content = $('.modal-content');
    let c = 1;
    content.empty();
    content.append('<div class="modal-body fullbody"><h3>Transaction History</h3></div>' +
        '<div class="modal-footer fullbody"><div class="hideModal">Back</div>' +
        '<br><a target="_blank" href="http://solhub.isc.br.ibm.com/">Learn more about our demos</href></div>');

    payloadHistory.forEach(function (log) {
        //console.log("generating summary " + JSON.stringify(log));
        $('.modal-body').append('<div class="finalsummary" id="historyLog' + c + '"><strong>Description:\n '
            + log.description + '   User: ' + log.user + ' temperature: ' + log.temperature + ' C.° </strong></div><br>');

        if (log.temperature > 24) {
            let thisElem = "#historyLog" + c;
            console.log(`temperature$ ${log.temperature}`);
            $(thisElem).addClass("infractorData");
        }
        c++;
    });

    //showing final history
    console.log(`modal-fade:`);
    $('.modal-dialog').modal();
    $('#myModal').modal("show");

    $('.hideModal').click(function () {
        $('.modal-dialog').modal("hide");
        $('#myModal').modal("hide");
    });
}

/*@{Object data} - listenner to blockchain events*/
function statsEventListenner(context) {
    let currenTime = new Date().toLocaleString();
    console.log(`temp changing: ${context.temperature}`);
    $("#lblTemperature").text(`${temperature} ºC`);
    $("#lblTime").text(`${currenTime}`);
    $("#lastTransactionTime").text(`${context.lastTransaction}`);
    $("#lblDescription").text(`${context.description}`);
    $("#lblOwner").text(`${currentPlayer.getTitle()}`);
    $("#lblStatus").text(`${status}`);
}