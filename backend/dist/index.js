import express from "express";
import { createClient } from "redis";
const app = express();
app.use(express.json());
// Defaults to local Redis, but allows the app to point at a Redis instance in
// Docker or another environment with REDIS_URL (for example redis://redis:6379).
const client = createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
});
client.on("error", (err) => console.error("Redis client error", err));
app.post("/submit", async (req, res) => {
    const { problemId, code, language } = req.body;
    try {
        await client.lPush("problems", JSON.stringify({ problemId, code, language }));
        res.status(200).send("Submission recieved and stored !");
    }
    catch (error) {
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
    }
    catch (error) {
        console.error("Failed to connect to Redis:", error);
    }
};
startServer();
//# sourceMappingURL=index.js.map