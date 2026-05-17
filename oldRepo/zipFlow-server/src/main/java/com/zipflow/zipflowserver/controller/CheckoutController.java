package com.zipflow.zipflowserver.controller;

import com.zipflow.zipflowserver.entities.CheckoutEntity;
import com.zipflow.zipflowserver.model.CheckoutProduct;
import com.zipflow.zipflowserver.repository.CheckoutRepository;
import com.zipflow.zipflowserver.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor()
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
    public ResponseEntity<Map<String, Object>> getAllCheckouts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int rowsPerPage,
            @RequestParam(defaultValue = "created_at") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortOrder) {

        // Determine the sort order
        Sort.Direction direction = sortOrder.equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC;

        // Create pageable object
        Pageable pageable = PageRequest.of(page - 1, rowsPerPage, Sort.by(direction, "createdAt"));

        // Fetch paginated and sorted data
        Page<CheckoutEntity> checkoutPage;

        checkoutPage = checkoutRepository.findAll(pageable);

        // Create response map
        Map<String, Object> response = new HashMap<>();
        response.put("data", checkoutPage.getContent());

        // Create meta map
        Map<String, Object> meta = new HashMap<>();
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
        return checkoutEntity.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CheckoutEntity> createCheckout(@Valid @RequestBody CheckoutEntity checkoutEntity) {
        CheckoutEntity savedCheckout = checkoutRepository.save(checkoutEntity);

        if (!savedCheckout.toString().isEmpty()) {
            String template =
                    "    <h2 style=\"color: #333; text-align: center;\">Order Details</h2>" +
                            "<p><strong>Name:</strong> " + savedCheckout.getDetails().getName() + "</p>" +
                            "<p><strong>Surname:</strong> " + savedCheckout.getDetails().getSurname() + "</p>" +
                            "<p><strong>Email:</strong><a href=\"mailto:" + savedCheckout.getDetails().getEmail() + "\"> " + savedCheckout.getDetails().getEmail() + "</a></p>" +
                            "<p><strong>Phone number:</strong><a href=\"tel:" + savedCheckout.getDetails().getPhone() + "\"> " + savedCheckout.getDetails().getPhone() + "</a></p>" +
                            "<h3 style=\"color: #333;\">Selected Products</h3>" +
                            "<table style=\"width: 100%; border-collapse: collapse; margin-bottom: 20px;\">" +
                            "<thead>" +
                            "<tr>" +
                            "<th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;\">Model</th>" +
                            "<th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;\">Product name</th>" +
                            "<th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;\">Product code</th>" +
                            "<th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;\">Price</th>" +
                            "<th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;\">Quantity</th>" +
                            "<th style=\"border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;\">Total</th>" +
                            "</tr>" +
                            "</thead>" +
                            "<tbody>";

            for (CheckoutProduct product : savedCheckout.getProducts()) {
                template += "<tr>"
                        + "<td style=\"border: 1px solid #ddd; padding: 8px;\">"
                        + product.getModel() + "</td>"
                        + "<td style=\"border: 1px solid #ddd; padding: 8px;\">"
                        + product.getName() + "</td>"
                        + "<td style=\"border: 1px solid #ddd; padding: 8px;\">"
                        + product.getSku() + "</td>"
                        + "<td style=\"border: 1px solid #ddd; padding: 8px;\">" +
                        product.getPrice() + "</td>"
                        + "<td style=\"border: 1px solid #ddd; padding: 8px;\">" +
                        product.getQuantity() + "</td>";
                if (product.getPrice() != null) {
                    String[] priceParts = product.getPrice().split(" ");
                    if (priceParts.length == 2) {
                        try {
                            double numericPrice = Double.parseDouble(priceParts[0]);
                            double totalPrice = numericPrice * product.getQuantity().doubleValue();
                            template += "<td style=\"border: 1px solid #ddd; padding: 8px;\">" + totalPrice + " " + priceParts[0] + "</td>";
                        } catch (NumberFormatException e) {
                            throw new NumberFormatException();
                        }
                    }
                }
                template += "</tr>";
            }


            template += "</tbody></table>" +
                    "<h3 style=\"color: #333;\">Total Summary</h3>" +
                    "<p style=\"color: #333;\"><strong>Subtotal:</strong> " + savedCheckout.getTotal().getSubtotal() + "</p>" +
                    "<p style=\"color: #333;\"><strong>Total:</strong> " + savedCheckout.getTotal().getTotal() + "</p> <br>";
            try {
                this.emailService.sendEmail(checkoutEmail, "New order", template, new HashMap<>());
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
