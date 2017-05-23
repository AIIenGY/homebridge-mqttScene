'use strict';

var Service, Characteristic;
var mqtt = require("mqtt");

const MQTTVERSION_3_1_1 = 4;
const RECON_PERIOD = 1000;
const CON_TIMEOUT = 5 * 1000;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-mqttScene", "mqttScene", MqttSceneAccessory);
}


function MqttSceneAccessory(log, config) {
    this.log = log;
    this.name = config["name"];
    this.url = config["url"];
    this.publish_options = {
        qos: ((config["qos"] !== undefined)? config["qos"]: 1)
    };
    this.client_Id = "MqttScene" + Math.random().toString(16).substr(2, 6);
    this.options = {
        keepalive: 10,
        clientId: this.client_Id,
        protocolId: 'MQTT',
        protocolVersion: MQTTVERSION_3_1_1,
        clean: true,
        reconnectPeriod: RECON_PERIOD,
        connectTimeout: CON_TIMEOUT,
        username: config["usr"],
        password: config["pwd"],
        rejectUnauthorized: false
    };
    this.topicSub    = config["gwID"]+"/response/+";
    this.topicPub    = config["gwID"]+"/request/" + this.client_Id;
    this.sceneID    = config["sceneID"];
    this.sceneActiveMQTT = '{"message":"scene active", "id":"' + this.sceneID + '"}'

    this.switchStatus = false;

    this.service = new Service.Switch(this.name);
    this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.getStatus.bind(this))
        .on('set', this.setStatus.bind(this));

    // connect to MQTT broker
    this.client = mqtt.connect(this.url, this.options);
    var that = this;
    this.client.on('error', function () {
        that.log('Error event on MQTT');
    });

    this.client.on('connect', function () {  
        that.client.subscribe(that.topicSub);
    })

    this.client.on('message', function (topic, message) {
        console.log(topic +":" + message.toString()+".");
         
        var response = message.toString();
        if(response) {
            try {
                var jsonObj = JSON.parse(response);
                //console.log(jsonObj.message);

                if(jsonObj.message === "scene active response" )
                {
                    if(jsonObj.id != that.sceneID)
                    {
                        return;
                    }
                    
                    if(jsonObj.code != 0)
                    {                
                        console.log("scene active failed, sceneid:"+jsonObj.id+"info:"+jsonObj.info);
                    }
                    
                    that.service.getCharacteristic(Characteristic.On).setValue(false, undefined, 'fromSetValue');
                }
            } catch(e) {
                console.log("invalid json string");
                return;
            }
        }
    });
}

MqttSceneAccessory.prototype.getStatus = function(callback) {
    callback(null, false);
}

MqttSceneAccessory.prototype.setStatus = function(status, callback, context) {
    if(context !== 'fromSetValue') {
        this.client.publish(this.topicPub, this.sceneActiveMQTT, this.publish_options);
    }
    callback();
}

MqttSceneAccessory.prototype.getServices = function() {
    var informationService = new Service.AccessoryInformation();
    
    informationService
    .setCharacteristic(Characteristic.Manufacturer, "AIIenGY")
    .setCharacteristic(Characteristic.Model, "MQTT Scene Contorl")
    .setCharacteristic(Characteristic.SerialNumber, this.sceneID);
    
    return [this.service];
}
