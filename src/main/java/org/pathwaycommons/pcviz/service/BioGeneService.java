package org.pathwaycommons.pcviz.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Scanner;

@Service
public class BioGeneService {

    @Value("${biogene.url}")
    public String bioGeneUrl;

    public final static String bioGeneFormat = "json";

    @Value("${cache.folder}")
    private String cacheDir;

    public BioGeneService() {
    }

    @PostConstruct
    void init() throws IOException{
        Path dir = Paths.get(cacheDir, "biogene");
        if(!Files.exists(dir))
            Files.createDirectories(dir);
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
        Path file = Paths.get(cacheDir, "biogene", gene + ".json");
        if(Files.exists(file)) {
           return new String(Files.readAllBytes(file));
        }

        // continue if no cached data found (upgrade to java8 way later...) -
        String url = (new StringBuilder()).append(bioGeneUrl).append("retrieve.do")
            .append("?query=").append(gene).append("&org=").append(organism)
            .append("&format=").append(bioGeneFormat).toString();
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

        String data = sb.toString();

        //save
        Files.write(file, data.getBytes());

        return data;
    }

}
