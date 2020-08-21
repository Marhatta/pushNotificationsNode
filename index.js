const express = require("express");
const app = express();
const https = require("https");
require("dotenv").config();
var { google } = require("googleapis");
var MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
var SCOPES = [MESSAGING_SCOPE];

var HOST = "fcm.googleapis.com";
var PATH = `/v1/projects/${process.env.PROJECT_ID}/messages:send`;

const PORT = process.env.PORT || 3000;

function getAccessToken() {
  return new Promise(function (resolve, reject) {
    var key = require("./service-account.json");
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );

    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}

function sendFcmMessage(fcmMessage) {
  getAccessToken().then(function (accessToken) {
    var options = {
      hostname: HOST,
      path: PATH,
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      data: fcmMessage,
    };
    var request = https.request(options, function (resp) {
      resp.setEncoding("utf8");
      resp.on("data", function (data) {
        console.log("Message sent to Firebase for delivery, response:");
        console.log(data);
      });
    });
    request.on("error", function (err) {
      console.log("Unable to send message to Firebase");
      console.log(err);
    });
    request.write(JSON.stringify(fcmMessage));
    request.end();
  });
}

app.post("/send", (req, res) => {
  res.send(
    sendFcmMessage({
      message: {
        token:
          "cFvBeWAkQK2xM5-VJRFCdU:APA91bEGWsjBDFK-5bv1oBirSEuwWDOSbPdfHtxgQ4MN8uhDDSsuQ1X6WJpfEzN84r0aONweDdhunHLu5r6Sup6DNkCDzTRYg68MH8PnYyGWG6_wBsTiWXE523EmyKS-8Ai22bDEMCAs",
        notification: {
          title: "Portugal vs. Denmark",
          body: "great match!",
        },
      },
    })
  );
});

app.listen(PORT, () => {
  console.log("Server started on PORT", PORT);
});
