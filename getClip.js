const cliprxyz = require("cliprxyz");
const fetch = require("node-fetch");
const fs = require("fs");
const DIR = "/home/mateus/Videos/clips";

async function requestEnterUrl(clipUrl) {
  try {
    const response = await cliprxyz.downloadClip(clipUrl);

    const buffer = await fetchToBuffer(response.clipUrl);
    save(buffer);
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
function save(buffer) {
  if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR);
  }
  fs.writeFile(`${DIR}/output.mp4`, buffer, () =>
    console.log("finished downloading video!", `${DIR}/output.mp4`)
  );
}
module.exports = requestEnterUrl;
