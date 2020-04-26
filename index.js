const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser({
    limit: '50mb'
}));
const { createWorker, createScheduler } = require('tesseract.js');

const worker = createWorker({
    logger: m => console.log("Worker 1", m)
});

const worker2 = createWorker({
    logger: m => console.log("Worker 2", m)
});

let scheduler;

(async () => {
    await worker.load();
    await worker.loadLanguage('ita');
    await worker.initialize('ita');
    await worker2.load();
    await worker2.loadLanguage('ita');
    await worker2.initialize('ita');
    scheduler = createScheduler();
    scheduler.addWorker(worker);
    scheduler.addWorker(worker2);
    // await worker.terminate();
})();

app.get('/', async (req, res) => {
    const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
    console.log(text);
    res.send(text);
})

app.post('/ocr', async (req, res) => {
    try {
        const { image } = req.body;
        console.log(image);
        const { data: { text } } = await scheduler.addJob('recognize', image);
        console.log(text);
        res.send(text);
    } catch (e) {
        console.log(e)
        res.send(e);
    }

})

app.listen(PORT);