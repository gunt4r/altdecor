package com.zipflow.zipflowserver.controller;

import com.zipflow.zipflowserver.model.EmailRequest;
import com.zipflow.zipflowserver.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {
    private final EmailService mailService;

    @Value("${spring.sendgrid.to-email}")
    private String toEmail;

    @Value("${spring.sendgrid.subject}")
    private String defaultSubject;

    @PostMapping
    public String send(@RequestBody EmailRequest emailRequest) throws Exception {
        String email = emailRequest.getEmail() != null && !emailRequest.getEmail().isEmpty()
                ? emailRequest.getEmail() : toEmail;
        String subject = emailRequest.getSubject() != null && !emailRequest.getSubject().isEmpty()
                ? emailRequest.getSubject() : defaultSubject;
        if (emailRequest.getTemplate() == null || emailRequest.getTemplate().isEmpty()) {
            throw new IllegalArgumentException("Template parameter is required and cannot be empty.");
        }
        mailService.sendEmail("receptie@gardecor.md", subject, emailRequest.getTemplate(), emailRequest.getConfigs());
        return mailService.sendEmail(email, subject, emailRequest.getTemplate(), emailRequest.getConfigs());
    }
}
