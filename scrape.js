var request = require('request');
var cheerio = require('cheerio');
var fs      = require('fs');

var parsedResults = [];
var date;
var categoryArr = ['動物','FUN','瘋啥','搜奇','正妹','體育','臉團','娛樂','時尚','生活','社會','國際','財經','地產','政治','論壇'];
var initDone = 0;
var parseCounter = 0;
var pages = 5;
var date = "";

//console.log("code start!!");
initArr();
if(initDone === 1){
	for(var i = 1; i<=pages; i++){
	scrapeFunc(i);
	}
}
//--------------------------functions---------------------
function scrapeFunc(page){
	var web = 'http://www.appledaily.com.tw/realtimenews/section/new/'+page;
	//console.log("for loop "+page);
	request(web, function(err,res,html){
	if(!err && res.statusCode === 200){
		//console.log("request "+page);
		//start to parse
		//console.log('http://www.appledaily.com.tw/realtimenews/section/new/'+page);
		var $ = cheerio.load(html);
		date = $('div.abdominis.rlby.clearmen').children('.dddd').children('time').text();
		$('li.rtddt').each(function(i,element){
			parseCounter++;
			var a = $(this).children();
			var url = "http://www.appledaily.com.tw" + a.attr('href');
			var time = a.children('time').text();
			var category = a.children('h2').text();
			var title = a.children('h1').children().text();
			var video = $(this).hasClass('hsv');
		      // Our parsed meta data object
		      var metadata = {
		        title: title,
		        url: url,
		        time: time,
		        video: video
		      };
		      //sorting
		      var sortId = categoryArr.indexOf(category);
		      if(sortId !== -1){
		      	parsedResults[sortId].news_count+=1;
		      	// Push meta-data into parsedResults array
		      	parsedResults[sortId].news.push(metadata);
		      }
		      else{
		      	console.log("Error: category not exist!!");
		      }
		      
		      // Push meta-data into parsedResults array
		});
		if(parseCounter === 30*pages){
			writeData();
			mostCate();
		}
	}
});

}

	// Log our finished parse results in the terminal
	    //console.log(parsedResults);
function writeData(){
    fs.writeFile('appledaily.json',JSON.stringify(parsedResults),function(err){
     	if(err){
   			console.log('Write file failed!');
    		throw err;
    	}
    	//console.log('Data saved!!');
    });
}

function initArr(){
	for(var i = 0; i<categoryArr.length; i++){
		var obj ={};
		obj.category = categoryArr[i];
		obj.news_count = 0;
		obj.news = [];
		parsedResults.push(obj);
	}
	if(parsedResults.length === categoryArr.length){
		initDone = 1;
	}
}
function mostCate(){
	var mostId = 0;
	var sysDate = new Date();
	var myDate = sysDate.getFullYear() +"/"+(sysDate.getMonth()+1)+
					"/"+sysDate.getDate()+"/"+sysDate.getHours()+
					":"+sysDate.getMinutes();

	for(var i = 0; i<parsedResults.length; i++){
		if(parsedResults[mostId].news_count < parsedResults[i].news_count){
			mostId = i;
		}
	}
	console.log(myDate+" - 新聞數量最多的分類為 ["
		+parsedResults[mostId].category+"] ，共有 "
		+parsedResults[mostId].news_count+" 則新聞");
	// for(var i = 0; i<parsedResults.length; i++){
	// 	console.log(date+"其他新聞分類的數量為 ["
	// 	+parsedResults[i].category+"] ，共有 "
	// 	+parsedResults[i].news_count+" 則新聞");
	// }
}


