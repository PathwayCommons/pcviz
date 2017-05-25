package org.pathwaycommons.pcviz.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class PageController {

    @ModelAttribute("pcUrl")
    public String pcUrl(@Value("${pathwaycommons.url}") String url) {
        return url;
    }

    @ModelAttribute("pcvizUrl")
    public String pcvizUrl(@Value("${pcviz.url}") String url) {
        return url;
    }

    @RequestMapping("/")
    public String home() {
        return "home";
    }
}
