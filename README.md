[![Build Status](https://travis-ci.org/PathwayCommons/pcviz.svg)](https://travis-ci.org/PathwayCommons/pcviz)

# About
Pathway Commons Network Visualizer, PCViz in short, is a joint project of [Sander Lab - cBio MSKCC](http://cbio.mskcc.org) and [Bader Lab - uToronto](http://baderlab.org). PCViz currently runs at http://www.pathwaycommons.org/pcviz/

[![PCViz](./pcviz-screenshot.png)](http://www.pathwaycommons.org/pcviz/)

# Deploy
Clone the repository and in the main directory, use the following command to copy/edit the configuration file:

	cp -f src/main/resources/spring/pcviz.properties.example src/main/resources/spring/pcviz.properties

The property `hgnc.location` should point to a valid HGNC output that contains the official gene symbols and their synonyms.
This file can be downloaded as follows:

	wget -O /tmp/hgnc.txt "http://www.genenames.org/cgi-bin/hgnc_downloads?col=gd_app_sym&col=gd_aliases&col=md_prot_id&status=Approved&status_opt=2&where=&order_by=gd_hgnc_id&format=text&limit=&hgnc_dbtag=on&submit=submit"

Make sure all other properties reflect the options you wanted to set and then use the following command to start the application within a test Tomcat instance:

	mvn clean install tomcat:run

and point your browser to [http://localhost:8080/pcviz/](http://localhost:8080/pcviz/).

If you would like to use your own Tomcat installation for the installation, then you can also deploy the file as follows:

	mvn clean install
	cp -f target/target/pcviz-VERSION.war /path/to/tomcat/webapps/pcviz.war

# Populating cache using UniProt IDs
To serve networks better, PCViz can utilize cached network data.
The data folder for the cache files is set within the properties file using the

To prepare those caches, you need to

1. Clean up your files from `precalculted.folder`
2. Deploy a dummy PCViz with empty caches
3. Edit `uniprot_scraper.js` to point to the non-cached version of PCViz (if it is different than the production one)
4. Make sure `phantomjs` is installed and run `uniprot_scraper.sh` with these arguments: `bash uniprot_scraper.sh /path/to/hgnc.txt /tmp/uniprotids.txt /path/to/cache/folder /path/to/log.txt`
6. Optionally remove all PNGs from the output directory (as we don't make use of them for now)
7. Move all JSONs in the folder over to your `precalculated.folder`
8. Restart/re-deploy PCViz with this cache folder populated

It is a good idea to clean up other cache folders (such as portal and co-citations) once in a while, but it is not required unless the formatting changes for those files/services. 
Only the pre-calculated network cache requires pre-processing.

# License
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
