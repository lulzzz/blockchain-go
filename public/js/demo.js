var map,
    uuid,
    marker,
    route,
    markers,
    trigger,
    currentPlayer,
    dataInfo,
    infowindow,
    humidity,
    verifyValue = "No",
    verifyOwner = "No",
    temperature = "21",
    heldAccountable = false,
    count = 1, steps = 0,
    status = 'Satisfied',
    rand = Math.floor((Math.random() * 8000) + 1),
    pack = "Asset Package " + rand,
    now = new Date().toLocaleString(),
    data = { description: pack, user: "IBM", action: "create", "temperature": temperature, lastTransaction: now };


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
    $('#btnCreateAsset').click(function () {
        currentPlayer = markers[0];
        createAsset(data);
        startStats();
    });

    $('#startDemo').click(function () {
        $(".assetContainer").fadeOut("slow");
        setupTracking();
        seePackage();
    });
});

//------------------//-------------------------//--------------------//

/*@{Object data} - Rest functions*/
function doTransaction(action) {
    $.post('/request', action).done(function onSuccess(res) {
        data = res;
        console.log(`doTransaction ${data.user}`);
        if (data.status === true) {
            heldAccountable = true;
            checkStatus(data);
        }
    }).fail(function onError(error) {
        console.log(`error requesting ${error}`);
    });
}

function checkStatus(context) {
    console.log(`checkStatus ${context.status}`);
    statsEventListenner(context);
    if (heldAccountable || temperature > 24) {
        status = "Verify Package! " + currentPlayer.getTitle() + "";
        let alertMsg = "<label class='alert'> " + context.user + " violated contract! </label>";
        infowindow.setContent(alertMsg);
        infowindow.open(map, currentPlayer);
        verifyValue = temperature;
        for (var i = 1; i < playerSet.length - 1; i++) {
            if (playerSet[i][0] === currentPlayer.getTitle()) {
                verifyOwner = playerSet[i][0];
            }
        }
    } else {
        heldAccountable = false;
    }
}

/*@{Function data} - starting animation(executes once - calls playTracking() => interval)*/
function setupTracking() {
    //info balloon notification
    dataInfo = currentPlayer.getTitle() + " is shipping assets";
    infowindow = new google.maps.InfoWindow({
        content: dataInfo
    });

    infowindow.open(map, currentPlayer);
    trigger = setInterval(function () {
        playTracking(data)
    }, 1000);

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

    //update stats window
    checkStatus(package);
    currentPlayer.setPosition(route[steps + 15]);
    //console.log(`steps ${steps}`);
    if (currentLat - nextLat < 0.0000013522 && currentLng - nextLng < 0.0000013522) {
        console.log(`count ${count}`);
        currentPlayer = markers[count];
        package.user = currentPlayer.getTitle();
        package.action = "transfer";
        if (verifyValue !== "No") {
            package.temperature = verifyValue
        }

        //current package's owner
        console.log(`interval ${package.user}`);

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
                stopTracking(trigger);
                checkStatus(package);
                infowindow.setContent("Order finished");
            }
        }, 500);
    }
    steps++;
}

/*@{Object data} - stops playTracking()*/
function stopTracking(interval$) {
    clearInterval(interval$);
}

//--------------------------------------------//------------------------------------------------

/*Drawing Map*/
function initMap() {
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer({
        draggable: true,
        suppressMarkers: true
    });
    var mapCenter = new google.maps.LatLng(defaultCoordinates[defaultCoordinates.length - 1].lat, defaultCoordinates[defaultCoordinates.length - 1].lng);
    var mapOptions = {
        zoom: 5,
        center: mapCenter,
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

            directionsDisplay.setDirections(data);
            route = data.routes[0].overview_path;

        }
    });
}

/*--------------//-----------------------------------//---------------------*/

/*UI events listenner*/
function createAsset(init) {
    doTransaction(init);
    let assetContainerBody = $('.assetContainerBody');
    let assetContainer = $('.assetContainer');
    let btnCreate = $('.assetContainer button');
    let btnStart = $('.assetContainerBody button');
    setTimeout(function () {
        if (data !== null && data !== undefined) {
            //temporary way to append ui elements => update with react,etc;
            assetContainerBody.append('<br><img src="./images/pallete.png"><br>' +
                '<h4>Asset created</h4>' +
                '<br><b>Owner: </b>' + data.user.toUpperCase() +
                '<br><b>Description: </b>' + data.description +
                '<br><b>Registered: </b>' + data.lastTransaction +
                '<br><b>UUID: </b> ' + uuid + '\n');

            assetContainer.addClass("extendContainer");
            assetContainerBody.fadeIn("slow");
            btnCreate.fadeOut("slow");
            btnStart.fadeIn("slow");
            checkStatus(init);
        }
        else {
            return alert("error creating asset.please try again");
        }
    }, 4000);
}

function seePackage() {
    $("#showPackage").mouseover(function () {
        $(".assetContainer").fadeIn("slow");
    });

    $("#showPackage").mouseout(function () {
        $(".assetContainer").fadeOut("slow");
    });
}

/*@{Object data} - listenner to blockchain events*/
function statsEventListenner(context) {
    let currenTime = new Date().toLocaleString();
    $("#lblTransaction").text(`!$()`);
    $("#lblTemperature").text(`${context.temperature} ºC`);
    $("#lblTime").text(`${currenTime}`);
    $("#lastTransactionTime").text(`${context.lastTransaction}`);
    $("#lblDescription").text(`${context.description}`);
    $("#lblSerialNumber").text(`$()`);
    $("#lblOwner").text(`${context.user}`);
    $("#lblStatus").text(`${status}`);
}

$("#btnUpTemp").click(function () {
    temperature++;
});

$("#btnDownTemp").click(function () {
    temperature--;
});