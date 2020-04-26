const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser({
    limit: '50mb'
}));
const { createWorker } = require('tesseract.js');

const worker = createWorker({
    logger: m => console.log(m)
});

(async () => {
    await worker.load();
    await worker.loadLanguage('ita');
    await worker.initialize('ita');
    // await worker.terminate();
})();

app.get('/', async (req, res) => {
    const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
    console.log(text);
    res.send(text);
})

app.post('/ocr', async (req, res) => {
    console.log(req.body)
    const { image } = req.body;
    const { data: { text } } = await worker.recognize(image);
    console.log(text);
    res.send(text);
})

app.listen(PORT);