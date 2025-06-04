import 'dotenv/config';
import express, { Router, json } from 'express';
import cors from 'cors';

import ejs from 'ejs';

import { createConnection } from './supabase.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path'
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const home = Router();

app.use(cors());
app.use(json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(join(__dirname, 'public')));

const supabase = createConnection();

const port = process.env.port ?? 3000;

app.use(express.urlencoded({ extended: true }));

async function renderPartial(partialName, data = {}) {

	const partialPath = path.join('views', `${partialName}.ejs`);
	try {
		const html = await ejs.renderFile(partialPath, data);
		return html;
	} catch (error) {
		console.error(`Error al renderizar parcial ${partialName}:`, error);
		// Puedes retornar un string de error, vacío, o lanzar la excepción
		return `<p style="color: red;">Error al cargar el encabezado: ${partialName}</p>`;
	}
}

home.get('/', async (req, res) => {


	const carouselData = [
		{label: '', content : '', imgURL: './assets/img/nanomania1.jpg'},
		{label: '', content : '', imgURL: './assets/img/nanomania2.jpg'},
		{label: '', content : '', imgURL: './assets/img/nanomania3.jpg'},
		{label: '', content : '', imgURL: './assets/img/nanomania3.jpg'},
		{label: '', content : '', imgURL: './assets/img/nanomania4.jpg'}
	]
	const carousel = await renderPartial('carousel', {
		carouselData
	});

	//////////////////////////////


	let supabaseItems;
	try {
		const {
			data,
			error
		} = await supabase
			.from('lista_precio')
			.select('*')
		if (error) throw error;
			supabaseItems = data;
	} catch (err) {
		console.error('Error al cargar datos iniciales desde Supabase:', err);
		return {
			success: false,
			error: err.message
		};
	}

	const list = await renderPartial('list', {supabaseItems});
	
	res.render('index', {
		list,
		carousel
	})

	
})

app.use('/', home);

app.listen(port, () => {
        console.log("Servidor escuchando en http://localhost:" + port);
});
