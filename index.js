const robots = {
  youtube: require("./uploadVideo.js"),
  // tags: require("./generateTags.js"),
};
const readline = require("readline");
const express = require("express");
const app = express();
async function start() {
  app.listen(5000);

  app.get("/google/callback", function (req, res) {
    const code = req.query.code;
    res.send(code);
  });

  // rl.question("What is the clip name? ", async function (name) {
  //   const canContinue = await robots.tags(name);
  //   if (canContinue === true) {
  //     const canClose = await robots.youtube();
  //   }
  // });
  await robots.youtube();
}

start();
