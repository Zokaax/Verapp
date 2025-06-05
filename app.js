import dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import express, {
    Router,
    json
} from 'express';

import cors from 'cors';
import ejs from 'ejs';

import {
    createConnection
} from './supabase.js';

import {
    fileURLToPath
} from 'url';
import {
    dirname,
    join
} from 'path';
import path from 'path'
const __dirname = dirname(fileURLToPath(
    import.meta.url));

const app = express();
const home = Router();

const __imgCarouselDirectory = process.env.IMGCAROUSELURL
const __imgCatalogDirectory = process.env.IMGCATALOGURL
const __imgDirectory = process.env.IMGDIRECTORY
const __TablaView = process.env.TABLE_VIEW
const __TablaList = process.env.TABLE_LIST

app.use(cors());
app.use(json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(join(__dirname, 'public')));

const supabase = createConnection();

const port = process.env.port || 3000;

app.use(express.urlencoded({
    extended: true
}));

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

    let supabaseView;
    try {
        const {
            data,
            error
        } = await supabase
            .from(__TablaView)
            .select('*')
        if (error) throw error;
        supabaseView = data;
    } catch (err) {
        console.error('Error al cargar datos iniciales desde Supabase:', err);
        return {
            success: false,
            error: err.message
        };
    }

    if (supabaseView && supabaseView.length > 0) {
        supabaseView.forEach((item) => {
            if (item.imageURL) {
                item.imageURL = __imgCarouselDirectory + item.imageURL
            }
        })
    }

    const carousel = await renderPartial('carousel', {
        supabaseView
    });

    //////////////////////////////

    let supabaseList;
    try {
        const {
            data,
            error
        } = await supabase
            .from(__TablaList)
            .select('*')
        if (error) throw error;
        supabaseList = data;
    } catch (err) {
        console.error('Error al cargar datos iniciales desde Supabase:', err);
        return {
            success: false,
            error: err.message
        };
    }

    if (supabaseList && supabaseList.length > 0) {
        supabaseList.forEach((item) => {
            if (item.imageURL) {
                item.imageURL.forEach((img_name, index) => {
                    item.imageURL[index] = __imgCatalogDirectory + img_name
                })
            } else {
                item.imageURL = [__imgDirectory + 'default.png']
            }
        })
    }

    const list = await renderPartial('list', {
        supabaseList
    });

    res.render('index', {
        list,
        carousel
    })
})

app.use('/', home);

app.listen(port, () => {
    console.log("Servidor escuchando en http://localhost:" + port);
});