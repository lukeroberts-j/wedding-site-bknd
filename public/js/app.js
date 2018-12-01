const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

const guestListPath = 'public/data/guest-list.json';


// CORS **TODO** --------------------------------
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });



// GET GUESTLIST ---------------------------------
app.get('/guest-list/', function (req, res) {

  ReadGuestList()
    .then((guests) => {
      console.log("Getting Guest List");
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(guests));

    })
    .catch((e) => {
      console.error(e);
      return res.sendStatus(500).json({
        error: 'File Read Error'
      })
    })
})


// POST GUESTLIST ---------------------------------
app.post('/guest-list/', function (req, res) {

  if (!req.body) {
    return res.sendStatus(400).json({
      error: 'Request Error'
    })
  }

  UpdateGuestResponse(req.body)


  return res.sendStatus(200);
})


// FS --------------------------------------------
function ReadGuestList() {
  console.log("Reading Guest List");
  return new Promise((resolve, reject) => {
    fs.readFile(guestListPath, (err, data) => {
      if (err) {
        reject(err);
      }
      let guests = JSON.parse(data);
      resolve(guests);
    });
  });
}


function WriteGuestList(data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(guestListPath, data, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    })
  });
}


// UTIL ------------------------------------------
function GetGuestIndex(param, value, list) {
  for (let i = 0; i < list.length; i++) {
    let guest = list[i];
    if (guest.guestInfo[param] && guest.guestInfo[param] == value) {
      return i;
    }
  }
  return null;
}

//TODO: Update this.
function UpdateGuestResponse(data) {
  return ReadGuestList()
    .then((guestList) => {
      console.log(data);

      if (!data || !data.id) {
        console.error("Incorrect Data Format");
      }

      let guestIndex = GetGuestIndex("id", data.id, guestList.guests);

      if (guestIndex === null || !guestList.guests[guestIndex]) {
        console.error("Guest Not Found: " + data.id);
      }

      guestList.guests[guestIndex].response = data.questions;

      return WriteGuestList(JSON.stringify(guestList, null, 4));

    })
}


// INIT ------------------------------------------
app.listen(port, () => console.log(`app listening on port: ` + port))