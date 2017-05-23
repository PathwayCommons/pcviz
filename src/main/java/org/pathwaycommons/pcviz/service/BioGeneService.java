package org.pathwaycommons.pcviz.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Scanner;

@Service
public class BioGeneService {

    @Value("${biogene.url:http://cbio.mskcc.org/biogene/}")
    public String bioGeneUrl;

    @Value("${biogene.format:json}")
    public String bioGeneFormat;

    @Value("${precalculated.folder}")
    private String precalculatedFolder;

    public BioGeneService() {
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
        Path file = Paths.get(precalculatedFolder, gene + ".biogene.json");
        if(Files.exists(file)) {
           return new String(Files.readAllBytes(file));
        }

        // continue if no cached data found (upgrade to java8 way later...) -
        String url = (new StringBuilder()).append(getBioGeneUrl()).append("retrieve.do")
            .append("?query=").append(gene).append("&org=").append(organism)
            .append("&format=").append(getBioGeneFormat()).toString();
        URL bioGene = new URL(url);
        URLConnection bioGeneCxn = bioGene.openConnection();
        Scanner scanner = new Scanner(bioGeneCxn.getInputStream());
        StringBuilder sb = new StringBuilder();
        // Read all
        while(scanner.hasNextLine())
        {
            sb.append(scanner.nextLine());
        }
        scanner.close();

        return sb.toString();
    }

}
