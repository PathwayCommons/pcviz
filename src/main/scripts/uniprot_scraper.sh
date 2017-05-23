#!/bin/bash
# TODO why don't we simplify the scripts to use stdin/stdout and then chain them via shell pipe and i/o redirect (|, >, <, >>, etc.)?
# TODO sanitize args
#*****
# WARN: fails when run with "nohup sh..." or as a child process - with "&" (phantom.js process never exits...)
#*****
# args:
#   $1 : input hgnc file
#   $2 : output directory
#   $3 : logfile name

TMPFILE="/tmp/pcviz_uniprot_ids.txt"

if ! [ -e "$TMPFILE" ] ; then
    echo "creating a list of UniProt IDs..."
    # extract UniProt accession numbers to the file
    phantomjs extract_uniprot.js "$1" "$TMPFILE"
    wait
else
    echo "using previously generated ID list: $TMPFILE"
fi

echo "for each ID, querying pcviz/PC2 for its nearest undirected neighborhood network:"

# process the temp file and scrape for each (not previously processed) uniprot accession number
numOfIds=$(wc -l ${TMPFILE} | awk '{ print $1 }')
echo "there are $numOfIds to process;"
i=1
while [ $i -le $numOfIds ] ; do
    uniprotId=$(head -n $i ${TMPFILE}| tail -1)

    if [ -e "$2/$uniprotId.json" ] ; then
      echo "skip existing $uniprotId"
    else
      echo "start: phantomjs uniprot_scraper.js $uniprotId"
      phantomjs uniprot_scraper.js $uniprotId "$2" 2>&1 >> "$3"
    fi

    echo "processed: $i"
    let i=$i+1
done

#TODO: also get all the info from Biogene and iHope for each ID

echo "all done!"
