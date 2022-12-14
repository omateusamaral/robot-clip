const readline = require("readline");
const express = require("express");
const EventEmitter = require("events");

const eventEmitter = new EventEmitter();
const youtubeUploadVideo = require("./uploadVideo.js");
const { setTimeout } = require("timers/promises");
const robots = {
  getClip: require("./getClip"),
  tags: require("./generateTags.js"),
};
const app = express();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

async function start() {
  app.listen(5000);

  app.get("/google/callback", function (req, res) {
    const code = req.query.code;
    res.send(code);
  });

  rl.question("what is the url clip?", (clipUrl) => {
    rl.question("What is the clip name? ", async function (name) {
      robots.getClip(clipUrl);
      eventEmitter.emit("generateTagsEvent", name);
    });
  });

  eventEmitter.on("generateTagsEvent", async (clipName) => {
    const canContinue = await robots.tags(clipName);

    if (canContinue) {
      new youtubeUploadVideo(clipName).init();
    }
  });

  rl.on("close", function () {
    console.log("PROCESSING...");
    rl.close();
    process.exit();
  });
}

start();
