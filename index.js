const cheerio = require("cheerio");
const axios = require("axios");
const phantom = require('phantom');

// creating a json to store all the necessary values
let matchInfo = { 'battingScore': '', 'venue': '', 'matchName': '', 'recent': '', 'laskWkt': '', 'commentary': '', 'toss': '', 'bowler': '', 'crr': ''};

const cricbuzz = async function() {
    // initialization
    const url = 'https://www.cricbuzz.com/'
    let res = await axios.get(url);
    let $ = await cheerio.load(res.data);
    // mapping to the recent match
    let txt = $("nav.cb-mat-mnu").children();
    // extracting recent match url
    const match_url = txt[1].attribs.href.replace('/', 'https://www.cricbuzz.com/')
    console.log(match_url)

    // starting phantom
    const instance = await phantom.create(['--ignore-ssl-errors=yes', '--load-images=no']);
    const page = await instance.createPage();
    await page.open(match_url)

    // using phantom's evaluate function to get all the required values
    page.evaluate(function() {
    return document.querySelector("#matchCenter > div.cb-col.cb-col-67.cb-nws-lft-col.cb-comm-pg > div.ng-scope > div.cb-col.cb-col-100.cb-mini-col.cb-bg-white.cb-min-lv.ng-scope > div.cb-col-100.cb-col.cb-col-scores").textContent;
    }).then(function(battingScore) {
    matchInfo.battingScore += battingScore.replace(')', ') ')
    });
    page.evaluate(function() {
    return document.querySelector("#matchCenter > div.cb-nav-main.cb-col-100.cb-col.cb-bg-white > div.cb-nav-subhdr.cb-font-12").textContent;
    }).then(function(venue) {
    matchInfo.venue += venue
    });

    page.evaluate(function() {
    return document.querySelector("#matchCenter > div.cb-nav-main.cb-col-100.cb-col.cb-bg-white > div.cb-billing-plans-text.cb-team-lft-item > h1").textContent;
    }).then(function(name) {
    matchInfo.matchName += name
    });

    page.evaluate(function() {
    return document.querySelector("#matchCenter > div.cb-col.cb-col-67.cb-nws-lft-col.cb-comm-pg > div.ng-scope > div.cb-col.cb-col-100.cb-mini-col.cb-bg-white.cb-min-lv.ng-scope > div.cb-col.cb-col-100.cb-comm-rcnt-wrap > div > div > span:nth-child(2)").textContent;
    }).then(function(recent) {
    matchInfo.recent += recent
    });

    page.evaluate(function() {
    return document.querySelector("#matchCenter > div.cb-col.cb-col-67.cb-nws-lft-col.cb-comm-pg > div.ng-scope > div.cb-col.cb-col-100.cb-mini-col.cb-bg-white.cb-min-lv.ng-scope > div.cb-col.cb-col-33.cb-key-st-lst > div > div:nth-child(3)").textContent;
    }).then(function(lastWkt) {
    matchInfo.laskWkt += lastWkt
    });

    page.evaluate(function() {
    return document.querySelector("#matchCenter > div.cb-col.cb-col-67.cb-nws-lft-col.cb-comm-pg > div:nth-child(8) > div:nth-child(2) > div > p").textContent;
    }).then(function(commentary) {
    matchInfo.commentary += commentary
    });

    page.evaluate(function() {
    return document.querySelector("#matchCenter > div.cb-col.cb-col-67.cb-nws-lft-col.cb-comm-pg > div.ng-scope > div.cb-col.cb-col-100.cb-mini-col.cb-bg-white.cb-min-lv.ng-scope > div.cb-col.cb-col-33.cb-key-st-lst > div > div:nth-child(6)").textContent;
    }).then(function(toss) {
    matchInfo.toss += toss
    });

    page.evaluate(function() {
    return document.querySelector('#matchCenter > div.cb-col.cb-col-67.cb-nws-lft-col.cb-comm-pg > div.ng-scope > div.cb-col.cb-col-100.cb-mini-col.cb-bg-white.cb-min-lv.ng-scope > div.cb-col-67.cb-col > div:nth-child(2) > div:nth-child(2) > div.cb-col.cb-col-50 > a').textContent;
    }).then(function(bowler) {
    matchInfo.bowler += bowler
    })

    const rawTitle = await page.property('title');
    let title = rawTitle.split(' ');
    title.splice(-6)

    let rawCRR = matchInfo.battingScore.split(')');
    let crr = rawCRR[rawCRR.length - 1]
    matchInfo.crr += crr
    // logging the json, you can change this value according to your convenience
    console.log(matchInfo)
    
    await instance.exit();

}

cricbuzz();
