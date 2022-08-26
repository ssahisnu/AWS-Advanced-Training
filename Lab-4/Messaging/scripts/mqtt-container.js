// -- note drawing-container.js must be included above this module

function MQTTWebSocketService()
{
    var service = {};

    service.disconnectRef = 0;
    service.mqttClient = null;
    service.iotEndpoint = "";
    service.iotRegion = "";
    service.Connect = conn;
    service.Subscribe = sub;
    service.Publish = pub;
    service.Disconnect = disc;
    service.callbackUpdate = null;

    return service;


    function conn(iotEndpoint,
                  iotRegion,
                  callbackConnect,
                  callbackUpdate)
    {
        console.log("WebSocketService::Initiating WebSockets connection...");

        if(iotEndpoint != null)
            service.iotEndpoint = iotEndpoint;

        if(iotRegion != null)
            service.iotRegion = iotRegion;

        if(callbackUpdate != null)
            service.callbackUpdate = callbackUpdate;

        if(callbackConnect != null)
            service.callbackConnect = callbackConnect;

        if(service.mqttClient == null)
        {
            var requestUrl = prepareWebsocketUrl({ host: service.iotEndpoint, region: service.iotRegion, debug: false },
                                                 AWS.config.credentials.accessKeyId,
                                                 AWS.config.credentials.secretAccessKey,
                                                 AWS.config.credentials.sessionToken);

            service.mqttClient = new Paho.MQTT.Client(requestUrl, "UNIQUE_CLIENT_" + new Date().getTime());

            service.mqttClient.onMessageArrived = function (message) {
                //console.log("msg inbound: topic: " + message.destinationName + message.payloadString);
                service.callbackUpdate(message);
            };

            service.mqttClient.onMessageDelivered = function (message) {
                //console.log("msg delivered to topic: " + message.destinationName + ' payload: ' + message.payloadString);
            };

            service.mqttClient.onConnectionLost = function (err) {
                console.log("lost connection: error code:" + err.errorCode + ' error message: ' + err.errorMessage);
                service.mqttClient = null;

                if(--service.disconnectRef >= 0)
                {
                    console.log("Skipping autoconnect " + service.disconnectRef);
                }
                else
                {
                    service.Connect();
                    service.disconnectRef = 0;
                }
            };
        }

        service.mqttClient.connect({
            onSuccess: function () {
                if(service.callbackConnect)
                {
                    service.callbackConnect(true);
                }

                if(AWS &&
                    AWS.config &&
                    AWS.config.credentials &&
                    AWS.config.credentials.identityId)
                {
                    console.log('connected with ' + AWS.config.credentials.identityId + ' to ' + service.iotEndpoint);
                }
                else
                {
                    console.log('connected to ' + service.iotEndpoint);
                }
            },
            useSSL: true,
            timeout: 3,
            mqttVersion: 4,
            onFailure: function ()
            {
                if( service.callbackConnect )
                    service.callbackConnect(false);

                console.log('failed to connect to ' + service.iotEndpoint);

                service.Connect();
            }
        });
    }

    function disc()
    {
        if(service.mqttClient == null)
        {
            console.log('service.mqttClient not initialized');
            return;
        }

        service.disconnectRef++;
        service.mqttClient.disconnect();
        service.mqttClient = null;
    }

    function sub(topic, callback)
    {
        if(service.mqttClient == null)
        {
            console.log('SUB: not connected');
            return;
        }

        service.mqttClient.subscribe(topic, {
            onSuccess: function () {
                if(callback)
                    callback(topic);
            },
            onFailure: function () {
                console.log('failed to subscribed to ' + topic);
            }
        });
    }

    function pub(topic, payload)
    {
        if(service.mqttClient == null)
        {
            console.log('PUB: not connected');
            return;
        }

        var message = new Paho.MQTT.Message(payload);
        message.destinationName = topic;
        message.qos = 1;
        service.mqttClient.send(message);

    }

    function prepareWebsocketUrl(options, awsAccessId, awsSecretKey, sessionToken)
    {
        if(options.debug)
        {
            console.log('options = ' + JSON.stringify(options));
            console.log('awsAccessId = ' + awsAccessId);
            console.log('awsSecretKey = ' + awsSecretKey);
            console.log('sessionToken =' + sessionToken);
        }

        var now = getDateTimeString();
        var today = getDateString(now);
        var path = '/mqtt';
        var awsServiceName = 'iotdevicegateway';

        var queryParams = 'X-Amz-Algorithm=AWS4-HMAC-SHA256' +
            '&X-Amz-Credential=' +
            awsAccessId + '%2F' +
            today + '%2F' +
            options.region + '%2F' +
            awsServiceName + '%2Faws4_request' +
            '&X-Amz-Date=' + now +
            '&X-Amz-SignedHeaders=host';

        var signedUrl = signUrl(
            'GET',
            'wss://',
            options.host,
            path,
            queryParams,
            awsAccessId,
            awsSecretKey,
            options.region,
            awsServiceName,
            '',
            today,
            now,
            options.debug
        );

        if(sessionToken) {
            return signedUrl + '&X-Amz-Security-Token=' + encodeURIComponent(sessionToken);
        }
        else {
            return signedUrl;
        }
    }

    function getDateTimeString()
    {
        var d = new Date();
        //
        // The additional ''s are used to force JavaScript to interpret the
        // '+' operator as string concatenation rather than arithmetic.
        //
        return d.getUTCFullYear() + '' +
            makeTwoDigits(d.getUTCMonth() + 1) + '' +
            makeTwoDigits(d.getUTCDate()) + 'T' +
            makeTwoDigits(d.getUTCHours()) + '' +
            makeTwoDigits(d.getUTCMinutes()) + '' +
            makeTwoDigits(d.getUTCSeconds()) + 'Z';
    }

    function getDateString(dateTimeString)
    {
        return dateTimeString.substring(0, dateTimeString.indexOf('T'));
    }

    function makeTwoDigits(n)
    {
        if(n > 9)
        {
            return n;
        }
        else
        {
            return '0' + n;
        }
    }

    function getSignatureKey(key, dateStamp, regionName, serviceName)
    {
        var kDate = AWS.util.crypto.hmac('AWS4' + key, dateStamp, 'buffer');
        var kRegion = AWS.util.crypto.hmac(kDate, regionName, 'buffer');
        var kService = AWS.util.crypto.hmac(kRegion, serviceName, 'buffer');
        var kSigning = AWS.util.crypto.hmac(kService, 'aws4_request', 'buffer');

        return kSigning;
    }

    function signUrl(method,
                     scheme,
                     hostname,
                     path,
                     queryParams,
                     accessId,
                     secretKey,
                     region,
                     serviceName,
                     payload,
                     today,
                     now,
                     debug)
    {
        var signedHeaders = 'host';
        var canonicalHeaders = 'host:' + hostname + '\n';

        var canonicalRequest = method + '\n' +
            path + '\n' +
            queryParams + '\n' +
            canonicalHeaders + '\n' +
            signedHeaders + '\n' +
            AWS.util.crypto.sha256(payload, 'hex');

        var hashedCanonicalRequest = AWS.util.crypto.sha256(canonicalRequest, 'hex');

        var stringToSign = 'AWS4-HMAC-SHA256\n' +
            now + '\n' +
            today + '/' +
            region + '/' +
            serviceName +
            '/aws4_request\n' +
            hashedCanonicalRequest;

        var signingKey = getSignatureKey(secretKey, today, region, serviceName);
        var signature = AWS.util.crypto.hmac(signingKey, stringToSign, 'hex');
        var finalParams = queryParams + '&X-Amz-Signature=' + signature;
        var url = scheme + hostname + path + '?' + finalParams;

        if(debug === true)
        {
            console.log('signing key: ' + signingKey + '\n');
            console.log('canonical request: ' + canonicalRequest + '\n');
            console.log('hashed canonical request: ' + hashedCanonicalRequest + '\n');
            console.log('string to sign: ' + stringToSign + '\n');
            console.log('signature: ' + signature + '\n');
            console.log('url: ' + url + '\n');
        }

        return url;
    }
}


/**
 * extend the basic point drawing canvas so that instances listen for
 * messages on the given MQTT instance which are then drawn as points
 */
class MQTTSubscriberDrawingContainer extends EventSubscriberDrawingContainer
{
    constructor(counterElementName,
                configuration,
                statisticsCallback
              )
    {
        super(counterElementName, configuration, statisticsCallback);
    }

    // -- receiver methods

    startWebSocket(callbackConnect)
    {
        var ws = new MQTTWebSocketService();

        var container = this;

        function processMessages(messages)
        {
            var point = JSON.parse(messages);
            container.processMessage(point);
        }

        ws.Connect(this.configuration.IoT.Endpoint,
                   this.configuration.Region,
                   function(succeeded)
                   {
                       // -- connection complete callback
                       if(succeeded)
                       {
                           // Subscribe to known topics to receive updates
                           ws.Subscribe(container.configuration.IoT.Topic, callbackConnect);
                       }
                       else
                       {
                           console.log("websocket connection failed");
                       }
                   },
                   function(jsonMsg)
                   {
                       processMessages(jsonMsg.payloadString);
                   });
    }
}

/**
 * extend the basic point drawing canvas so that instances listen for
 * messages on the given MQTT instance which are then drawn as points
 */
class MQTTPublisherDrawingContainer extends EventPublisherDrawingContainer
{
    constructor(counterElementName,
                configuration,
                statisticsCallback
              )
    {
        super(counterElementName, configuration, statisticsCallback);

        var self = this;
        this.webSocket = null;

        this.canvas.node.onmousemove = function(e)
        {
            if(!self.isDrawing)
            {
                return;
            }

            self.lastMouseMoveTime = e.timeStamp;

            var x = e.clientX - self.offset(this).left;
            var y = e.clientY - self.offset(this).top;

            function pointIdleDispatch(point)
            {
                self.webSocket.Publish(
                  self.configuration.IoT.Topic,
                  JSON.stringify({ x:x, y:y, timestamp: new Date().getTime(), clear:false })
                );
                self.statistics.MessagesSent++;
                self.BroadcastStatistics();
            }

            window.setTimeout(pointIdleDispatch, {x:x, y:y});
            self.drawPoint(x,y);
        };

        this.canvas.node.onmousedown = function(e)
        {
            self.isDrawing = true;
        };

        this.canvas.node.onmouseup = function(e)
        {
            self.isDrawing = false;
        };

        // send clicks through as a single mouse move
        this.canvas.node.onclick = function(e)
        {
            self.isDrawing = true;
            self.canvas.node.onmousemove(e);
            self.isDrawing = false;
        };
    }

    clearCanvas()
    {
        super.clearCanvas();
        this.webSocket.Publish(
          this.configuration.IoT.Topic,
          JSON.stringify({ x:0, y:0, timestamp: new Date().getTime(), clear:true })
        );
    }

    startWebSocket(onConnectedCallback)
    {
        var ws = new MQTTWebSocketService();

        this.webSocket = ws;

        this.webSocket.Connect(this.configuration.IoT.Endpoint,
                               this.configuration.Region,
                               function(succeeded)
                               {
                                   // -- connection complete callback
                                   if(succeeded)
                                   {
                                       console.log("websocket connection successful");
                                       if (onConnectedCallback)
                                        onConnectedCallback();
                                   }
                                   else
                                   {
                                       console.log("websocket connection failed");
                                   }
                               },
                               function(jsonMsg)
                               {
                                   // -- connection update callback
                               });
    }
}
