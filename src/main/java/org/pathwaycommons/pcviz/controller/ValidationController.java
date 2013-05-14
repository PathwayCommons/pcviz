package org.pathwaycommons.pcviz.controller;

import flexjson.JSONSerializer;
import org.pathwaycommons.pcviz.model.GeneValidation;
import org.pathwaycommons.pcviz.service.GeneNameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.ArrayList;

@Controller
@RequestMapping("/validate")
public class ValidationController {
    @Autowired
    private GeneNameService geneNameService;

    public GeneNameService getGeneNameService() {
        return geneNameService;
    }

    public void setGeneNameService(GeneNameService geneNameService) {
        this.geneNameService = geneNameService;
    }

    @RequestMapping(value = "{genes}", method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
    public ResponseEntity<String> getEntityInJson(@PathVariable String genes)
    {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        ArrayList<GeneValidation> validations = new ArrayList<GeneValidation>();
        String[] geneTokens = genes.toUpperCase().split(",", -1);
        for (String geneToken : geneTokens) {
            if(geneToken.isEmpty()) continue;

            GeneValidation geneValidation = getGeneNameService().validate(geneToken);
            validations.add(geneValidation);
        }

        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");

        return new ResponseEntity<String>(
                jsonSerializer.deepSerialize(validations),
                headers,
                HttpStatus.OK
        );
    }
}
