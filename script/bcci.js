const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const START_YEAR = 2015;
const END_YEAR = 2026;

async function fetchYear(year) {
    const allVideos = [];

    console.log(`\n========== ${year} ==========`);

    try {
        const firstResponse = await axios.get(
            `https://www.bcci.tv/videoslist?slug=men&page=1&year=${year}&videoformat=&platform=international&type=men`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            }
        );


        const totalResults = firstResponse.data.total_results || 0;
        const entriesPerPage = firstResponse.data.entries_per_page || 20;
        const totalPages = Math.ceil(totalResults / entriesPerPage);

        console.log(
            `Year ${year}: ${totalResults} total videos across ${totalPages} pages`
        );

        for (let page = 1; page <= totalPages; page++) {
            console.log(
                `Year ${year}: fetching page ${page}/${totalPages}`
            );

            const response = await axios.get(
                `https://www.bcci.tv/videoslist?slug=men&page=${page}&year=${year}&videoformat=&platform=international&type=men`,
                {
                    headers: {
                        "User-Agent": "Mozilla/5.0"
                    }
                }
            );

            const html = response.data.videoData;

            if (!html) {
                console.warn(
                    `Year ${year}: page ${page} returned no HTML`
                );
                continue;
            }

            const $ = cheerio.load(html);

            const pageVideos = [];

            $("[data-share]").each((_, el) => {
                const title = ($(el).attr("data-title") || "").trim();
                const url = ($(el).attr("data-share") || "").trim();

                if (!title || !url) {
                    return;
                }

                const lowerTitle = title.toLowerCase();

                if (!lowerTitle.includes("match highlights")) {
                    return;
                }

                pageVideos.push({
                    title,
                    url
                });
            });

            console.log(
                `Year ${year}: page ${page} -> ${pageVideos.length} match highlights`
            );

            allVideos.push(...pageVideos);
        }

        console.log(
            `Year ${year}: collected ${allVideos.length} match highlights`
        );

        return allVideos;


    } catch (err) {
        console.error(
            `Year ${year}: failed`,
            err.message
        );


        return [];


    }
}

(async () => {
    const allVideos = [];

    for (let year = START_YEAR; year <= END_YEAR; year++) {
        const videos = await fetchYear(year);
        allVideos.push(...videos);
    }

    const deduped = [
        ...new Map(
            allVideos.map(video => [video.url, video])
        ).values()
    ];

    console.log("\n========== SUMMARY ==========");
    console.log(`Raw videos: ${allVideos.length}`);
    console.log(`Unique videos: ${deduped.length}`);
    console.log(
        `Duplicates removed: ${allVideos.length - deduped.length}`
    );
    console.log("=============================");

    const output = [
        {
            lastUpdated: new Date().toLocaleDateString("en-GB")
        },
        {
            data: deduped
        }
    ];

    fs.writeFileSync(
        "./bcciData.json",
        JSON.stringify(output, null, 2)
    );

    console.log(
        `Successfully wrote ${deduped.length} videos to bcciData.json`
    );
})();
