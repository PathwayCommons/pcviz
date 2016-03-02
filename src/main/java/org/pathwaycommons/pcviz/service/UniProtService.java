package org.pathwaycommons.pcviz.service;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.cache.annotation.Cacheable;

import java.io.InputStream;
import java.net.URL;
import java.util.Scanner;

public class UniProtService {
    private static Log log = LogFactory.getLog(UniProtService.class);

    private String uniProtBaseURL = "http://www.uniprot.org/";

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
