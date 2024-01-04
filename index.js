import axios from "axios";
import bodyParser from "body-parser";
import express from "express";
import captureWebsite from "capture-website";
import getMetaData from "metadata-scraper";
import { MongoClient } from "mongodb";
import "dotenv/config";

const app = express();
app.use(bodyParser.json());

let client;

try {
  client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  console.log("Connected successfully to MongoDB server");
} catch (e) {
  console.error(e);
}

// Declare a route
app.get("/", async function handler(request, reply) {
  reply.json({ hello: "world" });
});

app.post("/screenshot", async function handler(req, res) {
  const { slug } = req.body;
  if (!slug) return res.send("No url provided");
  const URL = process.env.TEMPLATE_BASE_URL + slug;

  const form = new FormData();
  form.set("key", process.env.IMG_API);
  try {
    console.log("Capturing: ", URL);
    const screenshot = await captureWebsite.base64(URL, {
      delay: 5,
      scaleFactor: 1,
      launchOptions: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: "new",
      },
    });
    form.append("image", screenshot);
    const { data } = await axios.post(process.env.IMG_URL, form);

    // Update MonogDB
    const db = client.db("emarketing");
    const wcollection = db.collection("webs");
    const ecollection = db.collection("emails");
    const webData = await wcollection.findOne({ slug });

    const emailData = {
      slug,
      name: webData.title,
      address: webData.address,
      email: webData.email,
      website: process.env.TEMPLATE_BASE_URL + slug,
      ss: data.data.url,
    };
    ecollection.updateOne({ slug }, { $set: emailData }, { upsert: true });
    res.json({ ss: data.data.url, slug });
  } catch (e) {
    console.log(e);
    if (axios.isAxiosError(e)) {
      const error = e;
      res.send(error.response?.data);
    } else res.send(e);
  }
});

// Run the server!
app.listen(process.env.PORT || 3000, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${process.env.PORT || 3000}`);
});
