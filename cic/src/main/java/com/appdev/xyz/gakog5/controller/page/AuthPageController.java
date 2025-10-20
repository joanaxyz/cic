package com.appdev.xyz.gakog5.controller.page;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/cic/auth")
public class AuthPageController {

    @GetMapping("/sign-in")
    public String signin() {
        return "auth/sign-in";
    }

    @GetMapping("/sign-up")
    public String signup() {
        return "auth/sign-up";
    }

    @GetMapping("/forgot-password")
    public String forgotPassword() {
        return "auth/forgot_pass";
    }

    @GetMapping("/reset-password")
    public String resetPassword() {
        return "auth/reset_pass";
    }

    @GetMapping("/verify-account")
    public String verifyEmail(){
        return "auth/verify_account";
    }
}
