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
  }],
  conditionResult:[{
        "id": "model",
        "display": "Brand and model",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "l2select", "name": "value", "options": []
        }]
    }, {
        "id": "browser",
        "display": "Browser and version",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "l2select", "name": "value", "options": []
        }]
    }, {
        "id": "connection",
        "display": "Connection Type",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "select", "name": "value", "options": []
        }]
    }, {
        "id": "country",
        "display": "Country",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "select", "name": "value", "options": []
        }]
    }, {
        "id": "region",
        "display": "State / Region",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "chips", "name": "value", "options": []
        }]
    }, {
        "id": "city",
        "display": "City",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "chips", "name": "value", "options": []
        }]
    }, {
        "id": "weekday",
        "display": "Day of week",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "checkbox", "name": "weekday", "options": [
                { "value": "0", "display": "Monday" },
                { "value": "1", "display": "Tuesday" },
                { "value": "2", "display": "Wednesday" },
                { "value": "3", "display": "Thursday" },
                { "value": "4", "display": "Friday" },
                { "value": "5", "display": "Saturday" },
                { "value": "6", "display": "Sunday" }
            ]
        }, {
            "type": "select", "label": "Time zone", "name": "tz", "options": [
                { "value": "+05:45", "display": "(UTC+05:45) Kathmandu" },
                { "value": "-03:30", "display": "(UTC-03:30) Newfoundland" },
                { "value": "+8:00", "display": "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi" },
                { "value": "-7:00", "display": "(UTC-07:00) Mountain Time (US & Canada)" },
                { "value": "+7:00", "display": "(UTC+07:00) Bangkok, Hanoi, Jakarta" }
            ]
        }]
    }, {
        "id": "device",
        "display": "Device type",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "select", "name": "value", "options": []
        }]
    }, {
        "id": "iprange",
        "display": "IP and IP ranges",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "textarea", "name": "value",
            "desc": "Enter one IP address or subnet per line in the following format: 20.30.40.50 or 20.30.40.50/24"
        }]
    }, {
        "id": "isp",
        "display": "ISP",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "chips", "name": "value", "options": []
        }]
    }, {
        "id": "language",
        "display": "Language",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "chips", "name": "value", "options": []
        }]
    }, {
        "id": "carrier",
        "display": "Mobile carrier",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "chips", "name": "value", "options": []
        }]
    }, {
        "id": "os",
        "display": "Operating system and version",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "l2select", "name": "value", "options": []
        }]
    }, {
        "id": "referrer",
        "display": "Referrer",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "textarea", "name": "value",
            "desc": ""
        }]
    }, {
        "id": "time",
        "display": "Time of day",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "inputgroup",
            "inputs": [
                { "label": "Between", "name": "starttime", "placeholder": "00:00" },
                { "label": "and", "name": "endtime", "placeholder": "00:00" },
            ]
        }, {
            "type": "select", "label": "Time zone", "name": "tz", "options": [
                { "value": "utc", "display": "UTC" },
                { "value": "-8", "display": "-8 PDT" },
                { "value": "+8", "display": "+8 Shanghai" },
                { "value": "+7", "display": "+7 Soul" },
                { "value": "+9", "display": "+7 Tokyo" }
            ]
        }]
    }, {
        "id": "useragent",
        "display": "User Agent",
        "operands": [{ value: "is", display: "Is" }, { value: "isnt", display: "Isnt" }],
        "fields": [{
            "type": "textarea", "name": "value",
            "desc": ""
        }]
    }]
}
