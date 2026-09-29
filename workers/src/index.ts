import { createClient } from "redis";
const client = createClient();

async function processSubmission(submission: string) {
  const { problemId, code, language } = JSON.parse(submission);

  console.log("Problem submission for problemId: ", problemId);
  console.log(`Code: ${code}`);
  console.log(`Language: ${language}`);

  const job = JSON.parse(submission);
  const jobKey = `job:${job.jobId}`;

  await client.hSet(jobKey, {
    status: "processing",
    startedAt: new Date().toISOString(),
  });

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await client.hSet(jobKey, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    await client.hSet(jobKey, {
      status: "failed",
      failedAt: new Date().toISOString(),
    });
  }

  console.log("Finished processing submission for problemId: ", problemId);
}

async function startWorker() {
  try {
    await client.connect();
    console.log("Woker connected to Redis !");

    while (true) {
      try {
        const submission = await client.brPop("problems", 0);

        await processSubmission(submission.element);
      } catch (error) {
        console.error("Error processing submission: ", error);
      }
    }
  } catch (error) {
    console.error("Failed to connect to Redis !");
  }
}

startWorker();
