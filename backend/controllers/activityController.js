import ActivityLog from "../models/ActivityLog.js"
import { checkRateLimit } from "../utils/slidingWindowLog.js"

export const getStats = async (req, res) => {
    try {
        
        const totalActions = await ActivityLog.countDocuments()

        const mostCommonActionResult = await ActivityLog.aggregate([
            { $group: { _id: "$action", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
        ])
        const mostCommonAction = mostCommonActionResult[0]
            ? { action: mostCommonActionResult[0]._id, count: mostCommonActionResult[0].count }
            : null

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

        const actionsPerMinuteResult = await ActivityLog.aggregate([
            { $match: { createdAt: { $gte: tenMinutesAgo } } },
            {
                $group: {
                    _id: {
                        $dateTrunc: { date: "$createdAt", unit: "minute" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ])
        const actionsPerMinute = actionsPerMinuteResult.map((entry) => ({
            minute: entry._id,
            count: entry.count,
        }))

        const mostActiveUserResult = await ActivityLog.aggregate([
            { $group: { _id: "$userId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    userId: "$_id",
                    name: "$user.name",
                    email: "$user.email",
                    count: 1,
                    _id: 0,
                },
            },
        ])
        const mostActiveUser = mostActiveUserResult[0] || null

        res.status(200).json({
            totalActions,
            mostCommonAction,
            actionsPerMinute,
            mostActiveUser,
        })
    } catch (err) {
        console.error("Get stats error:", err)
        res.status(500).json({ message: "Server error" })
    }
}



export const logActivity = async (req, res) => {
    try {
        const userId = req.user._id
        const { action, meta } = req.body

        if (!action) {
            return res.status(400).json({ message: "Action is required" })
        }

        const validActions = ["login", "logout", "view", "click", "custom"]
        if (!validActions.includes(action)) {
            return res.status(400).json({ message: "Invalid action type" })
        }

        const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress

        // ---- Token bucket rate limit check ----
        const { allowed, actionsInLast10Sec } = await checkRateLimit(userId.toString())

        if (!allowed) {
            return res.status(429).json({
                success: false,
                message: "Rate limit exceeded: max 5 actions per 10 seconds",
                serverTime: new Date().toISOString(),
                actionsInLast10Sec: actionsInLast10Sec, // bucket empty = at capacity
            })
        }

        await ActivityLog.create({
            userId,
            action,
            meta: meta || {},
            ipAddress,
        })

        res.status(201).json({
            success: true,
            serverTime: new Date().toISOString(),
            actionsInLast10Sec: actionsInLast10Sec, // remaining actions in the bucket
        })
    } catch (err) {
        console.error("Log activity error:", err)
        res.status(500).json({ message: "Server error" })
    }
}


export const analytics = async (req, res) => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const result = await ActivityLog.aggregate([
      {
        $facet: {
          highFrequency: [
            { $match: { createdAt: { $gte: oneMinuteAgo } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } },
            { $match: { count: { $gt: 20 } } }
          ],


          multipleIps: [
            { $match: { createdAt: { $gte: fiveMinutesAgo } } },
            {
              $group: {
                _id: '$userId',
                ipSet: { $addToSet: '$ipAddress' }
              }
            },
            {
              $project: {
                ipCount: { $size: '$ipSet' }
              }
            },
            { $match: { ipCount: { $gt: 2 } } }
          ]
        }
      }
    ]);

    const { highFrequency, multipleIps } = result[0];

    const flagged = {};

    highFrequency.forEach(u => {
      flagged[u._id] = {
        userId: u._id,
        reason: 'High frequency',
        count: u.count
      };
    });

    multipleIps.forEach(u => {
      if (flagged[u._id]) {
        // user triggered both conditions
        flagged[u._id].reason = 'High frequency / Multiple IPs';
        flagged[u._id].count = Math.max(flagged[u._id].count, u.ipCount);
      } else {
        flagged[u._id] = {
          userId: u._id,
          reason: 'Multiple IPs',
          count: u.ipCount
        };
      }
    });

    res.json(Object.values(flagged));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch suspicious activity' });
  }
}

export const replayCheck = async (req, res) => {
  try {
    const { action, clientTime } = req.body;
    const userId = req.user.id; 

    if (!action || !clientTime) {
      return res.status(400).json({
        success: false,
        message: 'action and clientTime are required'
      });
    }

    const serverTime = new Date();
    const clientTimeDate = new Date(clientTime);

    if (isNaN(clientTimeDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'clientTime must be a valid ISO date'
      });
    }

    const timeDiffMs = Math.abs(serverTime.getTime() - clientTimeDate.getTime());
    if (timeDiffMs > 30 * 1000) {
      return res.status(400).json({
        allowed: false,
        reason: 'Client time drift exceeds 30 seconds',
        serverTime: serverTime.toISOString()
      });
    }

    const threeSecondsAgo = new Date(serverTime.getTime() - 3 * 1000);

    const recentDuplicate = await ActivityLog.findOne({
      userId,
      action,
      createdAt: { $gte: threeSecondsAgo }
    }).sort({ createdAt: -1 });

    if (recentDuplicate) {
      return res.status(409).json({
        allowed: false,
        reason: 'Duplicate action within 3 seconds (replay detected)',
        serverTime: serverTime.toISOString()
      });
    }
    await ActivityLog.create({
      userId,
      action,
      meta: { source: 'replay-check' },
      ipAddress: req.ip,
      createdAt: serverTime
    });

    res.json({
      allowed: true,
      serverTime: serverTime.toISOString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Replay check failed' });
  }
};