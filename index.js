const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const shell = require('shelljs');
const formidable = require('formidable');
const PORT = 3000;

const bodyParserConfig = {
    limit: '50mb',
    defer: true
}

app.use(cors());
app.use(bodyParser.json(bodyParserConfig));
app.use(bodyParser.urlencoded({...bodyParserConfig, extended: true}));

app.get('/', async (req, res) => {
    res.send("ok");
})

app.post('/:lang(ita|eng)', async (req, res) => {
    const filename = Math.random().toString(36).substring(7);
    try {
	const {lang} = req.params 
        const { image } = req.body;
	const data = image.replace(/^data:image\/\w+;base64,/, "");
	const buffer =  Buffer.from(data, 'base64');
	fs.writeFileSync(`${filename}.png`,buffer);
	shell.exec(`./textcleaner -g -e stretch -f 25 -o 10 -u -s 1 -T -p 10 ${filename}.png ${filename}-opt.png`);
	shell.exec(`tesseract -l ${lang} ${filename}-opt.png ${filename}`);
	const text = fs.readFileSync(`${filename}.txt`, 'utf8');
	res.json({text});
	console.log(new Date().toUTCString(),"\n",text);
    } catch (e) {
        console.log(new Date().toUTCString(),e)
        res.send(e);
    } finally {
    	fs.unlink(`${filename}.png`, () => {});
        fs.unlink(`${filename}-opt.png`, () => {});  
        fs.unlink(`${filename}.txt`, () => {});
    }

})

app.post("/pdf/:lang(ita|eng)", (req,res) => {
    var form = new formidable.IncomingForm();
    //Formidable uploads to operating systems tmp dir by default
    form.uploadDir = ".";       //set upload directory
    form.keepExtensions = true;     //keep file extension

    form.parse(req, function(err, fields, files) {
	if(!err) {
		const upload = files.pdf.path;
		const filename = Math.random().toString(36).substring(7);
		const {stdout: pages} = shell.exec(`pdfinfo ${upload} | grep Pages | sed 's/[^0-9]*//'`);
		shell.exec(`pdftoppm ${upload} ${filename} -png`);
		try {
       			const {lang} = req.params;
			let text = "";
			for(let i = 1; i<= pages; i++) {
				shell.exec(`./textcleaner -g -e stretch -f 25 -o 10 -u -s 1 -T -p 10 ${filename}-${i}.png ${filename}-${i}-opt.png`);
                        	shell.exec(`tesseract -l ${lang} ${filename}-${i}-opt.png ${filename}-${i}`);
				text += fs.readFileSync(`${filename}-${i}.txt`, 'utf8');
			}
        		res.json({text});
        		console.log(new Date().toUTCString(),"\n",text);
    		} catch (e) {
        		console.log(new Date().toUTCString(),e)
        		res.send(e);
    		} finally {
			fs.unlink(upload, () => {});
			for(let i = 1; i <= pages; i++) {
				fs.unlink(`${filename}-${i}.png`, () => {});
        	                fs.unlink(`${filename}-${i}-opt.png`, () => {});
	                        fs.unlink(`${filename}-${i}.txt`, () => {});

			}
   		 }

	} else {
		res.send(err);
	}
    });
})

function ocrPic(req,res,filename) {

}


app.listen(PORT, ()=>{
    console.log("Listening on Port " + PORT);
});
