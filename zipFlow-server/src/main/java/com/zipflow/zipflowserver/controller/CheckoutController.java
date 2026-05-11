package com.zipflow.zipflowserver.controller;

import com.zipflow.zipflowserver.entities.CheckoutEntity;
import com.zipflow.zipflowserver.model.CheckoutProduct;
import com.zipflow.zipflowserver.repository.CheckoutRepository;
import com.zipflow.zipflowserver.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {
    @Value("${spring.checkout.email}")
    private String checkoutEmail;

    @Value("${spring.checkout.phone}")
    private String checkoutPhone;

    @Value("${spring.checkout.companyName}")
    private String companyName;

    private final CheckoutRepository checkoutRepository;
    private final EmailService emailService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCheckouts(@RequestParam(defaultValue = "1") int page,
                                                               @RequestParam(defaultValue = "10") int rowsPerPage,
                                                               @RequestParam(defaultValue = "created_at") String sortBy,
                                                               @RequestParam(defaultValue = "ASC") String sortOrder) {
        Sort.Direction direction = sortOrder.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;
        PageRequest pageable = PageRequest.of(page - 1, rowsPerPage, Sort.by(direction, "createdAt"));
        Page<CheckoutEntity> checkoutPage = checkoutRepository.findAll(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("data", checkoutPage.getContent());
        Map<String, Number> meta = new HashMap<>();
        meta.put("total", checkoutPage.getTotalElements());
        meta.put("page", checkoutPage.getNumber());
        meta.put("rowsPerPage", checkoutPage.getSize());
        meta.put("totalPages", checkoutPage.getTotalPages());
        response.put("meta", meta);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CheckoutEntity> getCheckoutById(@PathVariable Long id) {
        Optional<CheckoutEntity> checkoutEntity = checkoutRepository.findById(id);
        return checkoutEntity.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CheckoutEntity> createCheckout(@Valid @RequestBody CheckoutEntity checkoutEntity) {
        CheckoutEntity savedCheckout = checkoutRepository.save(checkoutEntity);
        if (!savedCheckout.toString().isEmpty()) {
            StringBuilder template = new StringBuilder();
            template.append("    <h2 style=\"color: #333; text-align: center;\">Order Details</h2>")
                    .append("<p><strong>Name:</strong> ").append(savedCheckout.getDetails().getName()).append("</p>")
                    .append("<p><strong>Surname:</strong> ").append(savedCheckout.getDetails().getSurname()).append("</p>")
                    .append("<p><strong>Email:</strong><a href=\"mailto:").append(savedCheckout.getDetails().getEmail()).append("\"> ")
                    .append(savedCheckout.getDetails().getEmail()).append("</a></p>")
                    .append("<p><strong>Phone number:</strong><a href=\"tel:").append(savedCheckout.getDetails().getPhone()).append("\"> ")
                    .append(savedCheckout.getDetails().getPhone()).append("</a></p>")
                    .append("<h3 style=\"color: #333;\">Selected Products</h3>")
                    .append("<table style=\"width: 100%; border-collapse: collapse; margin-bottom: 20px;\">")
                    .append("<thead><tr>")
                    .append("<th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;\">Model</th>")
                    .append("<th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;\">Product name</th>")
                    .append("<th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;\">Product code</th>")
                    .append("<th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;\">Price</th>")
                    .append("<th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;\">Quantity</th>")
                    .append("<th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;\">Total</th>")
                    .append("</tr></thead><tbody>");
            for (CheckoutProduct product : savedCheckout.getProducts()) {
                template.append("<tr>")
                        .append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(product.getModel()).append("</td>")
                        .append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(product.getName()).append("</td>")
                        .append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(product.getSku()).append("</td>")
                        .append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(product.getPrice()).append("</td>")
                        .append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(product.getQuantity()).append("</td>");
                if (product.getPrice() != null) {
                    String[] priceParts = product.getPrice().split(" ");
                    if (priceParts.length == 2) {
                        try {
                            double numericPrice = Double.parseDouble(priceParts[0]);
                            double totalPrice = numericPrice * product.getQuantity().doubleValue();
                            template.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(totalPrice).append(" ").append(priceParts[0]).append("</td>");
                        } catch (NumberFormatException e) {
                            throw new NumberFormatException();
                        }
                    }
                }
                template.append("</tr>");
            }
            template.append("</tbody></table>")
                    .append("<h3 style=\"color: #333;\">Total Summary</h3>")
                    .append("<p style=\"color: #333;\"><strong>Subtotal:</strong> ").append(savedCheckout.getTotal().getSubtotal()).append("</p>")
                    .append("<p style=\"color: #333;\"><strong>Total:</strong> ").append(savedCheckout.getTotal().getTotal()).append("</p> <br>");
            try {
                emailService.sendEmail(checkoutEmail, "New order", template.toString(), new HashMap<>());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCheckout);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCheckout(@PathVariable Long id) {
        if (!checkoutRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        checkoutRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
