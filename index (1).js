const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require("body-parser");

app.use(bodyParser());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];
let id = 0;
app.post("/api/users", (req, res) => {
  id++;
  users.push({ username: req.body.username, _id: `${id}`, count: 0, log: [] });
  res.json({ username: users[users.length - 1].username, _id: users[users.length - 1]._id });
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  let date;
  if(req.body.date) {
    date = new Date(req.body.date).toDateString();
  } else {
    date = new Date().toDateString();
  }

  let username;
  users.map((item) => {
    if(item._id === req.params._id) {
      username = item.username;
      item.count++;
      item.log.push({ description: req.body.description, duration: Number(req.body.duration), date: date })
    }
  });

  res.json({ username: username, description: req.body.description, duration: Number(req.body.duration), _id: req.params._id, date: date });
});

app.get("/api/users/:_id/logs", (req, res) => {
  users.map((item) => {
    item.logNew = [...item.log];
    if(item._id === req.params._id) {
      if(req.query.from) {
        item.logNew = item.logNew.filter((item) => new Date(item.date).getTime() >= new Date(req.query.from).getTime());
      }
      if(req.query.to) {
        item.logNew = item.logNew.filter((item) => new Date(item.date).getTime() < new Date(req.query.to).getTime());
      }
      if(req.query.limit) {
        item.logNew = item.logNew.slice(0, Number(req.query.limit));
      }
      console.log(item.logNew);
      res.json({ username: item.username, count: item.count, _id: item._id, log: item.logNew });
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
