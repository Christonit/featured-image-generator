import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import fetch from "node-fetch";

import dotenv from "dotenv";


dotenv.config();
/**
 * Draws the image with the tagline
 * @param title : string, the title to draw
 * @param company_logo : string | null, is the logo for the company we are creating the image for, null if we dont have the symbol logo for it, we just display company logo
 * @param sentiment : string, the sentiment of the tagline if its positive, negative or neutral
 */


export async function generateTSImage({
    title,
    company_logo,
    sentiment
}) {

    const COLOURS = {
        BLUE: "#33b8e1",
        BLACK: "#000000",
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const images_path = path.join(__dirname, 'images', sentiment || "neutral");
    const files_length = fs.readdirSync(images_path).length;
    const images_folder = path.resolve(__dirname, 'images');


    console.log("GENERATING TS IMAGE: 1. Created canvas");


    const canvas = createCanvas(1118, 806);
    // const ctx = canvas.getContext("2d");


    const fontPath = path.resolve(__dirname, 'fonts', 'Oswald-Bold.ttf');

    registerFont(fontPath, { family: "Oswald" });

    try {
        console.log(`Font successfully registered from ${fontPath}`);
    } catch (error) {
        console.error('Error registering font:', error.message);
    }


    setTimeout(() => {

    }, 100)

    let image;

    switch (sentiment) {
        case "positive":
            image = await loadImage(`${images_folder}/positive/${Math.floor(Math.random() * (files_length - 1 + 1)) + 1}.png`);
            break;
        case "negative":
            image = await loadImage(`${images_folder}/negative/${Math.floor(Math.random() * (files_length - 1 + 1)) + 1}.png`);
            break;
        case "neutral":
        default:
            image = await loadImage(`${images_folder}/neutral/${Math.floor(Math.random() * (files_length - 1 + 1)) + 1}.png`);
            break;
    }


    let textBlockHeight = 0;

    console.log("GENERATING TS IMAGE: 2. Image loaded");

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const aspectRatio = image.width / image.height;

    console.log("GENERATING TS IMAGE: 3. Defined ASPECT RATIO",)

    let drawWidth, drawHeight;
    if (image.width > image.height) {
        // Landscape orientation: fit by width
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / aspectRatio;
    } else {
        // Portrait orientation: fit by height
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * aspectRatio;
    }

    // Center the image
    const x = (canvasWidth - drawWidth) / 2;
    const y = (canvasHeight - drawHeight) / 2;

    const ctx = canvas.getContext("2d");

    console.log("GENERATING TS IMAGE: 4. Centered Image")
    ctx.drawImage(image, x, y, drawWidth, drawHeight);

    ctx.letterSpacing = "-2px";

    ctx.font = "64px Oswald";

    console.log("GET FONT", ctx.font);
    ctx.textAlign = "left";
    ctx.textRendering = "geometricPrecision";

    let splitText;

    if (/\[s\]|\[\/s\]|\[br\]/.test(title)) {
        splitText = title.split(/(\[s\]|\[\/s\]|\[br\])/);
        // rest of the code
    } else {
        splitText = [title]; // return the original title as a single-element array
    }

    if (splitText.length > 1) {
        splitText.forEach((item, index) => {

            if (['[s]', '[/s]'].includes(item)
                && splitText[index + 1] !== ""
                && ["[s]", "[/s]"].includes(splitText[index + 2])
                && !['[s]', '[/s]'].includes(splitText[index + 1])) {

                splitText[index + 1] = "[s]" + splitText[index + 1] + "[s]";
            }

        })
    }

    console.log("GENERATING TS IMAGE: 4.1 Text splitting", { splitText, title });
    if (splitText.length === 1) {

        const isItWiderThanHalf = ctx.measureText(splitText[0]).width > ((canvasWidth / 2) + 160);

        const wordCount = splitText[0].split(" ").length;

        if (isItWiderThanHalf && wordCount > 4) {

            const refactored_line = splitText[0].split(" ").reduce((acc, curr, i) => {
                if (i % 3 === 0) {
                    acc.push([curr]);
                } else {
                    acc[acc.length - 1].push(curr);
                }
                return acc;
            }, []).map((item) => item.join(" "));

            refactored_line[1] = "[s]" + refactored_line[1] + "[s]";

            splitText = refactored_line

        }
    }

    let tagline = splitText.filter(item => item !== '' && item !== '[br]' && item !== '[s]' && item !== '[/s]');


    let headlineSentences = [];

    let lineCounter = {
        total: 0,
        reduced_line_counter: 0,
        reduced_lines_indexes: []
    }


    console.log("GENERATING TS IMAGE: 4.2 Tagline Preparation");


    for (let i = 0; i < tagline.length; i++) {
        let line = tagline[i];

        if (line.includes("[s]") || line.includes("[/s]")) {

            const finalLine = line.split(/(\[s\]|\[\/s\])/).filter(item => item !== '' && item !== '[s]' && item !== '[/s]');

            const lineWidth = ctx.measureText(finalLine[0]).width
            const halfOfWidth = canvasWidth / 2;

            if (lineWidth > halfOfWidth && finalLine[0]) {

                let splitted_text = finalLine[0].split(" ").reduce((acc, curr, i) => {

                    const modulus = finalLine[0].split(" ").length >= 5 ? 3 : 2;
                    if (i % modulus === 0) {
                        acc.push([curr]);
                    } else {
                        acc[acc.length - 1].push(curr);
                    }
                    return acc;
                }, []);

                let splitted_text_arr = []

                splitted_text.forEach((item, _) => {
                    let lineText = item.join(" ");

                    item = lineText

                    splitted_text_arr.push(item)
                })

                headlineSentences[i] = splitted_text_arr[0] + '/s/'

                if (splitted_text_arr[1]) {
                    headlineSentences.splice(i + 1, 0, splitted_text_arr[1] + '/s/')
                }
            } else {
                headlineSentences.push("/s/" + finalLine[0] + "/s/")
            }


        } else {
            headlineSentences.push(line)
        }
    }
    let is2LinesAndPreviewsWasReduced;

    console.log("GENERATING TS IMAGE: 5. Drawing text on canvas");


    for (let i = 0; i < headlineSentences.length; i++) {
        const nextLine = headlineSentences[i + 1];
        if (nextLine && /^\s*$/.test(nextLine)) {
            headlineSentences.splice(i + 1, 1);
        }

        let line = headlineSentences[i];
        let lineText = line.trim().toUpperCase();

        const textX = 0;
        let textY;

        ctx.font = "64px Oswald";

        const cleanedUpLine = lineText.includes('/S/') ? lineText.replace(/\S+/g, ' ') : lineText;
        const lineWidth = ctx.measureText(cleanedUpLine).width
        const halfOfWidth = canvasWidth / 2;

        lineCounter.total += 1

        const isLineTooLong = lineWidth > (halfOfWidth + 50);

        const tweakLastLineIfIs2Sentences = headlineSentences.length === 2 && lineText.includes('/S/') && i === 1;

        if (isLineTooLong) {

            if (lineText.includes(':')) {
                const split_line_arr = lineText.split(":")
                if (split_line_arr.length > 1) {
                    lineText = split_line_arr[0] + ":";
                    if (split_line_arr[1]) {
                        headlineSentences.splice(i + 1, 0, split_line_arr[1])
                    }
                }
            }

            ctx.font = "44px Oswald";

            textY = ((canvasHeight / 2.5) + (i + 0.1) * 52);
            textBlockHeight += 52
            lineCounter.reduced_line_counter += 1

            if (i === 0 && headlineSentences.length === 2) {
                is2LinesAndPreviewsWasReduced = true
            }

            if (
                !lineCounter.reduced_lines_indexes.includes(1) && i === 2) {
                textY += 32

            }
            lineCounter.reduced_lines_indexes.push(i)

        } else {

            if (i === 0 && headlineSentences.length === 2) {
                is2LinesAndPreviewsWasReduced = false
            }

            textY = ((canvasHeight / 2.5) + (i + 0.1) * 74);

            if (tweakLastLineIfIs2Sentences && is2LinesAndPreviewsWasReduced) {
                textY -= 24
            } else if (tweakLastLineIfIs2Sentences && !is2LinesAndPreviewsWasReduced) {
                textY -= 8
            }

        }


        function drawTextBackground(
        ) {

            // Draw the white background box
            ctx.fillStyle = "white";

            // Calculate text width and position
            const textWidth = ctx.measureText(lineText).width;
            const textMetrics = ctx.measureText(lineText);

            let textHeight = textMetrics.emHeightAscent;


            if (textHeight === 63) {
                textHeight += 6
            }

            // For here and below are the tweaks to control the block position
            let positionY = (textY - textHeight) + 14


            if (tweakLastLineIfIs2Sentences) {
                positionY += 14
            }


            if (lineCounter.reduced_lines_indexes.includes(i)) {
                textHeight += 12;
                positionY -= 9
            }


            if (lineCounter.reduced_line_counter === 0 && headlineSentences.length === 2 && i === 1) {
                positionY -= 12
            }

            if (lineCounter.reduced_lines_indexes.includes(1)
                && lineCounter.reduced_line_counter === 2
                && headlineSentences.length === 2 && i === 1) {
                positionY += 8
                textHeight -= 12

            }
            else if (lineCounter.reduced_line_counter === 2 && headlineSentences.length === 2 && i === 1) {
                positionY += 8
                textHeight -= 18

            }
            if (lineCounter.reduced_line_counter === 2 && lineCounter.total === 2 && i === 1) {
                positionY += 10
                textHeight -= 4

            }

            if (headlineSentences.length === 2 && lineCounter.reduced_line_counter === 1 && lineCounter.total === 2 && i === 1) {
                positionY -= 8

            }

            if (lineCounter.reduced_line_counter === 2 && headlineSentences.length === 3 && i === 1) {
                positionY += 4
                textHeight -= 8

            }
            if (lineCounter.reduced_line_counter === 0 && headlineSentences.length === 2 && lineCounter.total === 2 && i === 1) {
                positionY += 8
                textHeight -= 0

            }


            if (headlineSentences.length === 2
                && i === 1
                && lineCounter.reduced_line_counter === 2
                && lineCounter.reduced_lines_indexes.includes(0)
                && lineCounter.reduced_lines_indexes.includes(1)
            ) {
                positionY -= 8
                textHeight += 4
            }

            if (headlineSentences.length === 3
                && i === 1
                && lineCounter.reduced_line_counter === 2
                && lineCounter.reduced_lines_indexes.includes(0)
                && lineCounter.reduced_lines_indexes.includes(1)
            ) {
                positionY -= 14
                textHeight += 4
            }

            let blockHeight = ctx.measureText(lineText).emHeightAscent;


            if (headlineSentences.length === 2 && i === 1 && blockHeight === 63 && lineCounter.reduced_line_counter === 2) {

                blockHeight += 6;
                positionY -= 14
            }
            else if (headlineSentences.length === 2 && i === 1 && blockHeight === 63) {

                blockHeight += 6;
                positionY += 4
            }
            else if (blockHeight === 63) {

                blockHeight += 9;
                positionY += 8
            }

            else if (blockHeight === 53) {
                blockHeight += 8
            }
            else if (headlineSentences.length === 3 && blockHeight === 77 && i === 2 && lineCounter.reduced_line_counter == 0) {

                positionY -= 4
                blockHeight += 4
            }
            else if (headlineSentences.length === 4 && i === 3 && lineCounter.reduced_line_counter == 0) {
                positionY -= 4
                // blockHeight += 4
            }
            else if (headlineSentences.length === 4 && blockHeight === 77 && i === 1 && lineCounter.reduced_line_counter == 1 && lineCounter.reduced_lines_indexes.includes(0)) {
                positionY -= 2
                // blockHeight += 4
            }
            else if (headlineSentences.length === 3 && blockHeight === 77 && i === 2 && lineCounter.reduced_line_counter == 1 && lineCounter.reduced_lines_indexes.includes(2)) {
                positionY += 8
                // blockHeight += 4
            }
            else if (headlineSentences.length === 3 && blockHeight === 77 && i === 2 && lineCounter.reduced_line_counter == 2
                && lineCounter.reduced_lines_indexes.includes(0)
                && lineCounter.reduced_lines_indexes.includes(1)
            ) {
                // No operation
                positionY -= 1
            }
            else if (headlineSentences.length === 3 && blockHeight === 77 && i === 2 && lineCounter.reduced_line_counter == 1 && lineCounter.reduced_lines_indexes[0] === 0) {
                positionY -= 4;
                blockHeight += 6

            }
            else if (headlineSentences.length === 3 && blockHeight === 77 && i === 2 && lineCounter.reduced_line_counter == 1) {
                positionY -= 4
                blockHeight += 4
            }

            else if (blockHeight === 77 && i === 2 && headlineSentences.length === 3) {
                positionY += 8
            }
            else if (blockHeight === 77 && i === 1 && headlineSentences.length === 2) {
                positionY -= 4
                blockHeight -= 4
            }

            else if (blockHeight === 77 && i === 1 && headlineSentences.length === 3) {
                positionY -= 1
                blockHeight -= 4
            }
            // End of block position control


            ctx.fillRect(textX, positionY, textWidth + (isLineTooLong ? 32 : 40), blockHeight); // Adjust box padding as needed

        }


        if (lineText.includes("/S/")) {

            lineText = lineText.replace(/\/S\//g, "");

            if (headlineSentences.length > (i + 1) && i < headlineSentences.length - 1 && nextLine) {


                if (nextLine.slice(0, 2).includes("?") && nextLine.length < 3) {
                    lineText += '?';
                    headlineSentences.pop();
                }

                if (nextLine.slice(0, 2).includes(":")) {
                    lineText += ':';
                    headlineSentences[i + 1] = headlineSentences[i + 1].slice(2);
                }

            }


            if (lineText.split(" ").length <= 2) {

                ctx.font = "64px Oswald";

                textBlockHeight += 72

                // drawTextBackground(true);

            }
            else {

                const lineWidth = ctx.measureText(lineText).width

                if (i === headlineSentences.length - 1 && lineWidth < (canvasWidth / 2.5) && lineText.split(" ").length === 3) {

                    ctx.font = "64px Oswald";

                    textBlockHeight += 60

                } else {

                    textBlockHeight += 40

                    lineCounter.reduced_line_counter += 1;

                    ctx.font = "52px Oswald";


                }

                lineCounter.reduced_lines_indexes.push(i)

            }


            // This controls the position of current line.
            if (i === 1 && lineCounter.reduced_lines_indexes.length === 2 &&
                (lineCounter.reduced_lines_indexes.includes(0) &&
                    lineCounter.reduced_lines_indexes.includes(1))

            ) {
                textY += 2;
            }


            if (lineCounter.total === 2
                && i === 1
                && lineCounter.reduced_line_counter === 2
                && lineCounter.reduced_lines_indexes.includes(0)
                && lineCounter.reduced_lines_indexes.includes(1)
            ) {

                textY += 16;
            }

            if (
                lineCounter.reduced_line_counter === 0 && headlineSentences.length === 2 && lineCounter.total === 2 && i === 1
            ) {

                textY += 8
            }

            if (headlineSentences.length === 3
                && i === 1
                && lineCounter.reduced_lines_indexes.includes(1)
            ) {
                textY -= 6;
            }

            if (headlineSentences.length === 3
                && i === 2
                && lineCounter.reduced_line_counter === 2
                && lineCounter.reduced_lines_indexes.includes(0)
                && lineCounter.reduced_lines_indexes.includes(1)
            ) {
                textY -= 12;
            }

            if (headlineSentences.length === 3
                && i === 1
                && lineCounter.reduced_line_counter === 2
                && lineCounter.reduced_lines_indexes.includes(0)
                && lineCounter.reduced_lines_indexes.includes(1)
            ) {
                textY -= 28;
            }
            else if (lineCounter.total === 2
                && i === 1
                && lineCounter.reduced_line_counter === 2
                && lineCounter.reduced_lines_indexes.includes(0)
                && !lineCounter.reduced_lines_indexes.includes(1)
            ) {
                textY -= 12;
            }
            else if (headlineSentences.length === 2
                && i === 1
                && lineCounter.reduced_line_counter === 2
                && lineCounter.reduced_lines_indexes.includes(0)
                && lineCounter.reduced_lines_indexes.includes(1)
            ) {
                textY -= 4;
            }

            else
                if (lineCounter.reduced_line_counter === 2 && headlineSentences.length === 2 && i === 1) {

                    textY += 6
                } else {
                    textY -= 6
                }
            // End of control of current line



            drawTextBackground(
            );
            ctx.fillStyle = COLOURS.BLUE;

        } else {

            textBlockHeight += 72

            // From here and below is the control of the position of the current line
            if (lineCounter.total === 3
                && i === 1
                && lineCounter.reduced_line_counter === 2
                && lineCounter.reduced_lines_indexes.includes(0)
                && lineCounter.reduced_lines_indexes.includes(1)
            ) {
                textY -= 6;
            }
            if (lineCounter.total === 3
                && i === 2
                && lineCounter.reduced_line_counter === 2
                && lineCounter.reduced_lines_indexes.includes(0)
                && lineCounter.reduced_lines_indexes.includes(1)
            ) {
                textY -= 8;
            }
            if (i === 2 && lineCounter.reduced_lines_indexes.length === 1
                && lineCounter.reduced_lines_indexes.includes(1)) {
                textY -= 6;
            }
            if (i === 2 && lineCounter.reduced_lines_indexes.length === 2 &&
                (lineCounter.reduced_lines_indexes.includes(0) ||
                    lineCounter.reduced_lines_indexes.includes(1))

            ) {
                textY -= 6;
            }
            if (i === 2 &&
                lineCounter.reduced_line_counter === 1
                && lineCounter.reduced_lines_indexes.includes(2)
                && headlineSentences.length === 3

            ) {

                textY -= 10;
            }
            if (i === 2 &&
                lineCounter.reduced_line_counter === 1
                && lineCounter.reduced_lines_indexes[0] === 0
                && headlineSentences.length === 3

            ) {

                textY -= 6;
            }
            if (i === 2
                && lineCounter.reduced_line_counter === 0
                && headlineSentences.length === 3

            ) {

                textY -= 6;
            }

            if (headlineSentences.length === 3
                && i === 2
                && lineCounter.reduced_line_counter === 2
                && lineCounter.reduced_lines_indexes.includes(0)
                && lineCounter.reduced_lines_indexes.includes(2)
            ) {
                textY -= 6;
            }
            if (headlineSentences.length === 3
                && i === 2
                && lineCounter.reduced_lines_indexes.includes(1)
                && lineCounter.reduced_lines_indexes.includes(2)
            ) {
                textY += 24;

            }
            if (headlineSentences.length === 4
                && i === 2
                && lineCounter.reduced_lines_indexes.includes(2)
            ) {
                textY -= 12;
            }

            if (headlineSentences.length === 4
                && i === 3
                && lineCounter.reduced_lines_indexes.includes(2)
            ) {
                textY -= 26;

            }
            // End of line position control.

            drawTextBackground();

            ctx.fillStyle = COLOURS.BLACK;


        }
        ctx.fillText(lineText.toUpperCase(), textX + 20, textY);

    }

    const yLogoPosition = (() => {

        const middle = canvasHeight / 2;

        if (headlineSentences.length === 4 && lineCounter.reduced_line_counter === 1) {

            return middle - 184;
        }
        if (headlineSentences.length === 4 && lineCounter.reduced_line_counter === 0) {

            return middle - 184;
        }
        if (headlineSentences.length === 3 && lineCounter.reduced_line_counter === 0) {

            return middle - 184;
        }

        if (headlineSentences.length === 3 && lineCounter.reduced_line_counter === 2
            && lineCounter.reduced_lines_indexes.includes(0)
            && lineCounter.reduced_lines_indexes.includes(1)
        ) {
            return middle - 172;

        } else if (headlineSentences.length === 3 && lineCounter.reduced_line_counter === 1
            && lineCounter.reduced_lines_indexes.includes(0)
        ) {
            return middle - 172;

        } else
            if (headlineSentences.length === 3 && lineCounter.reduced_line_counter === 1 && (lineCounter.reduced_lines_indexes.includes(1) || lineCounter.reduced_lines_indexes.includes(2))) {
                return middle - 184;

            } else if (headlineSentences.length === 3 && lineCounter.reduced_line_counter === 1) {

                return middle - 172;
            }

        if (headlineSentences.length === 3 && lineCounter.reduced_line_counter === 2) {

            return middle - 184;
        }

        if (headlineSentences.length === 2 && lineCounter.reduced_line_counter === 2) {

            return middle - 172;
        }

        if (headlineSentences.length === 2 && lineCounter.reduced_line_counter === 1) {

            return middle - 184;
        }

        if (headlineSentences.length === 2 && lineCounter.reduced_line_counter === 0) {

            return middle - 182;
        }

    })();

    console.log("GENERATING TS IMAGE: 6. Drawing logo")
    let logo;

    if (company_logo) {
        logo = await loadImage(`${images_folder}/stock-symbols/${company_logo}`);

        const logo_aspect_ratio = logo.width / logo.height;
        const max_width = 160;
        const logo_width = Math.min(max_width, logo.width);
        const logo_height = logo_width / logo_aspect_ratio;

        // Add white box around the logo
        const boxX = 20;
        const boxY = 10 + yLogoPosition - logo_height;
        const boxWidth = logo_width + 20;
        const boxHeight = logo_height + 20;

        ctx.fillStyle = "white";
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        const logoX = boxX + (boxWidth - logo_width) / 2;
        const logoY = boxY + (boxHeight - logo_height) / 2;
        ctx.drawImage(logo, logoX, logoY, logo_width, logo_height);


    } else {
        logo = await loadImage("https://umplired.sirv.com/timsykes-logo-2.svg");
        ctx.drawImage(logo, 20, yLogoPosition, 200, 40);

    }

    console.log("GENERATING TS IMAGE: 7. Creating image buffer")
    const buffer = canvas.toBuffer("image/png");

    // This is the code to save the image locally, this is for testing purposes

    if (process.env.ENVIRONMENT === "local"
    ) {


        const createSlug = (string) => {
            return string.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '').replace(/\[s\]/g, '').replace(/\[\/s\]/g, '');
        }

        const image_name = createSlug(title);

        fs.writeFileSync(`./${image_name}.png`, buffer);
        // fs.writeFileSync(`./image_name.png`, buffer);

        return buffer;
    } else {

        return buffer;

    }
}
export async function generateSttImage({
    title,
    company_logo
}) {

    const COLOURS = {
        BLUE: "#33b8e1",
        BLACK: "#000000",
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const images_path = path.join(__dirname, 'images/stt');
    const files_length = fs.readdirSync(images_path).length;
    const images_folder = process.env.ENVIRONMENT === "local"
        ? "./images/stt" : "/var/task/images/stt";

    if (process.env.ENVIRONMENT === "local"
    ) {
        registerFont("./fonts/open-sans.bold.ttf", { family: "OpenSansBold" });
        registerFont("./fonts/open-sans.regular.ttf", { family: "OpenSans" });

    } else {
        registerFont("/var/task/fonts/open-sans.bold.ttf", { family: "OpenSansBold" });
        registerFont("/var/task/fonts/open-sans.regular.ttf", { family: "OpenSans" });
    }

    console.log("1. Created canvas");
    const canvas = createCanvas(1118, 806);

    let image = await loadImage(`${images_folder}/${Math.floor(Math.random() * (files_length - 1 + 1)) + 1}.jpg`);


    let textBlockHeight = 0;

    console.log("2. Image loaded");

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const aspectRatio = image.width / image.height;

    let previusTextLineHeight;

    console.log("3. Defined ASPECT RATIO",)

    let drawWidth, drawHeight;
    if (image.width > image.height) {
        // Landscape orientation: fit by width
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / aspectRatio;
    } else {
        // Portrait orientation: fit by height
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * aspectRatio;
    }

    // Center the image
    const x = (canvasWidth - drawWidth) / 2;
    const y = (canvasHeight - drawHeight) / 2;
    const ctx = canvas.getContext("2d");
    console.log("4. Centered Image")
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 20;
    ctx.shadowBlur = 30;

    ctx.closePath();

    ctx.beginPath();

    ctx.roundRect(196, 174, 726, 456, 36);
    ctx.fillStyle = COLOURS.BLACK;

    ctx.fill();
    ctx.shadowColor = "transparent";

    ctx.closePath();
    // ctx.fillRect(196, 174, 726, 456); // Adjust box padding as needed


    ctx.beginPath();
    ctx.roundRect(196, 174, 726, 456, 36);
    ctx.lineWidth = 4; // Adjust line widt
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, "#D278FF");
    gradient.addColorStop(1, "#94DEFF");
    ctx.strokeStyle = gradient;
    ctx.stroke()

    ctx.letterSpacing = "-3px";

    ctx.font = "64px OpenSans";
    ctx.textAlign = "left";
    ctx.textRendering = "geometricPrecision";

    let splitText = title.split(/(\[s\]|\[\/s\]|\[br\])/);

    splitText.forEach((item, index) => {
        if (['[s]', '[/s]'].includes(item)
            && splitText[index + 1] !== ""
            && ["[s]", "[/s]"].includes(splitText[index + 2])
            && !['[s]', '[/s]'].includes(splitText[index + 1])) {

            splitText[index + 1] = "[s]" + splitText[index + 1] + "[s]";
        }

    })

    console.log("4.1 Text splitting");
    if (splitText.length === 1) {

        const isItWiderThanHalf = ctx.measureText(splitText[0]).width > ((canvasWidth / 2) + 160);

        const wordCount = splitText[0].split(" ").length;

        if (isItWiderThanHalf && wordCount > 4) {

            const refactored_line = splitText[0].split(" ").reduce((acc, curr, i) => {
                if (i % 3 === 0) {
                    acc.push([curr]);
                } else {
                    acc[acc.length - 1].push(curr);
                }
                return acc;
            }, []).map((item) => item.join(" "));

            refactored_line[1] = "[s]" + refactored_line[1] + "[s]";

            splitText = refactored_line

        }
    }

    let tagline = splitText.filter(item => item !== '' && item !== '[br]' && item !== '[s]' && item !== '[/s]' && item !== '[s]');

    let headlineSentences = [];

    let lineCounter = {
        total: 0,
        reduced_line_counter: 0,
        reduced_lines_indexes: []
    }


    console.log("4.2 Tagline Preparation", tagline);


    for (let i = 0; i < tagline.length; i++) {
        let line = tagline[i];

        if (line.includes("[s]") || line.includes("[/s]")) {

            const finalLine = line.split(/(\[s\]|\[\/s\])/).filter(item => item !== '' && item !== '[s]' && item !== '[/s]');

            const lineWidth = ctx.measureText(finalLine[0]).width
            const halfOfWidth = canvasWidth / 2;

            if (lineWidth > halfOfWidth && finalLine[0]) {

                let splitted_text = finalLine[0].split(" ").reduce((acc, curr, i) => {

                    const modulus = finalLine[0].split(" ").length >= 5 ? 3 : 2;
                    if (i % modulus === 0) {
                        acc.push([curr]);
                    } else {
                        acc[acc.length - 1].push(curr);
                    }
                    return acc;
                }, []);

                let splitted_text_arr = []

                splitted_text.forEach((item, _) => {
                    let lineText = item.join(" ");

                    item = lineText

                    splitted_text_arr.push(item)
                })

                headlineSentences[i] = splitted_text_arr[0] + '/s/'

                if (splitted_text_arr[1]) {
                    headlineSentences.splice(i + 1, 0, splitted_text_arr[1] + '/s/')
                }
            } else {
                headlineSentences.push("/s/" + finalLine[0] + "/s/")
            }


        } else {
            headlineSentences.push(line)
        }
    }
    let is2LinesAndPreviewsWasReduced;

    console.log("4.3 Headline Sentences Prepared", headlineSentences, headlineSentences.length);
    console.log("5. Drawing text on canvas", headlineSentences);

    const headlineSentencesLength = headlineSentences.length;
    let textHeightAccumulator = 0;

    for (let i = 0; i < headlineSentencesLength; i++) {
        headlineSentences = headlineSentences.filter(item => item !== '/s/');
        const nextLine = headlineSentences[i + 1];
        if (nextLine && /^\s*$/.test(nextLine)) {
            headlineSentences.splice(i + 1, 1);
        }

        console.log("XXX. Drawing line", nextLine, headlineSentences);
        let line = headlineSentences[i];

        if (!line) continue;
        let lineText = line.trim();

        let textY;

        ctx.font = " 72px OpenSans";

        const cleanedUpLine = lineText.includes('/s/') ? lineText.replace(/\s+/g, ' ') : lineText;
        const lineWidth = ctx.measureText(cleanedUpLine).width
        const halfOfWidth = canvasWidth / 2;

        lineCounter.total += 1

        const isLineTooLong = lineWidth > (halfOfWidth + 50);

        if (isLineTooLong) {

            if (lineText.includes(':')) {
                const split_line_arr = lineText.split(":")
                if (split_line_arr.length > 1) {
                    lineText = split_line_arr[0] + ":";
                    if (split_line_arr[1]) {
                        headlineSentences.splice(i + 1, 0, split_line_arr[1])
                    }
                }
            }

            ctx.font = "52px OpenSans";

            lineCounter.reduced_line_counter += 1

            if (i === 0 && headlineSentencesLength === 2) {
                is2LinesAndPreviewsWasReduced = true
            }


            lineCounter.reduced_lines_indexes.push(i)

        } else {

            if (i === 0 && headlineSentencesLength === 2) {
                is2LinesAndPreviewsWasReduced = false
            }


        }

        if (lineText.includes("/s/")) {

            lineText = lineText.replace(/\/s\//g, "");

            if (headlineSentencesLength > (i + 1) && i < headlineSentencesLength - 1 && nextLine) {


                if (nextLine.slice(0, 2).includes("?") && nextLine.length < 3) {
                    lineText += '?';
                    headlineSentences.pop();
                }

                if (nextLine.slice(0, 2).includes(":")) {
                    lineText += ':';
                    headlineSentences[i + 1] = headlineSentences[i + 1].slice(2);
                }

            }

            let lineWidth = ctx.measureText(lineText).width


            let assignedSize;


            if (lineText.split(" ").length <= 2) {

                ctx.font = "84px OpenSansBold";

                assignedSize = 84
            }
            else {


                if (i === headlineSentencesLength - 1 && lineWidth < (canvasWidth / 2.5) && lineText.split(" ").length === 3) {

                    ctx.font = "84px OpenSansBold";
                    assignedSize = 84

                } else {

                    lineCounter.reduced_line_counter += 1;

                    ctx.font = "52px OpenSansBold";
                    assignedSize = 52

                }

                lineCounter.reduced_lines_indexes.push(i)

            }

            0xAd76e1c34F5b1008C6d8C110D77D9d2Bb4692343
            lineWidth = ctx.measureText(lineText).width

            console.log({ lineWidth, assignedSize })



            if (lineWidth > (canvasWidth / 2) + 120) {

                if (assignedSize === 84) {
                    ctx.font = "72px OpenSansBold";
                } else {
                    ctx.font = "52px OpenSansBold";
                }
            }



        } else {

            const textWidth = ctx.measureText(lineText).width

            console.log("no /s/", textWidth, canvasWidth / 2)

            if (textWidth > (canvasWidth / 2)) {
                console.log("textWidth > (canvasWidth / 2.5)", lineText)
                ctx.font = "44px OpenSans";
                textHeightAccumulator += 12
            } else if (i === headlineSentencesLength - 1) {
                textHeightAccumulator += 12
            }

        }

        ctx.fillStyle = "white";
        ctx.textAlign = "center";


        const textHeight = ctx.measureText(lineText).emHeightAscent;


        const previusTextLine = headlineSentences[i - 1];
        const previusTextHeight = previusTextLine ? ctx.measureText(previusTextLine).emHeightAscent : null;
        textHeightAccumulator += textHeight;
        // console.log({
        //     i,
        //     lineText,
        //     textHeight,
        //     previusTextLine,
        //     previusTextHeight,
        //     headlineSentencesLength,
        //     textHeightAccumulator,
        // })

        textY = (
            headlineSentencesLength > 2 ?
                (canvasHeight / headlineSentencesLength)
                + textHeightAccumulator : 300 + textHeightAccumulator
        );



        const words = lineText.split(' ');
        console.log("words", words, lineText, headlineSentences)
        const capitalizedWords = words.map(word => {
            if (word.length > 0) return word[0].toUpperCase() + word.slice(1)
            return word
        });
        const capitalizedLineText = capitalizedWords.join(' ');

        ctx.fillText(capitalizedLineText, canvasWidth / 2, textY);

    }

    const yLogoPosition = (() => {

        const middle = canvasHeight / 2;

        return middle - ((canvasHeight / 3) - 20);

    })();

    console.log("6. Drawing logo")
    let logo;

    if (company_logo) {
        logo = await loadImage(`${process.env.ENVIRONMENT === "local"
            ? "./images" : "/var/task/images"}/stock-symbols/${company_logo}`);

        const logo_aspect_ratio = logo.width / logo.height;
        const max_width = 160;
        const logo_width = Math.min(max_width, logo.width);
        const logo_height = logo_width / logo_aspect_ratio;

        // Add white box around the logo
        const boxX = 20;
        const boxY = 10 + yLogoPosition - logo_height;
        const boxWidth = logo_width + 20;
        const boxHeight = logo_height + 20;

        ctx.fillStyle = "white";
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 8;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        ctx.shadowColor = "transparent";

        const logoX = boxX + (boxWidth - logo_width) / 2;
        const logoY = boxY + (boxHeight - logo_height) / 2;
        ctx.drawImage(logo, logoX, logoY, logo_width, logo_height);

    } else {
        if (process.env.ENVIRONMENT === "local"
        ) {
            logo = await loadImage("./images/stt-logo.png");

        } else {
            logo = await loadImage("/var/task/images/stt-logo.png");
        }
        ctx.fillStyle = "white";
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 8;

        ctx.fillRect((canvasWidth / 2) - 112, yLogoPosition - 3, 224, 44);

        ctx.shadowColor = "transparent";

        ctx.drawImage(logo, (canvasWidth / 2 - 100), yLogoPosition + 4, 200, 27);

    }

    console.log("7. Creating image buffer")
    const buffer = canvas.toBuffer("image/png");

    // This is the code to save the image locally, this is for testing purposes
    if (process.env.ENVIRONMENT === "local"
    ) {

        const createSlug = (string) => {
            return string.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '').replace(/\[s\]/g, '').replace(/\[\/s\]/g, '');
        }

        const image_name = createSlug(title);
        fs.writeFileSync(`./${image_name}.png`, buffer);

        return buffer;
    } {

        return buffer;
    }
}


/**
 * Uploads a PNG image to WordPress using the REST API.
 * 
 * @param {string} wordpress_url The URL of the WordPress instance.
 * @param {Buffer} buffer The image to upload.
 * @param {string} tagline The tagline, used to generate the image name.
 * @returns {Promise<Object>} The JSON representation of the uploaded image.
 */
export const uploadImageToWordpress = async (wordpress_url, buffer, tagline, app_password, username = "christopher@millionairepub.com") => {
    try {
        // Convert the tagline into a slug format suitable for filenames
        const createSlug = (string) => {
            return string.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        };
        const image_name = createSlug(tagline);

        // Create a Blob object from the image buffer with a PNG type
        const file = new Blob([buffer], { type: "image/png" });

        console.log("Image encoded successfully", file);

        // Prepare form data to be sent with the request
        const formData = new FormData();
        formData.append("file", file, image_name + ".png");
        formData.append("alt_text", `${tagline} image`); // Optionally set alt text for accessibility
        formData.append("caption", "Uploaded via API"); // Optionally set a caption for the image

        // Encode the username and password for Basic Authentication
        const credentials = `${username}:${app_password}`;
        const base64Encoded = Buffer.from(credentials).toString("base64");

        // Make a POST request to the WordPress media endpoint
        const response = await fetch(`${wordpress_url}wp-json/wp/v2/media`, {
            method: "POST",
            headers: {
                Authorization: "Basic " + base64Encoded,
                contentType: "multipart/form-data",
            },
            body: formData,
        });

        // Check if the response indicates a successful upload
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error uploading image: ${response.statusText}, Details: ${errorText}`);
        }

        console.log("Image uploaded successfully to ", wordpress_url);

        // Return the response object upon successful upload
        return response;

    } catch (error) {
        // Log and return the error if the upload fails
        console.error("Error uploading image:", error.message);
        return { error: error.message };
    }
};

// Stud execution to create the image
if (process.env.ENVIRONMENT === "local" && process.env.EXECUTE_LOCAL
) {

    // generateSttImage({
    generateTSImage({
        title: "Grab Holdings' stock surge: [s]What's fueling the rise?[s]",
        // title: "SOUNDHOUND AI'S a buy opportunity?",
        // title: "Nokia's market shuffle: [s]What's behind the decline[s]",
        // title: "OpenDoor's [s]Surprising q3 earnings[s]: A hidden gem?",
        // title: "C3. AIs STOCK SURGE: [s]Discover the innovation edge[s]",
        // title: "RIGETTI'S QUANTUM [s]Breakthrough[s] Market rally in sight? ",
        // title: "SEMLER's Bitcoin [s]UP.[s]A Risk worth taking?",
        // title: "Intouitive machines skyrockets: Is the moon  [s]noew the limit[s]?",
        // title: "Recursion's [s]STOCK SURGE[s]: AI partnership & FDA approval",
        // title: "APPL'S stock: [s]Opportunity or Risk?[s]",
        // title: "Innodata's stock [s]skyrockets[s]: what's fueling the surge?",
        // title: "D-WAVE quantum's stock surge: What's behind the rise?",
        // title: "AAOI's stock surge: [s]opportunity or risk?[s]",
        // title: "Coherent Corp's [s]AI Inovations:[s] Is it time to invest?",
        // title: "Uipath's stock plummets: what's behind the  [s]steep drop?[/s]",
        // title: "Denison mines' [s]new ventures:[/s] a market game changer?",
        // title: "Bit digital's stock dips: what's next for investors?",
        // title: "Bitcoin's [s]record run ignites[/s] a crypto penny stocks",
        // title: "C3. AIs: [s]strategic partnership[/s] with microsoft: a game changer?",
        // title: "Super micro's stock surge: [s]Rebound or just a spike?[/s]",
        company_logo: null,
        // company_logo: "Warner Bros. Discovery.png",
        sentiment: "positive"
        // sentiment: "negative"
        // sentiment: "neutral"
    })
    // .then((buffer) => {

    //     uploadImageToWordpress("https://content.timothysykes.com/", buffer, "FNMA's Stock Surge: [s]What's Driving the Change?[s]",

    //         process.env.APP_PASSWORD).then((data) => {

    //             console.log("7. Image uploaded to wordpress", data);
    //         })

    // })
}


