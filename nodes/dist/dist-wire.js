/**
 * Copyright 2014 Sense Tecnic Systems, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var util = require("util");

module.exports = function(RED) {
    "use strict";
    // we hard code the broker used for device distribution.  Could move this to settings
    
    var MQTT_PREFIX = "wire/";

    var MQTT_BROKER_CONFIG = {
            "broker":"test.mosquitto.org",
            "port":1883,
            "clientid":"",
            "username":"",
            "password":""
        };

    var connectionPool = require("../core/io/lib/mqttConnectionPool");

    function WireInNode(n) {
        RED.nodes.createNode(this,n);

        this.topic = MQTT_PREFIX+n.topic;  // wire/{id}-{output}-{id}
        this.broker = MQTT_BROKER_CONFIG.broker;
        this.brokerConfig = MQTT_BROKER_CONFIG;
        util.log('WireInNode created. topic:'+this.topic);

        if (this.brokerConfig) {
            this.status({fill:"red",shape:"ring",text:"disconnected"});
            this.client = connectionPool.get(this.brokerConfig.broker,this.brokerConfig.port,this.brokerConfig.clientid,this.brokerConfig.username,this.brokerConfig.password);
            var node = this;
            this.client.subscribe(this.topic,2,function(topic,payload,qos,retain) {
                    var msg = {topic:topic,payload:payload,qos:qos,retain:retain};
                    if ((node.brokerConfig.broker == "localhost")||(node.brokerConfig.broker == "127.0.0.1")) {
                        msg._topic = topic;
                    }
                    node.send(msg);
            });
            this.client.on("connectionlost",function() {
                node.status({fill:"red",shape:"ring",text:"disconnected"});
            });
            this.client.on("connect",function() {
                node.status({fill:"green",shape:"dot",text:"connected"});
            });
            this.client.connect();
        } else {
            this.error("missing broker configuration");
        }
        this.on('close', function() {
            if (this.client) {
                this.client.disconnect();
            }
        });
    }
    RED.nodes.registerType("wire in",WireInNode);

    function WireOutNode(n) {
        RED.nodes.createNode(this,n);

        this.topic = MQTT_PREFIX+n.topic;  // wire/{id}
        this.broker = MQTT_BROKER_CONFIG.broker;
        this.brokerConfig = MQTT_BROKER_CONFIG;
        util.log('WireOutNode created. topic:'+this.topic);

        if (this.brokerConfig) {
            this.status({fill:"red",shape:"ring",text:"disconnected"},true);
            this.client = connectionPool.get(this.brokerConfig.broker,this.brokerConfig.port,this.brokerConfig.clientid,this.brokerConfig.username,this.brokerConfig.password);
            var node = this;
            this.on("input",function(msg) {
                if (msg != null) {
                    if (node.topic) {
                        msg.topic = node.topic;
                    }
                    this.client.publish(msg);
                }
            });
            this.client.on("connectionlost",function() {
                node.status({fill:"red",shape:"ring",text:"disconnected"});
            });
            this.client.on("connect",function() {
                node.status({fill:"green",shape:"dot",text:"connected"});
            });
            this.client.connect();
        } else {
            this.error("missing broker configuration");
        }
        this.on('close', function() {
            if (this.client) {
                this.client.disconnect();
            }
        });
    }
    RED.nodes.registerType("wire out",WireOutNode);

}
