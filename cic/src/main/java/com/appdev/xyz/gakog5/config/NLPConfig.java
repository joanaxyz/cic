package com.appdev.xyz.gakog5.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class NLPConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}