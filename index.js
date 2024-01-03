import axios from "axios";
import Fastify from "fastify";
import captureWebsite from "capture-website";
import "dotenv/config";

const fastify = Fastify({
  logger: true,
});
// Declare a route
fastify.get("/", async function handler(request, reply) {
  return { hello: "world" };
});

fastify.post("/screenshot", async function handler(request, reply) {
  const form = new FormData();
  form.set("key", process.env.IMG_API);
  const { url } = request.body;
  try {
    const screenshot = await captureWebsite.base64(url, {
      delay: 5,
    });
    form.append("image", screenshot);
    const { data } = await axios.post(process.env.IMG_URL, form);
    return data.data.url;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const error = e;
      return error.response?.data;
    } else reply.code(500);
  }
});

// Run the server!
try {
  await fastify.listen({ port: process.env.PORT || 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
