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
while read -r uniprot
do
    phantomjs uniprot_scraper.js $uniprot $3 >> $4;
done < "$tempFile"

rm $2;
