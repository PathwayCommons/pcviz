package org.pathwaycommons.pcviz.controller;

import flexjson.JSONSerializer;
import org.pathwaycommons.pcviz.model.CancerStudyDetails;
import org.pathwaycommons.pcviz.service.CancerContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.IOException;
import java.util.HashMap;

@Controller
@RequestMapping("/cancer")
public class CancerController {
    @Autowired
    CancerContextService cancerContextService;

    public CancerContextService getCancerContextService() {
        return cancerContextService;
    }

    public void setCancerContextService(CancerContextService cancerContextService) {
        this.cancerContextService = cancerContextService;
    }

    @RequestMapping(value = "list", method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
    public ResponseEntity<String> listStudies() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");
        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");

        String cancerStudies;
        try {
            cancerStudies = jsonSerializer.deepSerialize(cancerContextService.listAvailableCancers());
        } catch (IOException e) {
            return new ResponseEntity<String>(e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<String>(cancerStudies, headers, HttpStatus.OK);
    }

    @RequestMapping(value = "get/{study}", method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
    public ResponseEntity<String> getStudyDetails(@PathVariable String study) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        String response;
        try {
            CancerStudyDetails studyDetails = cancerContextService.getStudyDetails(study);
            JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");
            response = jsonSerializer.deepSerialize(studyDetails);
        } catch (IOException e) {
            return new ResponseEntity<String>(e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<String>(response, headers, HttpStatus.OK);
    }

    @RequestMapping(value = "context/{studyId}/{profiles}/{genes}", method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
    public ResponseEntity<String> getContext(@PathVariable String studyId, @PathVariable String profiles, @PathVariable String genes) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json; charset=utf-8");

        HashMap<String,HashMap<String,Double>> context;

        try {
            context = cancerContextService.loadContext(studyId, profiles, genes);
        } catch (IOException e) {
            return new ResponseEntity<String>(e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }

        JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");
        String response = jsonSerializer.deepSerialize(context);

        return new ResponseEntity<String>(response, headers, HttpStatus.OK);
    }

}
