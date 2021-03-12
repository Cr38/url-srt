// IMPORT
const express = require('express');
const yup = require('yup');
const path = require('path')
const monk = require('monk');
const { nanoid } = require('nanoid');

// DB
const connectionURL = process.env.MONGODB_URI || 'localhost/url-srt';
const db = monk(connectionURL);
const urls = db.get('urls');
urls.createIndex({ slug:1 }, { unique: true });

// APP
const app = express();
app.use(express.json());
app.use(express.static('./public'));

app.get('/', (req, res) => {
    console.log('hello');
    res.json({
        message: "url shortner"
    });
});

// SHOW ALL CREATED URLs
app.get('/dump', (req, res) => {
    // TODO: dump db 
    urls.find({}).then((docs) => {
        res.json(docs);
    });
});

// REDIRECT EXISTING URL
app.get('/:id',  async (req, res) => {
    const { id : slug } = req.params;
    try {
        const url = await urls.findOne({ slug });
        if (url) {
            return res.redirect(url.url);
        }
        return res.status(404);
    } catch (error) {
        return res.status(404);
    }
});


// DATA VALIDATION
const schema = yup.object().shape({
  slug: yup.string().trim().matches(/^[\w\-]+$/i),
  url: yup.string().trim().url().required(),
});

// CREATE SHORT URL
app.post('/url', async (req, res, next) => {
    let { slug, url } = req.body;
    try {
        await schema.validate({ 
            slug,
            url,
        });
        if (!slug) {
            slug = nanoid(2);
        }else{
            const existing = await urls.findOne({ slug });
            if (existing) {
                 throw new Error('Slug in use. 🍔');
            }
        }
        slug = slug.toLowerCase();
        const newUrl = {
            url,
            slug,
        };
        const created = await urls.insert(newUrl);
        const link = `192.168.1.5:1337/${created.slug}`;
        // res.json(created);
        res.send(link + "\n");
    } catch (error) {
       next(error);
    }
});

// ERROR HANDLING
app.use((req, res, next) => {
  res.status(404);
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
  });
});

// SERVE
const port = process.env.PORT || 1337
app.listen(port, () => {
    console.log("listening ...");
});