const express = require('express')
const app = express() // trimmite inapoi la server hello world si va face un requeesc de tip get
const fs = require('fs')
//servesc fiserele din directorul frontend
app.use('/js/', express.static('js'))
app.use('/css/', express.static('css'))

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
    let loginSuccess = false
    let userId = null

    if (results.length) {
      const user = results[0];

      if (user.password === formData.password) {
         userId = user.id_user
        loginSuccess = true;
      }
    }

    response.json({loginSuccess: loginSuccess, userId: userId})

  })
})

app.post('/register-submit', function (request, response) {
  const formData = request.body;
  console.log(formData);
  db.query('INSERT INTO Users(first_name,last_name,email,password) VALUES (?, ?, ?, ?)', [formData.firstname, formData.lastname, formData.email, formData.password], function (error, results) {
    if (error) {
      response.status(500).send('Error in query')
      return
    }

    console.log(results, results.length)
    response.json({ok: true})
  })
})

app.post('/createproject-submit', function (request, response) {
  const formData = request.body;
  console.log(formData);
  db.query('INSERT INTO Projects(name_project, repository_url) VALUES (?,?)', [formData.projectname, formData.repourl], function (error, results) {
    if (error) {
      response.status(500).send('Error in query')
      return
    }

    console.log(results, results.length)
    response.json({ok: true})
  })
})

app.get('/myprojects/:id', function (request, response) {

  console.log(request);
  db.query('SELECT up.project_id, p.name_project FROM Users_projects up, Projects p WHERE up.user_id = ? and p.project_id = up.project_id;', [request.params.id], function (error, results) {
    if (error) {
      response.status(500).send('Error in query')
      return
    }

    response.json(results)

  })
})

app.get('/otherprojects/:id', function (request, response) {

  console.log(request);
  db.query('SELECT p.project_id, p.name_project FROM Projects p LEFT JOIN Users_projects up ON up.project_id = p.project_id WHERE (up.user_id is null or up.user_id = ?);', [request.params.id], function (error, results) {
    if (error) { 
      response.status(500).send('Error in query')
      return
    }

    response.json(results)

  })
})

app.post('/joinproject/:id_project', function (request, response) {
  const formData = request.body;
  console.log(formData);
  db.query('INSERT INTO Users_projects(user_id,project_id) VALUES (?,?)', [formData.user_id,request.params.id_project], function (error, results) {
    if (error) {
      response.status(500).send('Error in query')
      return
    }

    console.log(results, results.length)
    response.json({ok: true})
  })
})

app.post('/createticket-submit/:user_id', function (request, response) {
  const formData = request.body;
  console.log(formData);
  db.query('INSERT INTO Tickets(name_ticket, project_id,status, severity, id_user, commit_url) VALUES (?,?,?,?,?,?)', [formData.ticketname, formData.project_id, formData.status, formData.severity, request.params.user_id, formData.commit_url], function (error, results) {
    if (error) {
      response.status(500).send('Error in query')
      return
    }

    console.log(results, results.length)
    response.json({ok: true})
  })
})

app.get('/tickets/:project_id', function (request, response) {

  console.log(request);
  db.query('SELECT id_ticket, name_ticket, status, severity,commit_url FROM Tickets WHERE project_id = ?', [request.params.project_id], function (error, results) {
    if (error) {
      response.status(500).send('Error in query')
      return
    }

    response.json(results)

  })
})

app.get('/ticket-info/:ticket_id', function (request, response) {

  console.log(request);
  db.query('SELECT id_ticket, name_ticket,status, severity, commit_url FROM Tickets WHERE id_ticket = ?', [request.params.ticket_id], function (error, results) {
    if (error) {
      response.status(500).send('Error in query')
      return
    }

    response.json(results[0])

  })
})

app.post('/editticket-submit/:id_ticket', function (request, response) {
  const formData = request.body;
  console.log(formData);
  db.query('UPDATE Tickets SET name_ticket = ?, status = ?, severity = ?, commit_url = ? WHERE id_ticket = ?', [formData.ticketname, formData.status, formData.severity, formData.commit_url, request.params.id_ticket], function (error, results) {
    if (error) {
      response.status(500).send('Error in query')
      return
    }

    console.log(results, results.length)
    response.json({ok: true})
  })
})

app.get('*', function (request, response, next) {
  if (/\.(js|css)$/.test(request.url)) {
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
