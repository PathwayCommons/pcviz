/*
 * Copyright 2013 Memorial-Sloan Kettering Cancer Center.
 *
 * This file is part of the Pathway Commons' PCViz.
 *
 * PCViz is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PCViz is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with PCViz. If not, see <http://www.gnu.org/licenses/>.
 */

package org.pathwaycommons.pcviz.controller;

import cpath.service.GraphType;
import org.pathwaycommons.pcviz.service.PathwayCommonsGraphService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;

import java.beans.PropertyEditorSupport;
import java.util.Arrays;
import java.util.HashSet;

@Controller
@RequestMapping("/graph")
public class NetworkController
{
    @Autowired
    private PathwayCommonsGraphService pathwayCommonsGraphService;

    public PathwayCommonsGraphService getPathwayCommonsGraphService() {
        return pathwayCommonsGraphService;
    }

    public void setPathwayCommonsGraphService(PathwayCommonsGraphService pathwayCommonsGraphService) {
        this.pathwayCommonsGraphService = pathwayCommonsGraphService;
    }

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

    @RequestMapping(value = "{type}/{genes}", method = {RequestMethod.GET, RequestMethod.POST}, headers = "Accept=application/json")
    public ResponseEntity<String> getEntityInJson(@PathVariable GraphType type, @PathVariable String genes, BindingResult bindingResult)
    {
        if(bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(errorFromBindingResult(bindingResult));
        } else if(!(type == GraphType.NEIGHBORHOOD || type == GraphType.PATHSBETWEEN)) {
            // TODO: Should we support commonstream and pathsfromto, too?
            return ResponseEntity.badRequest().body("Unsupported (yet) graph query type: " + type.toString());
        }

        // otherwise, do the job -

        HashSet<String> geneSet = new HashSet<String>();
        geneSet.addAll(Arrays.asList(genes.split("\\s*,\\s*")));

        String networkJson = "";
        try {
            networkJson = getPathwayCommonsGraphService().createNetwork(type, geneSet);
        } catch(Exception e) {
            e.printStackTrace();
        }

        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON_UTF8).body(networkJson);
    }

    private final String errorFromBindingResult(BindingResult bindingResult) {
        StringBuilder sb = new StringBuilder();
        for (ObjectError e : bindingResult.getAllErrors()) {
            sb.append(e.toString()).append(" ");
//            Object rejectedVal = e.getRejectedValue();
//            if(rejectedVal instanceof Object[]) {
//                if(((Object[]) rejectedVal).length > 0) {
//                    rejectedVal = Arrays.toString((Object[])rejectedVal);
//                } else {
//                    rejectedVal = "empty array";
//                }
//            }
//            sb.append(e.getField() + " was '" + rejectedVal + "'; "
//                    + e.getDefaultMessage() + ". ");
        }
        return sb.toString();
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
