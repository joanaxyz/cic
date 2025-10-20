package com.appdev.xyz.gakog5.controller.page;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.GetMapping;


@Controller
@RequestMapping("/cic")
public class ChatbotPageController {
    @GetMapping("/chatbot")
    public String chatbot() {
        return "chatbot/chat";
    }
    
}
