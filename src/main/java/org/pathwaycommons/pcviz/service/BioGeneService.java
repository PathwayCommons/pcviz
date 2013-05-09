package org.pathwaycommons.pcviz.service;

import org.springframework.cache.annotation.Cacheable;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

public class BioGeneService {
    public String bioGeneUrl;
    public String bioGeneFormat;

    public BioGeneService() {
    }

    public BioGeneService(String bioGeneUrl, String bioGeneFormat) {
        this.bioGeneUrl = bioGeneUrl;
        this.bioGeneFormat = bioGeneFormat;
    }

    /**
     * Requests data from BioGene server.
     *
     * @param gene      query gene
     * @param organism  organism name
     * @return          BioGene data in json format
     * @throws java.io.IOException
     */
    @Cacheable("bioGeneCache")
    public String getData(String gene, String organism) throws IOException
    {
        StringBuilder urlBuilder = new StringBuilder();

        urlBuilder.append(getBioGeneUrl());
        urlBuilder.append("retrieve.do");
        urlBuilder.append("?query=").append(gene);
        urlBuilder.append("&org=").append(organism);
        urlBuilder.append("&format=").append(getBioGeneFormat());

        String url = urlBuilder.toString();

        URL bioGene = new URL(url);
        URLConnection bioGeneCxn = bioGene.openConnection();
        BufferedReader in = new BufferedReader(
                new InputStreamReader(bioGeneCxn.getInputStream()));

        String line;
        StringBuilder sb = new StringBuilder();

        // Read all
        while((line = in.readLine()) != null)
        {
            sb.append(line);
        }

        in.close();

        return sb.toString();
    }

    public String getBioGeneUrl() {
        return bioGeneUrl;
    }

    public void setBioGeneUrl(String bioGeneUrl) {
        this.bioGeneUrl = bioGeneUrl;
    }

    public String getBioGeneFormat() {
        return bioGeneFormat;
    }

    public void setBioGeneFormat(String bioGeneFormat) {
        this.bioGeneFormat = bioGeneFormat;
    }
}
