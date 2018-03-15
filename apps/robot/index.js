'use strict';

module.change_code = 1;

var alexa = require("alexa-app");
var gcm = require("node-gcm");
var app = new alexa.app("alexaRobot");

const gcmServerKey = process.env.GCM_SERVER_KEY;
const registrationToken = process.env.REGISTRATION_TOKEN;

var sender = new gcm.Sender(gcmServerKey);
var registrationTokens = [registrationToken];

var front = ["forward"];
var right = ["right"];
var left = ["left"];
var back = ["back"];
var stop = ["stop"];
// var n = ["north", "forward", "up"];
// var ne = ["north east"];
// var e = ["east", "right"];
// var se = ["south east"];
// var s = ["south", "back", "backward", "reverse", "down"];
// var sw = ["south west"];
// var w = ["west", "left"];
// var nw = ["north west"];

// index is a code
var directionsCodes = [front, right, left, back, stop];
var directions = [].concat.apply([], directionsCodes);

function directionToCode(direction) {
  console.log("In direction to code" + direction);

  if(direction === "forward") {
    return 5;
  } else if(direction === "right") {
      return 6;
  } else if(direction === "left") {
      return 7;
  } else if(direction === "back") {
      return 8;
  } else {
      return -1;
  }
}

app.dictionary = {
  "directions": directions
};

app.launch(function(request, response) {
  response.shouldEndSession(false);
  console.log("Session started");
  response.say("Welcome!");
});

app.sessionEnded(function(request, response) {
  console.log("Session ended");
});

app.intent("RobotMovementIntent", {
    "slots": { "DIRECTION": "LITERAL" },
    "utterances": [
      "move {directions|DIRECTION}",
      "go {directions|DIRECTION}",
    ]
  },
  function(request, response) {
    console.log("Request");
    console.log(request);
    console.log("Response");
    console.log(response);
    response.shouldEndSession(false);
    var direction = request.slot("DIRECTION");
    console.log("Direction:");
    console.log(direction);
    var directionCode = directionToCode(direction);
    console.log(directionsCodes)
    var dir = directionsCodes[directionCode][0];
    console.log(dir);
    var message = new gcm.Message({
        data: { code: directionCode }
    });
    console.log("Still here2")
    console.log(message);
    console.log("Still here")
    sender.send(message, { registrationTokens: registrationTokens }, function (err, data) {
      if (err) {
        console.error(err);
        response.say("Sorry, I don't know where to go.");
      } else {
        console.log(data);
        if (request.hasSession()) {
          response.say("Moving robot" + dir);
        }
      }
      response.send();
    });
    return false;
  }
);

// app.intent("RobotStopIntent", {
//     "utterances": [
//       "{exit|quit|stop|end|bye}",
//     ]
//   },
//   function(request, response) {
//     response.say("It was a real pleasure talking to you. Have a good day!");
//   }
// );

module.exports = app;
