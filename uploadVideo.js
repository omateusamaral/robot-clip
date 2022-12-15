"use strict";
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const OAuth2Data = require("./client_secret.json");
const EventEmitter = require("events");

const tags = require("./tags.json");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
class UploadVideo {
  constructor(clipName) {
    this.infoForVideo = {
      title: clipName,
      description: "SIGA O CANAL PARA MAIS CLIPS",
      tags: tags,
    };
    this.eventEmitter = new EventEmitter();
    this.TOKEN_DIR = "credentials/";
    this.TOKEN_PATH = this.TOKEN_DIR + "credentials.json";
    this.SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];
    this.clientId = OAuth2Data.web.client_id;
    this.clientSecret = OAuth2Data.web.client_secret;
    this.redirectUris = OAuth2Data.web.redirect_uris;
    this.oAuth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUris[0]
    );
    this.token = {};
    this.authUrl = "";
    this.videoFilePath = "/home/mateus/Videos/clips/output.mp4";
  }

  init() {
    this.requestForAuthenticate();
  }
  async requestForAuthenticate() {
    this.authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: this.SCOPES,
      approval_prompt: "force",
      redirect_uri: "http://localhost:5000/google/callback",
      client_id: this.clientId,
    });

    fs.readFile(this.TOKEN_PATH, async (err, token) => {
      if (err) {
        this.getNewToken();
      } else {
        try {
          await this.uploadVideo();
        } catch (error) {
          console.log(`uploading error`, error);
          this.getNewToken();
        }
      }
    });
  }
  getNewToken() {
    console.log("Authorize this app by visiting this url: ", this.authUrl);

    rl.question("Enter the code from that page here: ", async (codeTyped) => {
      try {
        await this.oAuth2Client.getToken(codeTyped, async (err, tokens) => {
          if (err) {
            console.log("Error while trying to retrieve access token", err);
            return;
          }

          this.oAuth2Client.setCredentials(tokens);
          google.options({
            auth: this.oAuth2Client,
          });

          fs.writeFile(
            "credentials/credentials.json",
            codeTyped,
            {
              encoding: `utf-8`,
            },
            async (err) => {
              if (err) throw err;
              console.log("generated crendetials json");
              await this.uploadVideo();
            }
          );
        });
      } catch (error) {
        console.log(`getToken error`, error);
        throw error;
      }
    });
  }

  async uploadVideo() {
    const youtube = google.youtube({
      version: "v3",
    });
    const requestParameters = {
      part: "snippet, status",
      requestBody: {
        snippet: {
          title: this.infoForVideo.title,
          description: this.infoForVideo.description,
          tags: this.infoForVideo.tags,
        },
        status: {
          privacyStatus: "public",
        },
      },
      media: {
        body: fs.createReadStream(this.videoFilePath),
      },
    };

    try {
      console.info("Starting upload");
      await youtube.videos.insert(requestParameters, {
        onUploadProgress: this.onUploadProgress,
      });
    } catch (error) {
      console.log("error uploading");
      throw error;
    }
  }
  onUploadProgress(event) {
    const progress = Math.round(
      (event.bytesRead /
        fs.statSync("/home/mateus/Videos/clips/output.mp4").size) *
        100
    );
    console.log(`> ${Number(progress)}% completed`);

    if (progress >= 100) {
      // fs.unlinkSync("/home/mateus/Videos/clips/output.mp4");
      // console.log("video deleted");
      process.exit();
    }
  }
}

module.exports = UploadVideo;
