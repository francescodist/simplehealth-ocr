const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const { createWorker } = require('tesseract.js');

const worker = createWorker({
    logger: m => console.log(m)
});

(async () => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    // await worker.terminate();
})();

app.use(cors());

app.get('/', async (req, res) => {
    const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
    console.log(text);
    res.send(text);
})

app.listen(PORT);