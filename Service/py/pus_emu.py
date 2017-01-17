#!/usr/bin/python
# encoding=utf8

import redis
import time

cli = redis.StrictRedis()
pubsub = cli.pubsub()
# pubsub.subscribe("channel_campaign_changed_users")
# # msg = pubsub.get_message()
# # print msg
# for item in pubsub.listen():
#     print item

user = 1
while True:
    cli.publish("channel_campaign_changed_users", user)
    user = (user + 1) % 100000
    time.sleep(0.1)
