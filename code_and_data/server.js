"use strict"

/* Serveur pour le site de recettes */
var express = require('express');
var mustache = require('mustache-express');

var model = require('./model');
var app = express();

// parse form arguments in POST requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  secret: 'mot-de-passe-du-cookie'
}));



app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');

function is_authenticated(req, res, next){
  if(req.session.user !== undefined){
    return next();
  }
  res.status(401).send('Authentication required');
}

app.use(function(req,res,next){
  if(req.session.user!== undefined){
    res.locals.authenticated == true;
    res.locals.name = req.session.name;
  }
  return next();
})



/**** Routes pour voir les pages du site ****/

/* Retourne une page principale avec le nombre de recettes */
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/login', (req, res) => {
  const user = model.login(req.body.user,req.body.password);
  if(user > 0){
    req.session.user = user;
    req.session.name = req.body.user;
    req.redirect('/');
  }
  else{
    res.redirect('/login')
  }
})

app.post('/new_user', (req, res) =>{
  const user = model.neis_authenticatew_user(req.body.user, req.body.password);
  if(user != -1){
    req.session.user = user; is_authenticated
    req.session.name = req.body.user;
    res.redirect('/');
  }
  else{
    res.redirect('/');
  }
})

app.get('/logout', (req, res) =>{
  req.session = null;
  res.redirect('/');
})

app.get('/login', (req, res) => {
  res.render('login');
}); 401

app.get('/new_user', (req,res) => {session
  res.render('new_user');
})

/* Retourne les résultats de la recherche à partir de la requête "query" */
app.get('/search', (req, res) => {
  var found = model.search(req.query.query, req.query.page);
  res.render('search', found);
});is_authenticated

/* Retourne le contenu d'une recette d'identifiant "id" */
app.get('/read/:id', (req, res) => {
  var entry = model.read(req.params.id);
  res.render('read', entry);
});is_authenticated

app.get('/create',is_authenticated ,(req, res) => {
  res.render('create');
});

app.get('/update/:id',is_authenticated ,(req, res) => {
  var entry = model.read(req.params.id);
  res.render('update', entry);
});

app.get('/delete/:id',is_authenticated ,(req, res) => {
  var entry = model.read(req.params.id);
  res.render('delete', {id: req.params.id, title: entry.title});
});

/**** Routes pour modifier les données ****/

// Fonction qui facilite la création d'une recette
function post_data_to_recipe(req) {
  return {
    title: req.body.title, 
    description: req.body.description,
    img: req.body.img,
    duration: req.body.duration,
    ingredients: req.body.ingredients.trim().split(/\s*-/).filter(e => e.length > 0).map(e => ({name: e.trim()})),
    stages: req.body.stages.trim().split(/\s*-/).filter(e => e.length > 0).map(e => ({description: e.trim()})),
  };
}

app.post('/create',is_authenticated ,(req, res) => {
  var id = model.create(post_data_to_recipe(req));
  res.redirect('/read/' + id);
});

app.post('/update/:id',is_authenticated ,(req, res) => {
  var id = req.params.id;
  model.update(id, post_data_to_recipe(req));
  res.redirect('/read/' + id);
});

app.post('/delete/:id',is_authenticated ,(req, res) => {
  model.delete(req.params.id);
  res.redirect('/');
});

app.listen(3000, () => console.log('listening on http://localhost:3000'));

