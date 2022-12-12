const cliprxyz = require("cliprxyz");
const fetch = require("node-fetch");
const fs = require("fs");
const DIR = "/home/mateus/Videos/clips";

async function requestEnterUrl() {
  try {
    const clipName = process.argv.at(-1);
    const clipUrl = process.argv.at(-2);

    const response = await cliprxyz.downloadClip(clipUrl);

    const buffer = await fetchToBuffer(response.clipUrl);
    save(clipName, buffer);
  } catch (error) {
    console.log("error ", error);
  }
}

async function fetchToBuffer(clipUrl) {
  try {
    const fetchUrl = await fetch(clipUrl);
    return await fetchUrl.buffer();
  } catch (error) {
    console.log("error in fetch to buffer", error);
  }
}
function save(clipName, buffer) {
  if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR);
  }
  fs.writeFile(`${DIR}/${clipName}.mp4`, buffer, () =>
    console.log("finished downloading video!", `${DIR}/${clipName}.mp4`)
  );
}
requestEnterUrl();
