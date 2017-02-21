module.exports = {
  "env":"development",
  "mysql": {
    'development': {
      host: 'localhost',
      user: 'monty',
      password: 'monty',
      database: 'AdClickTool',
      connectionLimit:10
    },
    staging: {
      host: 'dev02.cmjwzbzhppgn.us-west-1.rds.amazonaws.com',
      user: 'root',
      password: 'R%LKsIJF412',
      database: 'AdClickTool',
      connectionLimit:10
    }
  },
  "redis":{
    host:"adclick-jp.082pif.ng.0001.apne1.cache.amazonaws.com",
    port:"6379",
    channel:"channel_campaign_changed_users",
    conditionKey:"conditionKey_new"
  },
  "jwtTokenSrcret": "&s4ha7$dj8",
  "newbidder":{
    "httpPix":"http://",
    "mainDomain":"newbidder.com",
    "impRouter":"/impression",
    "postBackRouter":"/postback",
    "postBackRouterParam":"?cid=REPLACE&payout=OPTIONAL&txid=OPTIONAL"
  },
  domains:[{
    address:"nbtrk.com",
    mainDomain:false, //campaign mian domain
    postBackDomain:true //offer postback default domain
  },{
    address:"nbtrk0.com",
    mainDomain:true,
    postBackDomain:false
  },{
    address:"nbtrk1.com",
    mainDomain:false,
    postBackDomain:false
  }]
}
