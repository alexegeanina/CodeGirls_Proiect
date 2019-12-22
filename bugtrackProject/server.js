const express = require('express')
const app = express() // trimmite inapoi la server hello world si va face un requeesc de tip get
const fs = require('fs')
//servesc fiserele din directorul frontend
app.use('/js/', express.static('js'))

// create db.json from db.sample.json
const dbConfig = require('./config/db.json')
const mysql = require('mysql');
const db = mysql.createConnection(dbConfig);

db.connect();

// a luat de aici https://expressjs.com/en/4x/api.html#req.body
//utilizand  codul de mai jos(2 linii) nu mai amm undefined in consola
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.post('/login-submit', function (request, response) {
  const formData = request.body;
  console.log(formData);
  db.query('SELECT * FROM Users WHERE email = ?', [formData.email], function (error, results) {
    if (error) {
      response.status(500).send('Error in query')
      return
    }

    console.log(results, results.length)
    response.json({ok: true})
  })
})

app.post('/register-submit', function (request, response) {
  const formData = request.body;
  console.log(formData);
  // INSERT INTO Users SET email = ?, firstname = ?
  db.query('INSERT INTO Users(first_name,last_name,email) VALUES (?, ?, ?)', [formData.firstname, formData.lastname, formData.email], function (error, results) {
    if (error) {
      response.status(500).send('Error in query')
      return
    }

    console.log(results, results.length)
    response.json({ok: true})
  })
})

app.get('*', function (request, response, next) {
  if (/\.js$/.test(request.url)) {
    return next()
  }

  var fileContent = fs.readFileSync('frontend/index.html')
  //sa ii returnez continutul in response
  response.type('text/html').send(fileContent)
})

app.listen(3000) //portul
//salveaza codul ctr+s
//pentru a rula efectuam comanda: node server.js , apoi mergem pe windows -> share copii ip-ul
//dupa deschid o noua pagina si scriu http://ip-ul copiat:3000 (3000 e portul din cod)
