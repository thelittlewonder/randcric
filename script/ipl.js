const axios = require("axios");
const fs = require("fs");

const START_YEAR = 2008;
const END_YEAR = 2026;

async function fetchYear(year) {
    let page = 1;
    const allVideos = [];

    while (true) {
        const url =
            `https://www.iplt20.com/videoslist` +
            `?tab=highlights` +
            `&year=${year}` +
            `&teamslug=` +
            `&tray_type=Match%20Highlights` +
            `&page=${page}`;


        console.log(`Year ${year}: fetching page ${page}`);

        try {
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            });

            const payload = response.data;

            if (
                !payload ||
                !payload.videoResponce ||
                !Array.isArray(payload.videoResponce.data)
            ) {
                console.warn(
                    `Year ${year}: unexpected response on page ${page}`
                );
                break;
            }

            const rawVideos = payload.videoResponce.data;

            console.log(
                `Year ${year}: page ${page} returned ${rawVideos.length} videos`
            );

            if (rawVideos.length === 0) {
                break;
            }

            const videos = rawVideos.map(video => ({
                title: video.title,
                url: `https://www.iplt20.com/video/${video.id}/${video.titleUrlSegment}`
            }));

            allVideos.push(...videos);

            if (payload.loadmoreshow === false) {
                break;
            }

            page++;
        } catch (err) {
            console.error(
                `Year ${year}: page ${page} failed`,
                err.message
            );
            break;
        }


    }

    console.log(
        `Year ${year}: total collected ${allVideos.length} videos`
    );

    return allVideos;
}

(async () => {
    const allVideos = [];

    for (let year = START_YEAR; year <= END_YEAR; year++) {
        console.log(`\n========== ${year} ==========`);


        const videos = await fetchYear(year);

        if (videos.length === 0) {
            console.warn(
                `Year ${year}: returned zero videos`
            );
        }

        allVideos.push(...videos);


    }

    const deduped = [
        ...new Map(
            allVideos.map(video => [video.url, video])
        ).values()
    ];

    console.log("\n========== SUMMARY ==========");
    console.log(`Raw videos: ${allVideos.length} `);
    console.log(`Unique videos: ${deduped.length} `);
    console.log("=============================\n");

    const output = [
        {
            lastUpdated: new Date().toLocaleDateString("en-GB")
        },
        {
            data: deduped
        }
    ];

    fs.writeFileSync(
        "./mainData.json",
        JSON.stringify(output, null, 2)
    );

    console.log(
        `Successfully wrote ${deduped.length} videos to mainData.json`
    );
})();
