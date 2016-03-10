/**
 * Generates a laid out cytoscape.js json, and a screen shot from a PCViz query
 * for the provided uniprot id.
 */

var webPage = require('webpage');
var fs = require('fs');
var system = require('system');

function main(args)
{
	if (args.length < 3)
	{
		console.log("Usage: uniprot_scraper.js <uniprot_id> <output_directory>");
		phantom.exit(1);
	}
	else
	{
		var uniprotId = args[1];
		var outDir = args[2];

		// fetch all for the given inputStream
		scrape(uniprotId, outDir);
	}
}

/**
 * Scrapes the web page content for the given uniprot id.
 *
 *
 * @param uniprotId uniprot id
 * @param outDir    target output directory
 */
function scrape(uniprotId, outDir)
{
	if (uniprotId)
	{
		var page = webPage.create();

		page.onClosing = function(closingPage) {
			// wait a little to prevent phantom js crashing
			setTimeout(function(){
				phantom.exit(0);
			}, 20);
		};

		// fetch n-hood and screenshot from the web page
		fetchNhood(page, uniprotId, outDir);
	}
}

/**
 * Fetches the result of n-hood query for the given input identifier (gene or uniprot id).
 * Writes the result as a JSON string into the output file.
 *
 * @param page          page connection to PCViz
 * @param queryString   identifier (gene symbol or uniprot id)
 * @param outputDir     directory to save output files
 */
function fetchNhood(page, queryString, outputDir)
{
	console.log("fetchNHood(): " + queryString);

	var same = 0;
	var prevMsg = "";
	var interval = null;

	page.onConsoleMessage = function(msg) {
		// TODO this is a really bad way of checking layout end
		if (msg.split("__")[0] == "NODE_POSITION")
		{
			// checking if node position changed within the interval
			if (msg == prevMsg)
			{
				same++;
			}
			else
			{
				prevMsg = msg;
				same = 0;
			}

			// if no change for more than 3 successive intervals,
			// assuming that layout is finished...
			if (same > 3)
			{
				clearInterval(interval);
				saveGraph(page, queryString, outputDir);
				page.close();
			}
		}

		console.log(msg);
	};

	page.open('http://localhost:8080/#neighborhood/' + queryString, function() {
		var maxRetry = 50;
		var retry = 0;
		interval = setInterval(function() {
			retry += page.evaluate(function() {
				if (window.cy)
				{
					// TODO see if there is way to check the layout is finished!
					console.log("NODE_POSITION__" + JSON.stringify(window.cy.elements("node").position()));
					// proper evaluation
					return 0;
				}
				else
				{
					// window.cy is not initialized, retry++
					return 1;
				}
			});

			if (retry > maxRetry)
			{
				console.log("[timeout] skipping query " + queryString);
				clearInterval(interval);
				page.close();
			}
		}, 500);
	});
}

/**
 * Saves the cytoscape.js graph json and PCViz screenshot on the disk.
 *
 * @param page          page connection to PCViz
 * @param queryString   identifier (gene symbol or uniprot id)
 * @param outputDir     directory to save output files
 */
function saveGraph(page, queryString, outputDir)
{
	// get graph json for the current uniprot id
	var graphJson = page.evaluate(function() {
		if (window.cy)
		{
			//return JSON.stringify(window.cy.elements().jsons());
			return JSON.stringify(window.cy.json().elements);
		}

		return null;
	});

	if (graphJson)
	{
		page.render(outputDir + "/" + queryString + ".png");

		try {
			fs.write(outputDir + "/" + queryString + ".json", graphJson, 'w');
		} catch(e) {
			console.log(e);
		}
	}
}

// run!
main(system.args);
