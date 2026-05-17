package com.zipflow.zipflowserver.controller;

import com.zipflow.zipflowserver.entities.FileEntity;
import com.zipflow.zipflowserver.enums.FileAccessEnum;
import com.zipflow.zipflowserver.exceptions.GCPFileException;
import com.zipflow.zipflowserver.repository.FileRepository;
import com.zipflow.zipflowserver.service.FileService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/api/files")
public class FileController {
    private final FileService fileService;
    private final FileRepository fileRepository;

    @GetMapping()
    public ResponseEntity<Map<String, Object>> getFiles(@RequestParam(defaultValue = "1") int page,
                                                        @RequestParam(defaultValue = "10") int rowsPerPage) {
        // Adjust page index
        int pageIndex = page - 1;

        // Retrieve paginated entities from the database
        Pageable pageable = PageRequest.of(pageIndex, rowsPerPage);
        Page<FileEntity> pageResult = fileRepository.findAll(pageable);

        // Create response map
        Map<String, Object> response = new HashMap<>();
        response.put("data", pageResult.getContent());

        // Create meta map
        Map<String, Long> meta = new HashMap<>();
        meta.put("total", pageResult.getTotalElements());
        response.put("meta", meta);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileEntity> getFileById(@PathVariable Long id) {
        try {
            FileEntity getFile = fileService.findById(id);
            return ResponseEntity.ok(getFile);
        } catch (EntityNotFoundException | GCPFileException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @PostMapping("/upload")
    public ResponseEntity<FileEntity> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam(name = "directory", defaultValue = "") String directory, @RequestParam(name = "access", defaultValue = "PUBLIC_READ") FileAccessEnum access) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        try {
            FileEntity savedFile = fileService.uploadFile(file, directory, access);
            return ResponseEntity.ok(savedFile);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    @DeleteMapping("/{id}")
    public String deleteFile(@PathVariable Long id) {
        if (id == null) {
            return "Invalid file ID. Please provide a valid file ID.";
        }

        try {
            fileService.deleteFile(id);
            return "File with ID " + id + " deleted successfully.";
        } catch (EntityNotFoundException | GCPFileException e) {
            return String.valueOf(e.getMessage());
        }
    }
}