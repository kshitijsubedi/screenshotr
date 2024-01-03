import axios from "axios";
import bodyParser from "body-parser";
import express from "express";
import captureWebsite from "capture-website";
import "dotenv/config";

const app = express();
app.use(bodyParser.json());

// Declare a route
app.get("/", async function handler(request, reply) {
  reply.json({ hello: "world" });
});

app.post("/screenshot", async function handler(req, res) {
  const { url } = req.body;
  if (!url) return res.send("No url provided");

  const form = new FormData();
  form.set("key", process.env.IMG_API);
  try {
    console.log("Capturing: ", url);
    const screenshot = await captureWebsite.base64(url, {
      delay: 5,
      launchOptions: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: "new",
      },
    });
    form.append("image", screenshot);
    const { data } = await axios.post(process.env.IMG_URL, form);
    res.send(data.data);
  } catch (e) {
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
