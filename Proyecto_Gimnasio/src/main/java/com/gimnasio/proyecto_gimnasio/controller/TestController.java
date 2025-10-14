package com.gimnasio.proyecto_gimnasio.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/")
    public String home() {
        return "✅ Proyecto Gimnasio funcionando correctamente con MySQL!";
    }
}

