module.exports = {
  "mysql": {
    host: 'dev.cmjwzbzhppgn.us-west-1.rds.amazonaws.com',
    user: 'root',
    password: 'R%LKsIJF412',
    database: 'AdClickTool'
  },
  "redis":{
    host:"newbidderredis0001.augmjh.0001.usw1.cache.amazonaws.com",
    port:"6379",
    channel:"channel_campaign_changed_users"
  },
  "jwtTokenSrcret": "&s4ha7$dj8",
  "newbidder":{
    "httpPix":"http://",
    "mainDomain":"newbidder.com",
    "impRouter":"/impression",
    "postBackRouter":"/postback?cid=REPLACE&payout=OPTIONAL&txid=OPTIONAL"
  }
}
