# About
Pathway Commons Network Visualizer, PCViz in short, is a joint project of [Sander Lab - cBio MSKCC](http://cbio.mskcc.org) and [Bader Lab - uToronto](http://baderlab.org).

# Deploy
Clone the repository and in the main directory, use the following command to copy/edit the configuration file:

	cp -f src/main/webapp/WEB-INF/spring/pcviz.properties.example src/main/webapp/WEB-INF/spring/pcviz.properties

then use the following command to start the application within a test Tomcat instance:

	mvn clean install tomcat:run

and point your browser to [http://localhost:8080/pcviz/](http://localhost:8080/pcviz/).

## Mock-up
Here is how this web-page should look for the first sprint:
![PCViz myBalsamiq Mock-up](https://cbiomskcc.mybalsamiq.com/mockups/793048.png?key=f4b2c8bd9f042189a68577dd4427a72eaddcc655)

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
