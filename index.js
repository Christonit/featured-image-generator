import express from 'express';
import { analyzeContent } from './ai-analysis.js';
import { generateTSImage, uploadImageToWordpress, generateSttImage } from './draw.js';

const app = express();
app.use(express.json());

app.post('/handle-image-generation', async (req, res) => {
    try {
        const { title: request_title, content, backend, app_password } = req.body;

        if (typeof request_title !== 'string' || typeof content !== 'string') {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const { tagline, company_logo, sentiment } = await analyzeContent({ title: request_title, content });

        const TS_BACKENDS = ["https://content.timothysykes.com/", "https://sykescontenstg.wpenginepowered.com/", "https://sykescontendev.wpenginepowered.com/"];
        const STT_BACKENDS = ["https://content.stockstotrade.com/", "https://contentsttdev.wpenginepowered.com/"];

        let buffer;

        console.log("1. SUCCESSFUL Tagline Creation", { tagline, sentiment, backend }, TS_BACKENDS.includes(backend));
        if (TS_BACKENDS.includes(backend)) {
            console.log("2. Executing image generation for TS backend");
            buffer = await generateTSImage({
                title: tagline,
                company_logo: company_logo,
                sentiment: sentiment,
            });
        }

        if (STT_BACKENDS.includes(backend)) {
            console.log("2. Executing image generation for STT backend");
            buffer = await generateSttImage({
                title: tagline,
                company_logo: company_logo,
                sentiment: sentiment,
            });
        }

        console.log("3. SUCCESSFUL Image Creation for", backend);
        if (buffer) {
            const response = await uploadImageToWordpress(backend, buffer, tagline, app_password);

            if (response.status !== 201) {
                throw new Error("Image Upload Failed" + response.statusText);
            }

            const data = await response.json();

            console.log("4. SUCCESSFUL Image Upload for", backend);
            return res.status(200).json(data);
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

export default app;




