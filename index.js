/*
[ instruction from site 'https://medium.com/@dschnr/using-headless-chrome-as-an-automated-screenshot-tool-4b07dffba79a']
# Install Google Chrome
# https://askubuntu.com/questions/79280/how-to-install-chrome-browser-properly-via-command-line
sudo apt-get install libxss1 libappindicator1 libindicator7
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome*.deb  # Might show "errors", fixed by next line
sudo apt-get install -f

# Install Node Stable (v7)
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs

# Run Chrome as background process
# https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
# --disable-gpu currently required, see link above
google-chrome --headless --hide-scrollbars --remote-debugging-port=9222 --disable-gpu &

# Install script dependencies
npm install chrome-remote-interface minimist

# Take the screenshot
nodejs index.js --url="http://www.eff.org"


[end instruction ]
 
argv passed arguments when calling the script. exsample: node script.js --argument="value" 
for start > google-chrome --headless --hide-scrollbars --remote-debugging-port=9222 --disable-gpu &

 * */
const CDP = require('chrome-remote-interface');
const argv = require('minimist')(process.argv.slice(2));
const file = require('fs');
// CLI Args
const url = argv.url || 'https://www.google.com';
const format = argv.format === 'jpeg' ? 'jpeg' : 'png';
const viewportWidth = argv.viewportWidth || 1440;
const viewportHeight = argv.viewportHeight || 900;
const delay = argv.delay || 0;
const userAgent = argv.userAgent;
const fullPage = argv.full || true;

Date.prototype.timestamp = function() {
	let yyyy = this.getFullYear();
	let mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
	let dd  = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
	let hh = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
	let min = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
	let ss = this.getSeconds() < 10 ? "0" + this.getSeconds() : this.getSeconds();
	//return "".concat(yyyy).concat(mm).concat(dd).concat(hh).concat(min).concat(ss);
	return ss + "-" + min + "-" + hh  + "-" + dd + "-" + mm + "-" + yyyy;
};

function getSiteName() {
	//let arrr = url.split("/").reverse().slice(1);
	let arr = url.replace(/\./g, '_');
	let siteName = arr.match(/\/([^\/]+)\/?$/)[1];
	//let arr = arrr[0].split(".").reverse().slice(1);
	return siteName;
}

function createFileName(){
	let d = new Date();
	let timeNow = d.timestamp();
	let siteName = getSiteName();
	return timeNow + "_" + siteName;
}

const fileName = argv.fileName || createFileName();

// Start the Chrome Debugging Protocol
CDP(async function(client) {
	
	// Extract used DevTools domains.
	const {DOM, Emulation, Network, Page, Runtime, CSS} = client;

	// Enable events on domains we are interested in.
	await Promise.all([Page.enable(), DOM.enable(), Network.enable(), CSS.enable()]);
  
	// If user agent override was specified, pass to Network domain
	if (userAgent) {
		await Network.setUserAgentOverride({userAgent});
	}

	// Set up viewport resolution, etc.
	const deviceMetrics = {
		width: viewportWidth,
		height: viewportHeight,
		deviceScaleFactor: 0,
		mobile: false,
		fitWindow: false,
	};
	
	/* Redefining device screen sizes */
	await Emulation.setDeviceMetricsOverride(deviceMetrics);





//GET / HTTP/1.1
//Host: www.facebook.com
//User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:69.0) Gecko/20100101 Firefox/69.0
//Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
//Accept-Language: ru,en-US;q=0.7,en;q=0.3
//Accept-Encoding: gzip, deflate, br
//Connection: keep-alive
//Cookie: fr=0sQahM19jpU5eFuQw.AWUkfMYqC0prfpF8gVpIGUb8k_s.Bca_Bk.WU.F13.0.0.BdfjS9.AWWCORDI; sb=tSFsXB3YSt9gnpEK17aJOnlV; datr=tSFsXON58RZCgyXgfLLyoDb9; c_user=100016023540378; xs=38%3ALr1UOqeoiNAaIg%3A2%3A1550590404%3A17214%3A15702; wd=1366x333; spin=r.1001176926_b.trunk_t.1568552120_s.1_v.2_; act=1568553103243%2F17; presence=EDvF3EtimeF1568554130EuserFA21B16023540378A2EstateFDutF1568554130549CEchFDp_5f1B16023540378F1CC
//Upgrade-Insecure-Requests: 1
//Pragma: no-cache
//Cache-Control: no-cache






	/* headers */
	await Network.setExtraHTTPHeaders({
		'headers': { 
			'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:69.0) Gecko/20100101 Firefox/69.0',
			'Cookie':  'bb_ssl=1; bb_session=0-7458579-fc0mY0ySewGvbEziSQcX; bb_t=a%3A8%3A%7Bi%3A5187073%3Bi%3A1548969626%3Bi%3A5688463%3Bi%3A1551199338%3Bi%3A5700553%3Bi%3A1552013838%3Bi%3A5689729%3Bi%3A1550343602%3Bi%3A5144182%3Bi%3A1552136437%3Bi%3A5737211%3Bi%3A1559226803%3Bi%3A5737634%3Bi%3A1560266769%3Bi%3A5198752%3Bi%3A1563730636%3B%7D; bb_guid=NIqmjzvqQ69C; __cfduid=d429abc949080f4ebcad812e1af6121431567436981' 
		}
	});
	
	// Navigate to target page
	await Page.navigate({url});
	
	// Wait for page load event to take screenshot
	Page.loadEventFired(async () => {
    // If the `full` CLI option was passed, we need to measure the height of
    
		if (fullPage) {	 
			const {root: {nodeId: documentNodeId}} = await DOM.getDocument();
			const {nodeId: bodyNodeId} = await DOM.querySelector({
				selector: 'body',
				nodeId: documentNodeId,
			});
		  
			/* get content size */
			const layoutMetrics = await Page.getLayoutMetrics();
			deviceMetrics.height = layoutMetrics.contentSize.height;		
			
			/* Redefining device screen sizes */
			await Emulation.setDeviceMetricsOverride(deviceMetrics);
		}
    
		setTimeout(async function() {
		  const screenshot = await Page.captureScreenshot({format});
		
		  file.writeFile('screenshots/' + fileName + '.png', screenshot.data, 'base64', function(err) {
			if (err) {
			  console.error(err);
			} else {
			  console.log('Screenshot saved');
			}
			client.close();
		  });
		}, delay);
	});
}).on('error', err => {
  console.error('Cannot connect to browser:', err);
});
