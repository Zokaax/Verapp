import express, { Router, json } from 'express';
import cors from 'cors';

// import config from './index.ts';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path'

const app = express();
const home = Router();

app.use(cors());

const port = process.env.port ?? 3000;
app.use(json());

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));


home.get('/', (req, res) => {
	const html = '<h1>Hello World</h1><p>$$$$ el que lo lea</p>'
	res.send(html)
})


app.use('/', home);


app.listen(port, () => {
        console.log("Servidor escuchando en http://localhost:" + port);
});
