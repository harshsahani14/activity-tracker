local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])   -- milliseconds
local now = tonumber(ARGV[3])

redis.call("ZREMRANGEBYSCORE", key, 0, now - window)

local count = redis.call("ZCARD", key)


if count >= limit then
    return {0, count}
end

redis.call("ZADD", key, now, tostring(now))

-- auto cleanup
redis.call("PEXPIRE", key, window)

-- updated count after adding request
count = count + 1

return {1, count}