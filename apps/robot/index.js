'use strict';

module.change_code = 1;

var alexa = require("alexa-app");
var gcm = require("node-gcm");
var app = new alexa.app("alexaRobot");

const gcmServerKey = process.env.GCM_SERVER_KEY;
const registrationToken = process.env.REGISTRATION_TOKEN;

var sender = new gcm.Sender(gcmServerKey);
var registrationTokens = [registrationToken];

var front = ["forward", "front"];
var back = ["back"];
var left = ["left"];
var right = ["right"];
var stop = ["stop"];

var directionsCodes = [front, back, left, right, stop];
var directions = [].concat.apply([], directionsCodes);

function directionToCode(direction) {
  console.log("In direction to code" + direction);

  if(direction === "forward" || direction === "front") {
    return 0;
  } else if(direction === "back") {
      return 1;
  } else if(direction === "left") {
      return 2;
  } else if(direction === "right") {
      return 3;
  } else {
      return 4;
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
    console.log(request);
    console.log(response);
    response.shouldEndSession(false);
    var direction = request.slot("DIRECTION");
    var directionCode = directionToCode(direction);
    var dir = directionsCodes[directionCode][0];
    var message = new gcm.Message({
        data: { code: directionCode }
    });
    sender.send(message, { registrationTokens: registrationTokens }, function (err, data) {
      if (err) {
        console.error(err);
        response.say("Sorry, I don't know where to go.");
      } else {
        console.log(data);
        if (request.hasSession()) {
          if(dir === "forward") {
            response.say("Moving robot " + dir);
          } else {
            response.say("Moving robot to " + dir);
          }
        }
      }
      response.send();
    });
    return false;
  }
);

module.exports = app;
