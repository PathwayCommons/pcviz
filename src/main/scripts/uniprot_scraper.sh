#!/bin/bash

#TODO sanitize args

# args:
#   $1 : input hgnc file
#   $2 : intermediate file (to output uniprot ids)
#   $3 : output directory
#   $4 : logfile name

# extract uniprot ids into a temp file
phantomjs extract_uniprot.js $1 $2

wait

tempFile="$2";

# process the temp file and scrape for each uniprot id
numOfIds=`wc -l ${tempFile} | awk '{ print $1 }'`
i=1
while [ $i -le $numOfIds ]
do
    uniprotId=`head -n $i ${tempFile}| tail -1`
    phantomjs uniprot_scraper.js $uniprotId $3 >> $4
    let i=$i+1
done

rm $2;
