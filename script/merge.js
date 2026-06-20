const fs = require("fs");

function loadVideos(file) {
    const json = JSON.parse(
        fs.readFileSync(file, "utf8")
    );

    return json?.[1]?.data || [];
}

const existingVideos = loadVideos("../res/mainData.json");
const iplVideos = loadVideos("./iplData.json");
const bcciVideos = loadVideos("./bcciData.json");

console.log(`Existing videos: ${existingVideos.length}`);
console.log(`IPL videos: ${iplVideos.length}`);
console.log(`BCCI videos: ${bcciVideos.length}`);

const merged = [
    ...existingVideos,
    ...iplVideos,
    ...bcciVideos
];

const seen = new Set();
const deduped = [];

for (const video of merged) {
    if (!video.url) continue;

    const key = video.url.trim();

    if (seen.has(key)) continue;

    seen.add(key);
    deduped.push(video);
}

const output = [
    {
        lastUpdated: new Date().toLocaleDateString("en-GB")
    },
    {
        data: deduped
    }
];

fs.writeFileSync(
    "../res/mainData.json",
    JSON.stringify(output, null, 2)
);

console.log("\n========== SUMMARY ==========");
console.log(`Merged: ${merged.length}`);
console.log(`Final unique: ${deduped.length}`);
console.log(`Duplicates removed: ${merged.length - deduped.length}`);
console.log("=============================");

console.log(
    `Successfully wrote ${deduped.length} videos to ../res/mainData.json`
);
