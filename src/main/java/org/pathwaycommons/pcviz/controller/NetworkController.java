package org.pathwaycommons.pcviz.controller;

import cpath.service.GraphType;
import org.pathwaycommons.pcviz.service.PathwayCommonsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;

import java.beans.PropertyEditorSupport;
import java.io.IOException;
import java.util.Arrays;
import java.util.Set;
import java.util.TreeSet;

@Controller
@RequestMapping("/graph")
public class NetworkController
{
    @Autowired
    private PathwayCommonsService pathwayCommonsService;

    /**
     * This configures the web request parameters binding, i.e.,
     * conversion to the corresponding java types; for example,
     * "neighborhood" is recognized as {@link GraphType#NEIGHBORHOOD}.
     *  Depending on the editor, illegal query parameters may result
     *  in an error or just NULL value.
     *
     * @param binder
     */
    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(GraphType.class, new GraphTypeEditor());
    }

    @RequestMapping(value = "{type}/{genes}", method = {RequestMethod.GET, RequestMethod.POST},
            headers = "Accept=application/json")
    public ResponseEntity<String> getEntityInJson(@PathVariable GraphType type, @PathVariable String genes)
            throws IOException
    {
//        if(!(type == GraphType.NEIGHBORHOOD || type == GraphType.PATHSBETWEEN)) {
//            return ResponseEntity.badRequest().body("Unsupported (yet) graph query type: " + type.toString());
//        }

        // otherwise, do the job -
        Set<String> geneSet = new TreeSet<String>();
        geneSet.addAll(Arrays.asList(genes.split("\\s*,\\s*")));

        String networkJson = pathwayCommonsService.createNetwork(type, geneSet);

        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(networkJson);
    }

    final class GraphTypeEditor extends PropertyEditorSupport {
        @Override
        public void setAsText(String arg0) {
            GraphType value = null;
            value = GraphType.valueOf(arg0.trim().toUpperCase());
            setValue(value);
        }
    }
}
