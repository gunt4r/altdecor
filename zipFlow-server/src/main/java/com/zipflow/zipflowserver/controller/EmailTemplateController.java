package com.zipflow.zipflowserver.controller;

import com.zipflow.zipflowserver.entities.EmailTemplateEntity;
import com.zipflow.zipflowserver.repository.EmailTemplateRepository;
import com.zipflow.zipflowserver.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/email/template")
@RequiredArgsConstructor
public class EmailTemplateController {
    @Value("${spring.sendgrid.subject}")
    private String defaultSubject;

    private final EmailTemplateRepository emailTemplateRepository;
    private final EmailService emailService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllEmailTemplates() {
        List<EmailTemplateEntity> emailTemplateEntities = emailTemplateRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("data", emailTemplateEntities);
        Map<String, Long> meta = new HashMap<>();
        meta.put("total", (long) emailTemplateEntities.size());
        response.put("meta", meta);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailTemplateEntity> getEmailTemplateById(@PathVariable Long id) {
        Optional<EmailTemplateEntity> emailTemplateEntity = emailTemplateRepository.findById(id);
        return emailTemplateEntity.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EmailTemplateEntity> createEmailTemplate(@Valid @RequestBody EmailTemplateEntity emailTemplateEntity) {
        return ResponseEntity.status(HttpStatus.CREATED).body(emailTemplateRepository.save(emailTemplateEntity));
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<EmailTemplateEntity> sendEmails(@PathVariable Long id,
                                                          @RequestParam(defaultValue = "email") String slug) {
        EmailTemplateEntity tmpl = emailTemplateRepository.findById(id).orElseThrow();
        List<Map<String, Object>> data = emailService.getEmailList(slug);
        String subject = tmpl.getSubject() != null && !tmpl.getSubject().isEmpty()
                ? tmpl.getSubject() : defaultSubject;
        Map<String, String> configs = new HashMap<>();
        for (Map<String, Object> emailObject : data) {
            if (emailObject.get("email") == null) continue;
            try {
                emailService.sendEmail((String) emailObject.get("email"), subject, tmpl.getTemplate(), configs);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmailTemplateEntity> updateEmailTemplate(@PathVariable Long id,
                                                                   @Valid @RequestBody EmailTemplateEntity updatedEmailTemplate) {
        if (!emailTemplateRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        updatedEmailTemplate.setId(id);
        return ResponseEntity.ok(emailTemplateRepository.save(updatedEmailTemplate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmailTemplate(@PathVariable Long id) {
        if (!emailTemplateRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        emailTemplateRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
