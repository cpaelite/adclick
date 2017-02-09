#!/usr/bin/python
# encoding=utf8

"""
模拟traffic source请求

需求
1. 支持设置比率（impression to campaign, campaign to click, click to postback)
2. 支持设置同时多少个线程（进程）并行请求。
3. 同一个线程的请求，是序列化的。
4. 支持统计信息：类似于ab的输出
5. 支持一些错误的检查
6. 只支持对一个campaign的测试，暂时不支持同时测试多个campaign
7. clickid 从重定向的链接里面获取
8. 记录下来请求的数量，方便查看。
9. 从重定向链接中，分析是lander page还是offer。如果是lander page才需要模拟click
"""

import argparse
import logging
import requests
import base64
import re
from urllib import unquote
from timer import Timer

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
parser.add_argument("--impression", default=False, type=bool, help="send impression request or not")
parser.add_argument("--multi", default="thread", type=str, help="multi thread or multi process")

args = parser.parse_args()
logging.basicConfig(level=args.loglevel)

if args.multi == "thread":
    from multiprocessing.dummy import Pool as ThreadPool
else:
    from multiprocessing import Pool as ThreadPool

campaign_url = "http://%s:%s/%s" % (args.host, args.port, args.campaign)
logging.debug("campaign_url: %s", campaign_url)

impression_url = "http://%s:%s/impression/%s" % (args.host, args.port, args.campaign)
logging.debug("impression_url: %s", impression_url)

click_url = "http://%s:%s/click" % (args.host, args.port)
postback_url_template = "http://%s:%s/postback?cid=%s&payout=%s&txid=%s" % (
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
    m = {}
    for kv in decoded.split("&"):
        k, v = kv.split("=")
        m[k] = v
    return m


def lander_or_offer(url):
    if url.find("lander") != -1:
        return "lander"
    return "offer"


def parse_redirect_url(req):
    """
    parse_redirect_url try to parse redirect url from request
    :param req: http request
    :return: redirect url, None if error
    """
    if req.status_code == 302:
        # 302直接跳转
        return req.headers["location"]

    if req.status_code == 200:
        # meta refresh 或者 double meta refresh
        g = re.search('url=(.*?)"', req.text)
        if g is None:
            logging.error("bad req.text:%s", req.text)
            return

        url = g.group(1)
        if url.startswith('/dmr?dest='):
            # <meta http-equiv="refresh" content="0;url=/dmr?dest=http%3A%2F%2Fdownload.androidapp.baidu.com%2Fpublic%2Fuploads%2Fstore_0%2Fstatic%2Fmobisummer4_gl_bd_apk-com.duapps.cleaner-1220_mobisummer4_gl_bd_apk.apk%3Fcid%3Df5db45f0c0a14ade3d43e26918a6d2c6">
            # double meta refresh
            dest_url_quoted = url[len('/dmr?dest='):]
            dest_url = unquote(dest_url_quoted)
            return dest_url
        else:
            # <meta http-equiv="refresh" content="0;url=http://download.androidapp.baidu.com/public/uploads/store_0/static/mobisummer4_gl_bd_apk-com.duapps.cleaner-1220_mobisummer4_gl_bd_apk.apk?cid=3be7c017f2a83b64929d56b7b2edc21f">
            return g.group(1)

    logging.error("parse_redirect_url failed status_code:%s req.text:%s", req.status_code, req.text)
    return


def parse_clickid(redirect):
    g = re.search("[^a-zA-Z0-9]cid=([a-zA-Z0-9]+)", redirect)
    return g.group(1)


REQ_NO = 0
REQ_SUCCESS = 1
REQ_FAILED = 2


class OneReqStat(object):
    def __init__(self):
        self.Status = REQ_NO
        self.Time = 0.0


class ReqSerialStat(object):
    def __init__(self):
        self.Imp = OneReqStat()
        self.Camp = OneReqStat()
        self.Click = OneReqStat()
        self.Postback = OneReqStat()

    def __repr__(self):
        return "<Imp:%s,%s Camp:%s,%s Click:%s,%s Postback:%s,%s>" % (
            self.Imp.Status,
            self.Imp.Time,

            self.Camp.Status,
            self.Camp.Time,

            self.Click.Status,
            self.Click.Time,

            self.Postback.Status,
            self.Postback.Time,
        )


# OneReqStat = namedtuple('OneReqStat', [
#     'ImpressionCnt', 'ImpressionTime',
#     'CampaignCnt',  'ClickCnt', 'PostbackCnt'], verbose=True)


# run_once 模拟一次从impression 到 campaign 到 click 到 postback请求
def run_once(i):
    stat = ReqSerialStat()

    jar = requests.cookies.RequestsCookieJar()

    logging.debug("%s%s%s", '*' * 40, "%dth" % i, '*' * 40)
    # impression模拟
    if args.impression:
        with Timer() as t:
            impression = requests.get(impression_url, cookies=jar, allow_redirects=False)
        stat.Imp.Time = t.interval

        logging.debug("impression: status_code: %s", impression.status_code)
        logging.debug("impression: headers: %s", impression.headers)
        logging.debug("impression: encoding: %s", impression.encoding)
        logging.debug("impression: cookies: %s", impression.cookies)
        if impression.status_code == 200:
            logging.debug("impression: text: %s", impression.text)
            stat.Imp.Status = REQ_SUCCESS
        else:
            stat.Imp.Status = REQ_FAILED

    logging.debug('-' * 80)

    # campaign模拟
    with Timer() as t:
        req = requests.get(campaign_url, cookies=jar, allow_redirects=False)
    stat.Camp.Time = t.interval

    logging.debug("campaign status_code: %s", req.status_code)
    logging.debug("campaign headers: %s", req.headers)
    logging.debug("campaign encoding: %s", req.encoding)
    logging.debug("campaign cookies: %s", req.cookies)
    tstep = req.cookies.get('tstep')
    decoded = base64.decodestring(tstep)
    kv = parse_tstep(decoded)
    logging.debug("campaign decoded: %s, %s", decoded, kv)
    if req.status_code == 200:
        logging.debug("campaign text: %s", req.text)

    # 三种情况：1. 302直接跳转   2. meta refresh跳转   3. double meta refresh
    redirect_url = parse_redirect_url(req)
    if redirect_url is None:
        # 重定向链接错误，服务器逻辑有问题
        logging.error("campaign request redirect url error")
        stat.Camp.Status = REQ_FAILED
        return
    stat.Camp.Status = REQ_SUCCESS
    logging.debug("redirect url: %s", redirect_url)

    clickid = parse_clickid(redirect_url)
    logging.debug("clickid %s", clickid)

    # click 模拟
    # 如果直接走到offer，就没有click这一步了
    logging.debug('-' * 80)
    if lander_or_offer(redirect_url) == "lander":
        with Timer() as t:
            click = requests.get(click_url, cookies=req.cookies, allow_redirects=False)
        stat.Click.Time = t.interval

        logging.debug("click status_code: %s", click.status_code)
        logging.debug("click headers: %s", click.headers)
        logging.debug("click encoding: %s", click.encoding)
        logging.debug("click cookies: %s", click.cookies)
        if click.status_code == 200:
            logging.debug("click text: %s", click.text)
        lander_redirect_url = parse_redirect_url(click)
        logging.debug("lander_redirect_url:%s", lander_redirect_url)
        if lander_redirect_url is None:
            stat.Click.Status = REQ_FAILED
        else:
            stat.Click.Status = REQ_SUCCESS
        logging.debug('-' * 80)

    # postback 模拟1
    postback_url = get_postback_url(clickid, 0.01, "this-is-transaction-id")
    with Timer() as t:
        postback = requests.get(postback_url, allow_redirects=False)
    stat.Postback.Time = t.interval
    logging.debug("postback.1 status_code: %s", postback.status_code)
    logging.debug("postback.1 headers: %s", postback.headers)
    logging.debug("postback.1 encoding: %s", postback.encoding)
    logging.debug("postback.1 cookies: %s", postback.cookies)
    logging.debug("postback.1 text: %s", postback.text)
    logging.debug('-' * 80)
    if postback.status_code == 200:
        stat.Postback.Status = REQ_SUCCESS
    else:
        stat.Postback.Status = REQ_FAILED

    # # postback 模拟2
    # postback_url = get_postback_url(clickid, 0.01, "this-is-transaction-id")
    # postback = requests.get(postback_url, allow_redirects=False)
    # logging.debug("postback.2 status_code: %s", postback.status_code)
    # logging.debug("postback.2 headers: %s", postback.headers)
    # logging.debug("postback.2 encoding: %s", postback.encoding)
    # logging.debug("postback.2 cookies: %s", postback.cookies)
    # logging.debug("postback.2 text: %s", postback.text)

    return stat


pool = ThreadPool()
results = pool.map(run_once, xrange(args.count))


# imp_success = 0
# imp_failed = 0
# imp_total_time = 0.0
# for s in results:
#     if s.ImpStatus == REQ_SUCCESS:
#         imp_success += 1
#     elif s.ImpStatus == REQ_FAILED:
#         imp_failed += 1
#
#     imp_total_time += s.ImpTime
#
#
# print "imp_success", imp_success, "imp_failed", imp_failed, "imp_total_time", imp_total_time#, "imp_avg_time", imp_total_time/(imp_success+imp_failed)


def output(name, stat_getter):
    success = 0
    failed = 0
    total_time = 0.0
    min_time = 60.0
    max_time = 0.0
    avg_time = 0.0


    for req_serial in results:
        s = stat_getter(req_serial)

        if s.Status == REQ_SUCCESS:
            success += 1
        elif s.Status == REQ_FAILED:
            failed += 1

        if s.Status != REQ_NO:
            total_time += s.Time
            if s.Time > max_time:
                max_time = s.Time
            if s.Time < min_time:
                min_time = s.Time

    total = success + failed
    if total > 0:
        avg_time = total_time / total

    print name, "success:", success, "failed:", failed, "avg time:", avg_time, "max_time:", max_time, "min_time:", min_time

output("impression", lambda serial: serial.Imp)
output("campaign", lambda serial: serial.Camp)
output("click", lambda serial: serial.Click)
output("postback", lambda serial: serial.Postback)


pool.close()
pool.join()
