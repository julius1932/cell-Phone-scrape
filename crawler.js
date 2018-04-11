var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var mongoS = require("./cellPhoneSave")// including the code to save json to mongo
//var promisez=[];
//var allPromises=[];
var dbPromises=[];
//var allDetails=[];
//var START_URL = "http://www.arstechnica.com";
var START_URL = "https://www.walmart.com/cp/5595429";
var SEARCH_WORD = "";
//var MAX_PAGES_TO_VISIT = 1000;

var pagesVisited = {};
var numPagesVisited = 0;
var numItems=0;
var pagesToVisit = [ "https://www.walmart.com/cp/5595429",
                     "https://www.walmart.com/browse/cell-phones/unlocked-phones/1105910_1073085?cat_id=1105910_1073085&facet=brand:Apple",
                    "https://www.walmart.com/browse/cell-phones/unlocked-phones/samsung/1105910_1073085/YnJhbmQ6U2Ftc3VuZwieie?_refineresult=true",
                     "https://www.walmart.com/browse/cell-phones/unlocked-phones/1105910_1073085?cat_id=1105910_1073085&facet=brand:BLU",
                     "https://www.walmart.com/browse/cell-phones/unlocked-phones/lg/1105910_1073085/YnJhbmQ6TEcie?_refineresult=true",
                     "https://www.walmart.com/browse/cell-phones/unlocked-phones/motorola/1105910_1073085/YnJhbmQ6TW90b3JvbGEie?cat_id=1105910_1073085&facet=brand:Motorola",
                     "https://www.walmart.com/browse/cell-phones/unlocked-phones/motorola/1105910_1073085/YnJhbmQ6TW90b3JvbGEie?cat_id=1105910_1073085&facet=brand%3AMotorola&page=2#searchProductResult"
                   ];
//var links=[];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;
var isLastPage=false;
//pagesToVisit.push(START_URL);
crawl();
function crawl() {
  if(pagesToVisit.length<=0 ) {
    console.log("visited all pages.");
    Promise.all(dbPromises).then(function(values) {
       mongoS.closeConnection(); // closing connection after all data is saved
    });
    return;
  }
  var nextPage = pagesToVisit.shift();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    if(nextPage==null){
      return;
    }
    numPagesVisited++;
    visitPage(nextPage, crawl);
  }
}
function requestPage(url, callback) {
  return new Promise(function(resolve, reject) {
      // Do async job
        request.get(url, function(err, resp, body) {
            if (err) {
                reject(err);
                callback();
            } else {
                resolve(body);
            }
        })
    })
}
function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  // Make the request
  console.log("Visiting page " + url);
  var requestPag = requestPage(url,callback);
  //promisez.push(requestPag);
  requestPag.then(function(body) {
    var $ = cheerio.load(body);
    scrapeCellPhone($,url,callback);
    collectAllLinks($);
    callback();
  }, function(err) {
        console.log(err); 
        callback ();    
    })
  }
function collectAllLinks($) {
    var relativeLinks = $("a[href^='/']");
    //console.log("Found " + relativeLinks.length + "links on page");
    $('a').each(function() {
      var lnk= $(this).attr('href');
      if(lnk==null){
         return;
      }
      lnk =lnk.toLowerCase()
      var arr=lnk.split("/");
      var validi = lnk.includes("cell-phones")|| lnk.includes("apple")||lnk.includes("motorola")||lnk.includes("lg")||lnk.includes("blu")||lnk.includes("samsung");
      validi = validi || lnk.includes("htc")|| lnk.includes("sony")||lnk.includes("huawei")||lnk.includes("nokia");
      validi = validi || lnk.includes("alcatel")|| lnk.includes("zte")||lnk.includes("asus");
      //console.log(lnk);
      if(lnk.startsWith("/")){
         lnk =baseUrl+lnk;
         if (lnk in pagesVisited) {}
             else {
                if ( validi) {
             // console.log("pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp");
             pagesToVisit.push(baseUrl + $(this).attr('href')); 
                  
         }    
      }
         
     /*var indx = links.indexOf(lnk);if (lnk in links){    }else{if(validi && arr.length===4){//  links.push(lnk);}} */
     } 
    });
     
     console.log(numItems +" Items scraped and saved  so far");
     console.log(pagesToVisit.length+" pages to visit  ");
}
function printUrls(){
   //console.log(links.length);
}

function scrapeCellPhone($,url,callback) {
    var model= $(".ProductTitle h1").text();
    var brand  = $("a.prod-BrandName span").text();
    var price = $("span.Price-group").first().attr('title');
    var brnd =brand
    // console.log(brnd)
    if(brnd){
      brnd= brnd.toLowerCase()
      // console.log(brnd)
    }else{
      return;
    }
    var validi = brnd==="apple"||brnd==="motorola" ||brnd==="lg"||brnd==="blu"||brnd==="samsung";
      validi = validi || brnd==="htc"|| brnd==="sony"||brnd==="huawei"||brnd==="nokia";
      validi = validi || brnd==="alcatel"|| brnd==="zte"||brnd==="asus";
    if(brand && model && price && url&&validi){
        var item ={
          url : url,
          brand:brand,
          model:model,
          price :price
        }
       var proms= mongoS.saveData(item);// saving json to mongodb 
       dbPromises.push(proms);
       proms.then(function(body) {
          numItems++; 
           //dbPromises.remove(this) propms  from array
       }, function(err) {
        console.log(err); 
        //dbPromises.remove(this) propms 
        //callback ();    
       })
    }
          
       //allDetails.push(item);
  }
