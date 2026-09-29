import express from "express";
import { createClient } from "redis";
import { randomUUID } from "node:crypto";
const app = express();

app.use(express.json());

const client = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
});
client.on("error", (err) => console.error("Redis client error", err));

app.post("/submit", async (req, res) => {
  const { problemId, code, language } = req.body;
  const jobId = randomUUID();
  const jobKey = `job:${jobId}`;

  try {
    // await client.lPush(
    //   "problems",
    //   JSON.stringify({ problemId, code, language }),
    // );
    // res.status(200).send("Submission recieved and stored !");
    //

    await client
      .multi()
      .hSet(jobKey, {
        status: "queued",
        problemId: String(problemId),
        language,
        code,
        createdat: new Date().toISOString(),
      })
      .lPush(
        "problems",
        JSON.stringify({
          jobId,
          problemId,
          code,
          language,
        }),
      )
      .exec();

    res.status(200).json({ jobId, status: "queued" });
  } catch (error) {
    console.error("Error while inserting on redis: ", error);
    res.status(500).send("Error while submission !");
  }
});

const startServer = async () => {
  try {
    await client.connect();
    console.log("Connected to Redis !!!");

    app.listen(3000, () => {
      console.log("backend server listening on port 3000");
    });
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
};

startServer();
