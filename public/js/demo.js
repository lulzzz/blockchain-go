var map,
    uuid,
    marker,
    route,
    markers,
    playTracking,
    currentPlayer,
    dataInfo,
    infowindow,
    humidity,
    verifyValue = "No",
    verifyOwner = "No",
    temperature = "21",
    heldAccountable = false,
    status = 'OK',
    rand = Math.floor((Math.random() * 8000) + 1),
    pack = "Asset Package " + rand,
    transactionDate = new Date().toLocaleString(),
    data = { description: pack, user: "IBM", action: "create", "temperature": temperature, lastTransaction: transactionDate };


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
        createAsset(data);
    });
});

//------------------//-------------------------//--------------------//

/*@{Object data} - Rest functions*/
function doTransaction(action) {
    $.post('/request', action).done(function onSuccess(res) {
        data = res;
        console.log("doTransaction " + JSON.stringify(data));
        if (data.status === true) {
            heldAccountable = true;
            checkStatus();
        }
    }).fail(function onError(error) {
        console.log(`error requesting ${error}`);
    });
}

function checkStatus() {
    if (heldAccountable || temperature > 24) {
        status = "Verify";
        document.getElementById("shipmentStatus").style.color = "Red";
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

//--------------------------------------------//------------------------------------------------

/*Drawing Map*/
function initMap() {
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer({
        // draggable: true,
        suppressMarkers: true
    });
    var mapCenter = new google.maps.LatLng(defaultCoordinates[defaultCoordinates.length - 1].lat, defaultCoordinates[defaultCoordinates.length - 1].lng);
    var mapOptions = {
        zoom: 15,
        center: mapCenter
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);
}

function setMarkers(map) {
    let image, img;
    markers = [];
    for (var x = 0; x < playerSet.length; x++) {
        //
        var actors = playerSet[x];
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
            var player = this.getTitle();
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
    var image = 'images/eu.png';

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
    console.log("createAsset " + JSON.stringify(init));
    setTimeout(function () {
        if (data !== null && data !== undefined) {
            //temporary way to append ui elements => update with react,etc;
            $('#displayInfo').append('<h4>Asset created</h4><br>' +
                '<br><b>Owner: </b>' + data.user.toUpperCase() +
                '<br><b>Description: </b>' + data.description +
                '<br><b>Registered: </b>' + data.lastTransaction +
                '<br><b>UUID: </b> ' + uuid + '\n');
        }
        else {
            return alert("error creating asset.please try again");
        }
    }, 4000);
}

function blockchainEvents(assetDescription, playerID, assetID, lastTransaction, status) {
    var i = 0;
    $("#blockchainInfo").append('<h4>Blockchain info</h4>');
    $("#blockchainInfo").append('<h5>Asset Description: <label id="block_user"> "' + assetDescription + '"</label></h5>');
    $("#blockchainInfo").append('<h5>Serial number: <label id="block_user">"' + assetID + '"</label></h5>');
    $("#blockchainInfo").append('<h5>Asset Owner: <label id="block_user">"' + playerID.toUpperCase() + '"</label></h5>');
    $("#blockchainInfo").append('<h5>Last transaction: <label id="block_user">"' + lastTransaction + '"</label></h5><br>');
    if (status !== "OK") {
        $("#blockchainInfo").append('<h5>Need to be checked: <label id="block_user">"' + verifyValue + '"</label></h5>');
        $("#blockchainInfo").append('<h5>Responsible Party: <label id="block_user">"' + verifyOwner + '"</label></h5>');
    }
    $("#blockchainInfo").fadeIn("slow");
    if (i <= 1) {
        setTimeout(function () {
            $("#blockchainInfo").fadeOut("slow");
            i++;
        }, 10000);
    }
}

function stopTracking(tracking) {
    $('#introBlockChain').empty();
    $('.modal-footer').empty();
    $('#displayInfo').empty();
    $('#displayInfo').append('<h3>Shipment Final Status</h3>' +
        '<b>Asset Description:</b> ' + data.description +
        '<br><b>Serial number:</b> ' + data.id +
        '<br><b>Last transaction: </b>' + data.lastTransaction +
        '<br><b>UUID: </b> ' + uuid +
        '<br><b>Delivered to Customer:</b> Yes</h4>' +
        '<br><b>Temperature to Verify:</b> ' + verifyValue +
        '<br><b>Responsible Party:</b> ' + verifyOwner +
        '<br><b>Number of transactions:</b> 3');
    $('#myModal').modal('show');
    clearInterval(tracking);
}

$("#btnUpTemp").click(function () {
    temperature++;

});

$("#btnDownTemp").click(function () {
    temperature--;

});
