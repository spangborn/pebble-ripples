/*
 * Ripples configuration object
 */

var ripples = {
    "config" : "https://spangborn.github.io/pebble-ripples/index.html",
    "access_token" : localStorage.getItem("access_token"),
    "client_id"    : localStorage.getItem("client_id")
};

/*
 *    AppMessage
 */

ripples.appMessageQueue = {
	queue: [],
	numTries: 0,
	maxTries: 5,
	add: function(obj) {
		this.queue.push(obj);
	},
	clear: function() {
		this.queue = [];
	},
	isEmpty: function() {
		return this.queue.length === 0;
	},
	nextMessage: function() {
		return this.isEmpty() ? {} : this.queue[0];
	},
	send: function() {
		if (this.queue.length > 0) {
			var ack = function() {
				appMessageQueue.numTries = 0;
				appMessageQueue.queue.shift();
				appMessageQueue.send();
			};
			var nack = function() {
				appMessageQueue.numTries++;
				appMessageQueue.send();
			};
			if (this.numTries >= this.maxTries) {
				console.log('Failed sending AppMessage: ' + JSON.stringify(this.nextMessage()));
				ack();
			}
			console.log('Sending AppMessage: ' + JSON.stringify(this.nextMessage()));
			Pebble.sendAppMessage(this.nextMessage(), ack, nack);
		}
	}
};

/*
 *    Ripples functions
 */

ripples.sendMessage = function (msg) {
    var transactionId = Pebble.sendAppMessage( msg,
        function(e) {
            console.log("Successfully delivered message with transactionId="
              + e.data.transactionId);
        },
        function(e) {
            console.log("Unable to deliver message with transactionId="
                + e.data.transactionId
                + " Error is: " + e.error.message);
        }
    );
};

ripples.getSites = function () {
    var msg = {
        "site" : "foo"
    };
    ripples.sendMessage(msg);
};

ripples.getData = function () {

};


/*
 *    Pebble events
 */

Pebble.addEventListener("ready",
    function(e) {
        console.log("Ripples is ready.");
    }
);

Pebble.addEventListener("showConfiguration",
  function(e) {
      var cachebuster = Math.round(new Date().getTime() / 1000);
     Pebble.openURL(ripples.config + "?cacheBust=" + cachebuster);
  }
);

Pebble.addEventListener("webviewclosed",
  function(e) {
    console.log("Configuration window returned: " + e.response);
  }
);

Pebble.addEventListener("appmessage",
  function(e) {
    console.log("Received message: " + e.payload);
    if (e.payload.request) {
        switch (e.payload.request) {
            case "sites":
                ripples.getSites();
                break;

            case "data":
                ripples.getData();
                break;

            default:
                // Default case
                break;
        }
    }
  }
);
