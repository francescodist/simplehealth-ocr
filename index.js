const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 3000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Ok');
})

app.listen(PORT);