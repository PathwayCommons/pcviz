#!/bin/bash
# TODO why don't we simplify the scripts to use stdin/stdout and then chain them via shell pipe and i/o redirect (|, >, <, >>, etc.)?
# TODO sanitize args
#*****
# WARN: fails when run with "nohup sh..." or as a child process - with "&" (phantom.js process never exits...)
#*****
# args:
#   $1 : input hgnc file
#   $2 : intermediate file (to output uniprot ids)
#   $3 : output directory
#   $4 : logfile name

if ! [ -e "$2" ]; then
    echo "creating a list of UniProt IDs..."
    # extract uniprot ids into a temp file
    phantomjs extract_uniprot.js "$1" "$2"
    wait
else
    echo "using previously generated ID list: $2"
fi

echo "for each ID, querying pcviz/PC2 for its nearest undirected neighborhood network:"
tempFile="$2";

# process the temp file and scrape for each (not previously processed) uniprot accession number
numOfIds=`wc -l ${tempFile} | awk '{ print $1 }'`
echo "there are $numOfIds to process;"
i=1
while [ $i -le $numOfIds ]
do
    uniprotId=`head -n $i ${tempFile}| tail -1`

    if [ -e "$3/$uniprotId.json" ]; then
      echo "skip existing $uniprotId"
    else
      echo "start: phantomjs uniprot_scraper.js $uniprotId"
      phantomjs uniprot_scraper.js $uniprotId "$3" 2>&1 >> "$4"
    fi

    echo "processed: $i"
    let i=$i+1
done

# rm $2;
echo "all done!"
