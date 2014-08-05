/**
 * Extracts uniprot ids (one id per line) into the provided output file.
 */

var fs = require('fs');
var system = require('system');

function main(args)
{
	if (args.length < 3)
	{
		console.log("Usage: extract_uniprot.js <input_hgnc_file> <output_file>");
		phantom.exit(1);
	}
	else
	{
		var inFile = args[1];
		var outFile = args[2];

		extractAll(inFile, outFile);
		phantom.exit();
	}
}

function extractAll(inFile, outFile)
{
	var inputStream = fs.open(inFile, 'r');
	var outputStream = fs.open(outFile, 'w');
	var buffer = [];

	// skip first line
	var uniprotId = inputStream.readLine();

	while (uniprotId != null)
	{
		uniprotId = getNextUniprotId(inputStream, buffer);

		if (uniprotId &&
		    uniprotId.length > 0)
		{
			outputStream.writeLine(uniprotId);
		}
	}

	outputStream.close();
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

// run!
main(system.args);
