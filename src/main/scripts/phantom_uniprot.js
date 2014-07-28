var webPage = require('webpage');
var fs = require('fs');
var system = require('system');

function main(args)
{
	if (args.length < 3)
	{
		console.log("Usage: cache_layout.js <input_hgnc_file> <output_directory>");
		phantom.exit(1);
	}
	else
	{
		var inFile = args[1];
		var outDir = args[2];

		var inputStream = fs.open(inFile, 'r');
		var buffer = [];

		// skip first line
		inputStream.readLine();

		// fetch all for the given inputStream
		fetch(inputStream, buffer, outDir);

		// TODO find a way to properly phantom.exit();
	}
}

/**
 * Fetches the web page content for the next uniprot id.
 *
 *
 * @param inputStream   input stream containing uniprot ids
 * @param buffer        buffer that may contain uniprot ids
 * @param outDir        target output directory
 * @returns String  next uniprot id
 */
function fetch(inputStream, buffer, outDir)
{
	var uniprotId = getNextUniprotId(inputStream, buffer);

	if (uniprotId)
	{
		var page = webPage.create();

		page.onClosing = function(closingPage) {
			// recursion...
			fetch(inputStream, buffer, outDir);
		};

		// fetch n-hood and screenshot from the web page
		fetchNhood(page, uniprotId, outDir);
	}

	return uniprotId;
}

/**
 * Extracts the next valid uniprot id from the given input stream
 *
 * @param inputStream   source input stream
 * @param buffer        buffer for previous fetch
 * @returns String      next valid uniprot ID
 */
function getNextUniprotId(inputStream, buffer)
{
	// (one line may contain more than one uniprot id)
	if (buffer.length > 0)
	{
		return buffer.pop();
	}

	// nothing to read...
	if (inputStream.atEnd())
	{
		inputStream.close();
		return null;
	}

	var line = inputStream.readLine();
	var parts = line.split("\t");

	if (parts.length > 2)
	{
		// get uniprot ids
		var uniprots = parts[2].split(",");

		// fetch n-hood for each uniprot id
		for (var i=0; i<uniprots.length; i++)
		{
			var uniprotId = uniprots[i].trim();

			if (uniprotId.length > 0)
			{
				buffer.push(uniprotId);
			}
		}
	}

	if (buffer.length > 0)
	{
		return buffer.pop();
	}
	else
	{
		// tail recursion...
		return getNextUniprotId(inputStream, buffer);
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
		// TODO this is really a bad of checking layout end
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

	page.open('http://www.pathwaycommons.org/pcviz/#neighborhood/' + queryString, function() {
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
		}, 200);
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
			return JSON.stringify(window.cy.elements().jsons());
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