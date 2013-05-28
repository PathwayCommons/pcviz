package org.pathwaycommons.pcviz.controller;

import flexjson.JSONSerializer;
import org.pathwaycommons.pcviz.model.AutoCompleteResult;
import org.pathwaycommons.pcviz.service.GeneNameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/autocomplete")
public class AutoCompleteController {
    @Autowired
    private GeneNameService geneNameService;

    public GeneNameService getGeneNameService() {
        return geneNameService;
    }

    public void setGeneNameService(GeneNameService geneNameService) {
        this.geneNameService = geneNameService;
    }

    @RequestMapping(method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
    public ResponseEntity<String> getEntityInJson(@RequestParam("term") String term)
    {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        List<AutoCompleteResult> autoCompleteResults = geneNameService.autoComplete(term.toUpperCase());
        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");

        return new ResponseEntity<String>(
                jsonSerializer.deepSerialize(autoCompleteResults),
                headers,
                HttpStatus.OK
        );
    }

}
