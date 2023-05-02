const cheerio = require("cheerio");
const axios = require("axios");
const phantom = require('phantom');
const express = require("express");
const { match } = require("assert");

const app = express();

app.get("/", (req, res) => {
    res.send("To check live score navigate to /livescore");
  });

app.get("/livescore", async (req, res) => {
    const criccbuzz = async function() {
        const url = 'https://www.cricbuzz.com/'
        let matchInfo = { 'battingScore': '', 'venue': '', 'matchName': '', 'recent': '', 'laskWkt': '', 'commentary': '', 'toss': '', 'bowler': '', 'crr': ''};
        let res = await axios.get(url);
        let $ = await cheerio.load(res.data);
        let txt = $("nav.cb-mat-mnu").children();
        const match_url = txt[1].attribs.href.replace('/', 'https://www.cricbuzz.com/')
        console.log(match_url)

        const instance = await phantom.create(['--ignore-ssl-errors=yes', '--load-images=no']);
        const page = await instance.createPage();
        await page.open(match_url)

        page.evaluate(function() {
        return document.querySelector("#matchCenter > div.cb-col.cb-col-67.cb-nws-lft-col.cb-comm-pg > div.ng-scope > div.cb-col.cb-col-100.cb-mini-col.cb-bg-white.cb-min-lv.ng-scope > div.cb-col-100.cb-col.cb-col-scores").textContent;
        }).then(function(battingScore) {
        matchInfo.battingScore += battingScore
        console.log(matchInfo.battingScore.replace(')', ') '));
        });
        page.evaluate(function() {
        return document.querySelector("#matchCenter > div.cb-nav-main.cb-col-100.cb-col.cb-bg-white > div.cb-nav-subhdr.cb-font-12").textContent;
        }).then(function(venue) {
        matchInfo.venue += venue
        console.log(matchInfo.venue);
        });

        page.evaluate(function() {
        return document.querySelector("#matchCenter > div.cb-nav-main.cb-col-100.cb-col.cb-bg-white > div.cb-billing-plans-text.cb-team-lft-item > h1").textContent;
        }).then(function(name) {
        matchInfo.matchName += name
        console.log(matchInfo.matchName);
        });

        page.evaluate(function() {
        return document.querySelector("#matchCenter > div.cb-col.cb-col-67.cb-nws-lft-col.cb-comm-pg > div.ng-scope > div.cb-col.cb-col-100.cb-mini-col.cb-bg-white.cb-min-lv.ng-scope > div.cb-col.cb-col-100.cb-comm-rcnt-wrap > div > div > span:nth-child(2)").textContent;
        }).then(function(recent) {
        matchInfo.recent += recent
        console.log(matchInfo.recent)
        });

        page.evaluate(function() {
        return document.querySelector("#matchCenter > div.cb-col.cb-col-67.cb-nws-lft-col.cb-comm-pg > div.ng-scope > div.cb-col.cb-col-100.cb-mini-col.cb-bg-white.cb-min-lv.ng-scope > div.cb-col.cb-col-33.cb-key-st-lst > div > div:nth-child(3)").textContent;
        }).then(function(lastWkt) {
        matchInfo.laskWkt += lastWkt
        console.log(matchInfo.laskWkt)
        });

        page.evaluate(function() {
        return document.querySelector("#matchCenter > div.cb-col.cb-col-67.cb-nws-lft-col.cb-comm-pg > div:nth-child(8) > div:nth-child(2) > div > p").textContent;
        }).then(function(commentary) {
        matchInfo.commentary += commentary
        console.log(matchInfo.commentary)
        });

        page.evaluate(function() {
        return document.querySelector("#matchCenter > div.cb-col.cb-col-67.cb-nws-lft-col.cb-comm-pg > div.ng-scope > div.cb-col.cb-col-100.cb-mini-col.cb-bg-white.cb-min-lv.ng-scope > div.cb-col.cb-col-33.cb-key-st-lst > div > div:nth-child(6)").textContent;
        }).then(function(toss) {
        matchInfo.toss += toss
        console.log(matchInfo.toss)
        });

        page.evaluate(function() {
        return document.querySelector('#matchCenter > div.cb-col.cb-col-67.cb-nws-lft-col.cb-comm-pg > div.ng-scope > div.cb-col.cb-col-100.cb-mini-col.cb-bg-white.cb-min-lv.ng-scope > div.cb-col-67.cb-col > div:nth-child(2) > div:nth-child(2) > div.cb-col.cb-col-50 > a').textContent;
        }).then(function(bowler) {
        matchInfo.bowler += bowler
        console.log(matchInfo.bowler);
        })

        const rawTitle = await page.property('title');
        let title = rawTitle.split(' ');
        title.splice(-6)
        console.log(title.join(' '));

        let rawCRR = matchInfo.battingScore.split(')');
        let crr = rawCRR[rawCRR.length - 1]
        matchInfo.crr += crr
        console.log(matchInfo.crr)
        await instance.exit();
        return matchInfo;
}
    const json = await criccbuzz();
    res.send(json)
});

app.listen(5000, () => {
    console.log("Running on port 5000.");
  });

