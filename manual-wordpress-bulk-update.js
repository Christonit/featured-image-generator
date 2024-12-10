import { handler as mainProcess } from "./index.js";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();


// On NEWS_DICT we hardcode the news post we want to update
const NEWS_DICT = {

    "/news/cumberland-pharmaceuticals-inc-cpix-news-2024_12_10/": {
        "id": 82790,
        "type": "news",
        "date": "2024-12-10T09:19:31-05:00",
        "title": "Why Cumberland Pharmaceuticals is Sizzling After FDA Nod",
        "image": "https://content.timothysykes.com/cdn-cgi/image/quality=90,format=webp,width=740/https://content.timothysykes.com/wp-content/uploads/2024/12/cumberlands-stock-soars-sfda-approval-ignites-market-excitements.png",
        "lastmod": "2024-12-10T09:19:31-05:00",
        "status": "publish",
        "content_read_time": 6,
        "excerpt": "Cumberland Pharmaceuticals Inc.&#8217;s stocks are soaring, with shares trading up by an astounding 143.54 percent on Tuesday, following a significant uptick in market sentiment driven by notable achievements in advancing their pharmaceutical developments and strategic partnerships. A Surge Fueled by New Drug Approval The FDA approval for a supplement to Cumberland&#8217;s Acetadote simplifies administration and [&hellip;]",
        "slug": "cumberland-pharmaceuticals-inc-cpix-news-2024_12_10"
    },
    "/news/mongodb-inc-mdb-news-2024_12_09/": {
        "id": 82743,
        "type": "news",
        "date": "2024-12-09T17:20:46-05:00",
        "title": "MongoDB&#8217;s Potential Surge: Analyzing Recent Developments",
        "image": "https://content.timothysykes.com/cdn-cgi/image/quality=90,format=webp,width=740/https://content.timothysykes.com/wp-content/uploads/2024/12/mongodbs-stock-ssurges-with-new-partnerships.png",
        "lastmod": "2024-12-09T17:20:46-05:00",
        "status": "publish",
        "content_read_time": 7,
        "excerpt": "MongoDB Inc. stocks are set for an upswing with a pivotal new partnership announced with a leading cloud provider, igniting market enthusiasm. On Monday, MongoDB Inc.&#8217;s stocks have been trading up by 9.46 percent. Latest Market Movements A notable investor confidence spike has been observed as Piper Sandler dramatically increased MongoDB&#8217;s price target from $335 [&hellip;]",
        "slug": "mongodb-inc-mdb-news-2024_12_09"
    },
    "/news/scholar-rock-holding-corporation-srrk-news-2024_12_09/": {
        "id": 82741,
        "type": "news",
        "date": "2024-12-09T17:20:41-05:00",
        "title": "Scholar Rock&#8217;s Unlikely Ascent: What&#8217;s Behind the Skyrocket?",
        "image": "https://content.timothysykes.com/cdn-cgi/image/quality=90,format=webp,width=740/https://content.timothysykes.com/wp-content/uploads/2024/12/scholar-rocks-sstock-surges-whats-fueling-the-rise.png",
        "lastmod": "2024-12-09T17:20:41-05:00",
        "status": "publish",
        "content_read_time": 6,
        "excerpt": "Scholar Rock Holding Corporation&#8217;s stocks are likely buoyed by reports of successful developments in their therapeutic pipeline, which enhance their market potential and investor enthusiasm. On Monday, Scholar Rock Holding Corporation&#8217;s stocks have been trading up by 8.05 percent. Recent Highlights: Following an underwhelming Phase 3 trial from competitor Biohaven, Scholar Rock gains traction, with [&hellip;]",
        "slug": "scholar-rock-holding-corporation-srrk-news-2024_12_09"
    },
    "/news/tal-education-group-tal-news-2024_12_09/": {
        "id": 82742,
        "type": "news",
        "date": "2024-12-09T17:20:41-05:00",
        "title": "Is TAL Education Group&#8217;s Stock Surge Signaling a Buy?",
        "image": "https://content.timothysykes.com/cdn-cgi/image/quality=90,format=webp,width=740/https://content.timothysykes.com/wp-content/uploads/2024/12/tals-stock-ssurges-amid-chinas-policy-shifts.png",
        "lastmod": "2024-12-09T17:20:41-05:00",
        "status": "publish",
        "content_read_time": 6,
        "excerpt": "TAL Education Group&#8217;s stock is likely buoyed by positive sentiment stemming from recovery in China&#8217;s education sector and optimistic regulatory updates. On Monday, TAL Education Group&#8217;s stocks have been trading up by 5.92 percent. Shift in Policy Offers New Horizons Key policy changes in China around education have created exciting growth Potential. TAL Education Group [&hellip;]",
        "slug": "tal-education-group-tal-news-2024_12_09"
    },

}

const arrayOfObjects = Object.entries(NEWS_DICT).map(([_, value]) => {
    return {
        title: value.title,
        content: value.excerpt,
        id: value.id,
    }
});


// This script is meant to be run once, it will generate a featured image for each news post in the NEWS_DICT
// then it will update the news post with the generated featured image
(async function main() {


    console.log(arrayOfObjects.length)

    // Get the app password from the environment variables
    const APP_PASSWORD = process.env.APP_PASSWORD;


    console.log({ APP_PASSWORD })

    // Set the backend to the URL of the WordPress instance
    const BACKEND = `https://content.timothysykes.com/`;

    // Loop through the news posts in the NEWS_DICT
    for (let i = 0; i < arrayOfObjects.length; i++) {

        const title = arrayOfObjects[i].title;
        const content = arrayOfObjects[i].content;

        // Call the mainProcess function with the title, content and backend
        const response = await mainProcess({
            body: JSON.stringify({
                title,
                content,
                backend: BACKEND,
                app_password: APP_PASSWORD
            })
        });


        // const response = await fetch(`https://vxx5fluuzwzffbcqhm74b6hdly0enwhx.lambda-url.us-east-1.on.aws/?random=${Math.random()}`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         title,
        //         content,
        //         backend: BACKEND,
        //         app_password: APP_PASSWORD
        //     })
        // });

        // console.log({ response: response.status, body: await response.json() });

        // If the response is successful, log a message with the ID of the generated media
        if (response.statusCode === 200) {

            // Update the news post with the generated featured media
            const postUpdateResponse = await fetch(`${BACKEND}wp-json/wp/v2/news/${arrayOfObjects[i].id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Buffer.from(`christopher@millionairepub.com:${APP_PASSWORD}`).toString("base64")}`,
                },
                body: JSON.stringify({
                    featured_media: response.body.id
                })
            });

            // Log a message with the slug of the updated post
            console.log("SUCCESS IN POST UPDATE", '/news/' + postUpdateResponse.slug);

        }

        // if (response.status === 200) {

        //     const responseJson = await response.json();

        //     console.log(`SUCCESSFUL GENERATION OF FEATURED MEDIA ${responseJson.id} FOR POST ${`${BACKEND}wp-json/wp/v2/news/${arrayOfObjects[i].id}`}`);

        //     // Update the news post with the generated featured media
        //     const postUpdateResponse = await fetch(`${BACKEND}wp-json/wp/v2/news/${arrayOfObjects[i].id}`, {
        //         method: "PUT",
        //         headers: {
        //             "Content-Type": "application/json",
        //             Authorization: `Basic ${Buffer.from(`christopher@millionairepub.com:${APP_PASSWORD}`).toString("base64")}`,
        //         },
        //         body: JSON.stringify({
        //             featured_media: responseJson.id
        //         })
        //     });

        //     // Log a message with the slug of the updated post
        //     console.log("SUCCESS IN POST UPDATE", '/news/' + postUpdateResponse.slug);
        // }
    }

})()
