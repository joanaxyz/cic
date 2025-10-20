package com.appdev.xyz.gakog5.controller.page;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
@RequestMapping("/cic/admin")
public class AdminPageController{
    // Single endpoint for admin SPA - handles all routes client-side
    @GetMapping({"", "/", "/**"})    
    public String admin(){
        return "admin/admin-spa";
    }
}