#!/usr/bin/python
# encoding=utf8

"""
模拟traffic source请求
"""

import argparse
import logging
import requests
import base64

# http://chenxing.mymac.com:52500/campaign.1.hash

# 参数解析
parser = argparse.ArgumentParser()
parser.add_argument("--loglevel", default="DEBUG", help="ERROR,WARN,INFO,DEBUG")
parser.add_argument("--campaign", default="campaign.1.hash", help="the campaign you want to test")
parser.add_argument("--host", default="chenxing.mymac.com", help="service host")
parser.add_argument("--port", default=52500, type=int, help="service port")
parser.add_argument("--count", default=1, type=int, help="how many requests to send to the campaign")
parser.add_argument("--phost", default="chenxing.mymac.com", help="postback host")
parser.add_argument("--pport", default=55500, type=int, help="postback port")

args = parser.parse_args()
logging.basicConfig(level=args.loglevel)

campaign_url = "http://%s:%s/%s"%(args.host, args.port, args.campaign)
print "campaign_url:", campaign_url
click_url = "http://%s:%s/click"%(args.host, args.port)
postback_url_template = "http://%s:%s/postback?cid=%s&payout=%s&txid=%s"%(
    args.phost, args.pport, "%s", "%s", "%s"
)

def get_postback_url(cid, payout, txid):
    return postback_url_template % (cid, payout, txid)


def parse_tstep(decoded):
    """
    parse_tstep 解析tstep里面的内容
    :param decoded: reqId=ba8bf5e4debe131f69bfbd9e0ef91e7a&step=lpofferreq
    :return: {'reqId': 'ba8bf5e4debe131f69bfbd9e0ef91e7a', 'step': 'lpofferreq'}
    """
    m={}
    for kv in decoded.split("&"):
        k, v = kv.split("=")
        m[k] = v
    return m


for i in xrange(args.count):
    # campaign模拟
    jar = requests.cookies.RequestsCookieJar()
    req = requests.get(campaign_url, cookies=jar, allow_redirects=False)
    print '*'*40, "%dth"%i, '*'*40
    print "status_code:", req.status_code
    print "headers:", req.headers
    print "encoding:", req.encoding
    print "cookies:", req.cookies
    tstep = req.cookies.get('tstep')
    decoded = base64.decodestring(tstep)
    kv = parse_tstep(decoded)
    print "decoded:", decoded, kv
    print "jar:", jar
    # print "text:", req.text
    if req.status_code == 200:
        print "text:"
        print req.text


    # click 模拟
    # 如果直接走到offer，就没有click这一步了
    print '-'*80
    click = requests.get(click_url, cookies=req.cookies, allow_redirects=False)
    print "status_code:", click.status_code
    print "headers:", click.headers
    print "encoding:", click.encoding
    print "cookies:", click.cookies
    # tstep = click.cookies.get('tstep')
    # decoded = base64.decodestring(tstep)
    # print "decoded:", decoded
    if req.status_code == 200:
        print "text:"
        print req.text
    print '*' * 80

    # postback 模拟1
    postback_url = get_postback_url(kv["reqId"], 0.01, "this-is-transaction-id")
    postback = requests.get(postback_url, allow_redirects=False)
    print "status_code:", postback.status_code
    print "headers:", postback.headers
    print "encoding:", postback.encoding
    print "cookies:", postback.cookies
    print req.text
    print '*' * 80

    # postback 模拟2
    postback_url = get_postback_url(kv["reqId"], 0.01, "this-is-transaction-id")
    postback = requests.get(postback_url, allow_redirects=False)
    print "status_code:", postback.status_code
    print "headers:", postback.headers
    print "encoding:", postback.encoding
    print "cookies:", postback.cookies
    print req.text
    print '*' * 80