//Mqtt Client functions

// Create a client instance
mqttClient = new Paho.MQTT.Client("b6kg16.messaging.internetofthings.ibmcloud.com", 1883, "a:b6kg16:mapui");

// set callback handlers
mqttClient.onConnectionLost = onConnectionLost;
mqttClient.onMessageArrived = onMessageArrived;

// connect the mqttClient
mqttClient.connect({
    onSuccess: onConnect,
    userName: "a-b6kg16-makbfawlct",
    password: "xEQKOkZ+SL@TT5zXp&"
});


// called when the mqttClient connects
function onConnect() {
    // Once a connection has been made, make a subscription and send a message.

    mqttClient.subscribe("iot-2/type/+/id/linkitone01/evt/telemetry/fmt/json");
    mqttClient.subscribe("iot-2/type/+/id/fake_device/evt/telemetry/fmt/json");
    message = new Paho.MQTT.Message("Hello");
    message.destinationName = "/World";
    mqttClient.send(message);
}

// called when the mqttClient loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log(`error connecting to mqtt ${responseObject.errorCode}`);
    }
}

// called when a message arrives
function onMessageArrived(message) {
    payload = JSON.parse(message.payloadString);
    payload.timestamp = new Date().getTime();
    data.temperature = Number((payload.t - 273).toFixed(2));
    console.log(`connected ${message.payloadString}`);
    //checkStatus();
}