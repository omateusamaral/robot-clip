const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const OAuth2Data = require("./client_secret.json");
// const tags = require("./tags.json");

let infoForVideo = {
  title: "",
  description: "SIGA O CANAL PARA MAIS CLIPS",
  tags: [],
};
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json

const TOKEN_DIR = "credentials/";
const TOKEN_PATH = TOKEN_DIR + "credentials.json";
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];
const { client_id, client_secret, redirect_uris } = OAuth2Data.web;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function init() {
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  authenticatedRequest(oAuth2Client);
}

/**
 * authenticate the user
 *
 * @param {google.auth.OAuth2} oAuth2Client An authorized OAuth2 client.
 */
function authenticatedRequest(oAuth2Client) {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    approval_prompt: "force",
  });

  fs.readFile(TOKEN_PATH, async function (err, token) {
    if (err) {
      getNewToken(oAuth2Client, url);
      authenticatedRequest(oAuth2Client);
    } else {
      authenticatedRequest(oAuth2Client);
      setInterval(async () => await uploadVideo(oAuth2Client), 10000);
    }
  });
}
async function uploadVideo(oAuth2Client) {
  const youtube = google.youtube({
    version: "v3",
    auth: oAuth2Client,
  });
  const requestParameters = {
    part: "snippet, status",
    requestBody: {
      snippet: {
        title: infoForVideo.title,
        description: infoForVideo.description,
        tags: infoForVideo.tags,
      },
      status: {
        privacyStatus: "public",
      },
    },
    media: {
      body: fs.createReadStream("/home/mateus/Videos/clips/mercadofuturo.mp4"),
    },
  };
  console.log(">  Starting to upload the video to YouTube");
  const youtubeResponse = await youtube.videos.insert(requestParameters);

  console.log(
    `> [youtube-robot] Video available at: https://youtu.be/${youtubeResponse.data.id}`
  );
  return youtubeResponse.data;
}

function getNewToken(oAuth2Client, url) {
  let canContinue = false;
  console.log("Authorize this app by visiting this url: ", url);
  rl.question("Enter the code from that page here: ", function (code) {
    oAuth2Client.getToken(code, async function (err, token) {
      if (err) {
        console.log("Error while trying to retrieve access token", err);
        return;
      }

      console.log("code", code, "token", token);
      oAuth2Client.setCredentials(code);
      oAuth2Client.credentials = token;

      canContinue = true;
    });
  });

  return canContinue;
}

// init();
module.exports = init;
