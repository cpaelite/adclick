#!/usr/bin/env python
# encoding=utf8

import xlrd
import MySQLdb
import re
import sys
import argparse


parser = argparse.ArgumentParser()
parser.add_argument("--host", default="localhost", help="database host")
parser.add_argument("--port", default=3306, help="database port")
parser.add_argument("--user", default="root", help="database user")
parser.add_argument("--passwd", default="", help="database password")
parser.add_argument("--db", default="AdClickTool", help="database")
args = parser.parse_args()

workbook = xlrd.open_workbook(filename="trafficsources.xlsx")
sheet = workbook.sheet_by_index(0)

rows = []

for n in xrange(1, sheet.nrows):
    name = sheet.cell(n, 0).value
    # print name, type(name)
    postbackURL = sheet.cell(n, 1).value
    externalID = sheet.cell(n, 2).value
    cost = sheet.cell(n, 4).value
    tokens = []

    for token_index in xrange(6, 6+20, 2):
        token_value = sheet.cell(n, token_index).value
        if len(token_value) != 0:
            tokens.append(token_value)
    
    rows.append((name, postbackURL, externalID, cost, tokens))



def stripall(s):
    count = len(s)

    for idx, c in enumerate(s):
        c = s[idx]
        if c >= 'a' and c <= 'z' or c >= 'A' and c <= 'Z':
            first = idx
            break

    for idx in xrange(count):
        rev_index = count - idx - 1
        c = s[rev_index]
        if c >= 'a' and c <= 'z' or c >= 'A' and c <= 'Z':
            last = rev_index
            break

    return s[first:last+1]

# type TrafficSourceParams struct {
# 	Parameter   string
# 	Placeholder string
# 	Name        string
# 	Track       int
# }
def tojson(param):
    param = param.strip()
    if len(param)==0:
        return "{}"

    try:
        stripped = stripall(param)
        return """{"Parameter":"%s","Placeholder":"%s","Name":"%s"}"""%(stripped, param, stripped)
    except AttributeError as ae:
        print ae
        print >>sys.stderr, ">>>", param
        raise ae



def tokensTojson(tokens):
    return "["+",".join([tojson(p) for p in tokens]) + "]"

# sync to db
insert_count = 0
update_count = 0

print "connecting database..."
conn = MySQLdb.connect(host=args.host, user=args.user, passwd=args.passwd, db=args.db)
print "database connected"

cur = conn.cursor()

def id_by_name(name):
    cur.execute("SELECT id FROM TemplateTrafficSource WHERE name=%s", (name,))
    rows = cur.fetchall()
    if len(rows) > 0:
        return rows[0][0]
    return 0

for name, postbackURL, externalID, cost, tokens in rows:
    id = id_by_name(name)
    externalIDJson = tojson(externalID)
    costJson = tojson(cost)
    tokensJson = tokensTojson(tokens)

    if id == 0:
    # print '.'*80
    # print externalIDJson
    # print '.'*80
    # print costJson
    # print '.'*80
    # print  tokensJson
    # print '='*80
        cur.execute("INSERT INTO TemplateTrafficSource (name, postbackUrl, externalId, cost, params)"
        "VALUES (%s,%s,%s,%s,%s)", (name, postbackURL, externalIDJson, costJson, tokensJson))
        conn.commit()
        insert_count += 1
    else:
        cur.execute("UPDATE TemplateTrafficSource SET name=%s, postbackUrl=%s, externalId=%s, cost=%s, params=%s WHERE id=%s",
            (name, postbackURL, externalIDJson, costJson, tokensJson, id))
        conn.commit()
        update_count += 1

print insert_count, "rows inserted"
print update_count, "rows updated"