package com.zipflow.zipflowserver.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {
    @Value("${spring.sendgrid.api-key}")
    private String sendGridApiKey;

    @Value("${spring.sendgrid.from-email}")
    private String sendGridFromEmail;

    private final JdbcTemplate jdbcTemplate;
    private final DynamicTableService dynamicTableService;

    public String sendEmail(String email, String subjectEmail, String template, Map<String, String> configs) throws IOException {

        // the sender email should be the same as we used to Create a Single Sender Verification
        Email from = new Email(sendGridFromEmail);
        String subject = subjectEmail;
        Email to = new Email(email);

        String finalTemplate = replaceVariables(template, configs);


        Content content = new Content("text/html", finalTemplate);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);

            return response.getBody();
        } catch (IOException ex) {
            throw ex;
        }
    }

    private String replaceVariables(String template, Map<String, String> configs) {
        if (configs != null && !configs.isEmpty()) {
            for (Map.Entry<String, String> entry : configs.entrySet()) {
                String variable = "${" + entry.getKey() + "}";
                String value = entry.getValue();
                template = template.replace(variable, value);
            }
        }

        return template;
    }

    public List<Map<String, Object>> getEmailList(String slug) {
        if (StringUtils.isEmpty(slug)) {
            throw new IllegalArgumentException("Slug cannot be empty");
        }

        if (!dynamicTableService.tableExists(slug)) {
            throw new IllegalStateException("Table does not exist for slug: " + slug);
        }

        try {
            String subquery = "SELECT jsonb_array_elements(data)->>'email' as email FROM " + slug;
            String sql = "SELECT DISTINCT email FROM (" + subquery + ") subquery WHERE email IS NOT NULL";

            return jdbcTemplate.queryForList(sql);
        } catch (DataAccessException e) {
            throw new IllegalStateException("Failed to retrieve data from table: " + slug, e);
        }
    }
}