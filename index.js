const readline = require("readline");
const express = require("express");
const youtubeUploadVideo = require("./uploadVideo.js");
const robots = {
  youtube: require("./uploadVideo.js"),
  tags: require("./generateTags.js"),
};
const app = express();
async function start() {
  app.listen(5000);

  app.get("/google/callback", function (req, res) {
    const code = req.query.code;
    res.send(code);
  });

  // await robots.tags(`mercado futuro csgo`);

  // rl.question("What is the clip name? ", async function (name) {
  //   const canContinue = await robots.tags(name);
  //   if (canContinue === true) {
  //     const canClose = await robots.youtube();
  //   }
  // });
  new youtubeUploadVideo("Mercado futuro csgo").init();
}

start();
