# homebridge-mqttscene
  MQTT scene control plugin for homebridge


# Installation

Follow the instruction in homebridge for the homebridge server installation. The plugin is published through NPM and should be installed "globally" by typing:

`npm install -g homebridge-mqttscene`

# Sample Configuration


    {
        "bridge": {
            "name": "Homebridge",
            "username": "A0:63:91:E8:6C:00",
            "port": 51826,
            "pin": "031-45-154"
        },
        
        "description": "This is an example configuration file. You can use this as a template for creating your own configuration file.",
    
        "accessories": [
            {
                "accessory": "mqttScene",
                "name": "meeting",
                "url": "mqtt://192.168.1.1",
                "usr": "test",
                "pwd": "test",
                "gwID": "gatewayID",
                "sceneID": "sceneID"
            }
        ],
        
        "platforms": [
        ]
    }
