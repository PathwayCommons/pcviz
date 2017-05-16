package org.pathwaycommons.pcviz.service;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;
import java.util.Scanner;

//TODO: too slow; instead of uniprot.org, can call PC2 traverse to get the FUNCTION:... comment of a ProteinReference
// e.g.: http://www.pathwaycommons.org/pc2/traverse.json?path=EntityReference/comment&uri=http://identifiers.org/uniprot/P12643

@Service
public class UniProtService {
    private static Log log = LogFactory.getLog(UniProtService.class);

    //auto-set the value from pcviz.properties (placeholder) or use the default
    @Value("${uniprot.base.url:http://www.uniprot.org/}")
    private String uniProtBaseURL;

    /**
     * Default Constructor.
     */
    public UniProtService() {
    }

    public String getUniProtBaseURL() {
        return uniProtBaseURL;
    }

    public void setUniProtBaseURL(String uniProtBaseURL) {
        this.uniProtBaseURL = uniProtBaseURL;
    }

    @Cacheable("uniprotCache")
    public String getDescription(String uniprotId) {
        if(uniprotId == null || uniprotId.isEmpty()) {
            log.warn("NULL or empty UniProt accession number.");
            return null;
        }

        String txtFileURL = uniProtBaseURL + "uniprot/" + uniprotId + ".txt";

        try {
            StringBuilder builder = new StringBuilder();

            URL url = new URL(txtFileURL);
            InputStream inputStream = url.openStream();
            Scanner scanner = new Scanner(inputStream);
            boolean inDesc = false;
            while(scanner.hasNextLine()) {
                String line = scanner.nextLine();
                if(!line.startsWith("CC")) { continue; }

                if(line.contains("-!-")) {
                    if(line.contains("FUNCTION: ")) {
                        inDesc = true;
                    } else {
                        inDesc = false;
                    }
                }

                if(inDesc) {
                    builder.append(line);
                }
            }
            scanner.close();
            inputStream.close();

            String desc = builder.toString();
            desc = desc.replaceAll("CC       ", "")
                    .replaceAll("CC   -!- FUNCTION: ", "")
                    .replaceAll("\\{.+\\}\\.", "")
            ;
            return desc;
        } catch(Exception e) {
            log.error("Could not load uniprot description for " + uniprotId + ". " + e);
        }

        return null;
    }
}
