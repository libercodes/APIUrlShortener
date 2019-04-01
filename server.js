const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const url = require("url");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const ShortURL = require("./models/url");

const app = express();
/* app.use(express.static(path.join(__dirname, "public"))); */
app.use("/public", express.static(process.cwd() + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/api/shorturl/new", (req, res, next) => {
  let initialUrl = req.body.url;
  console.log("Requested is " + initialUrl);
  let regex = /[-a-zA-Z0-9@:%._+~#=]{2,256}.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi;
  if (regex.test(initialUrl)) {
    let urlshort = Math.floor(Math.random() * 1000).toString();

    let data = new ShortURL({
      originalUrl: initialUrl,
      shorterUrl: urlshort
    })
      .save()
      .then(data => {
        console.log("ShorterURL was succesfully created and saved in the DB");
        res.json({ data });
      })
      .catch(err => console.log(err));
  } else {
    return res.json({ error: "Invalid Url" });
  }
});

app.get("/api/shorturl/:shorturl", (req, res, next) => {
  ShortURL.findOne({ shorterUrl: req.params.shorturl })
    .select("originalUrl")
    .exec()
    .then(data => {
      console.log(data);
      console.log("The ORIGINAL URL IS " + data.originalUrl);
      return res.status(301).redirect(data.originalUrl);
    })
    .catch(err => {
      console.log(err);
      res.json({ error: "Short URL not found" });
    });
});

app.get("/", (req, res, next) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => {
    console.log("Succesfully connected to the DB");
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch(err => console.log(err));
