import fs from "fs";
import path from "path";
import redis from "../lib/redis.js";

const scriptPath = path.join(
  process.cwd(),
  "/scripts/slidingWindowLog.lua"
);

const SLIDING_WINDOW_SCRIPT =
  fs.readFileSync(scriptPath, "utf8");

const LIMIT = 5;
const WINDOW = 10000; // 10 sec in ms

export async function checkRateLimit(userId) {
  const key = `activity:${userId}`;
  const now = Date.now();

  const result = await redis.eval(
    SLIDING_WINDOW_SCRIPT,
    1,
    key,
    LIMIT,
    WINDOW,
    now
  );

  const [allowed, actionsInLast10Sec] = result;

  console.log(`Sliding window log for user ${userId}: allowed=${allowed}, actionsInLast10Sec=${actionsInLast10Sec}`
  );
  return {
    allowed: allowed === 1,
    actionsInLast10Sec: actionsInLast10Sec
  };
}