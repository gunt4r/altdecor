package com.zipflow.zipflowserver.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.*;
import com.zipflow.zipflowserver.enums.FileAccessEnum;
import com.zipflow.zipflowserver.entities.FileEntity;
import com.zipflow.zipflowserver.exceptions.GCPFileException;
import com.zipflow.zipflowserver.repository.FileRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

@Service
public class FileService {
    private static final Logger LOGGER = LoggerFactory.getLogger(FileService.class);

    private final FileRepository fileRepository;

    @Value("${google.cloud.storage.config-file}")
    private String configFile;

    @Value("${google.cloud.storage.project-id}")
    private String projectId;

    @Value("${google.cloud.storage.bucket-name}")
    private String bucketName;

    public FileService(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    public FileEntity findById(Long fileId) {
        try {
            return fileRepository.findById(fileId)
                    .orElseThrow(() -> new EntityNotFoundException("FileEntity not found with ID: " + fileId));
        } catch (EntityNotFoundException e) {
            LOGGER.warn("FileEntity with ID {} not found", fileId);
            throw e;
        } catch (Exception e) {
            LOGGER.error("An error occurred while retrieving data. Exception: ", e);
            throw new GCPFileException("An error occurred while retrieving data");
        }
    }

    public FileEntity uploadFile(MultipartFile file, String directory, FileAccessEnum access) throws IOException {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            Storage storage = initializeStorage();

            String fileName = directory + '/' + System.currentTimeMillis() + "_" + file.getOriginalFilename();

            BlobId blobId = BlobId.of(bucketName, fileName);

            BlobInfo.Builder blobInfoBuilder = BlobInfo.newBuilder(blobId)
                    .setContentType(file.getContentType());

            Storage.PredefinedAcl storageAccess = switch (access) {
                case PRIVATE -> Storage.PredefinedAcl.PRIVATE;
                case PUBLIC_READ -> Storage.PredefinedAcl.PUBLIC_READ;
            };

            BlobInfo blobInfo = blobInfoBuilder.build();

            Blob blob = storage.create(blobInfo, file.getBytes(), Storage.BlobTargetOption.predefinedAcl(storageAccess));

            if (blob != null) {
                LOGGER.debug("File successfully uploaded to GCS");
                FileEntity fileEntity = new FileEntity();
                fileEntity.setFile_name(blob.getName());
                fileEntity.setFile_url(blob.getMediaLink());
                return fileRepository.save(fileEntity);
            }
        } catch (Exception e) {
            LOGGER.error("An error occurred while uploading data. Exception: ", e);
            throw new GCPFileException("An error occurred while storing data to GCS");
        }
        throw new GCPFileException("An error occurred while storing data to GCS");
    }

    public void deleteFile(Long fileId) {
        try {
            Optional<FileEntity> optionalFileEntity = fileRepository.findById(fileId);

            if (optionalFileEntity.isPresent()) {
                FileEntity fileEntity = optionalFileEntity.get();
                String fileName = fileEntity.getFile_name();

                Storage storage = initializeStorage();

                BlobId blobId = BlobId.of(bucketName, fileName);
                boolean deleted = storage.delete(blobId);

                if (deleted) {
                    LOGGER.debug("File successfully deleted from GCS");

                    fileRepository.deleteById(fileId);
                    LOGGER.debug("FileEntity record deleted from the database");
                } else {
                    LOGGER.warn("File deletion from GCS failed");
                    throw new GCPFileException("Failed to delete file from GCS");
                }
            } else {
                LOGGER.warn("FileEntity with ID {} not found", fileId);
                throw new EntityNotFoundException("FileEntity not found with ID: " + fileId);
            }
        } catch (Exception e) {
            LOGGER.error("An error occurred while deleting data. Exception: ", e);
            throw new GCPFileException("An error occurred while deleting data");
        }
    }

    private Storage initializeStorage() throws IOException {
        InputStream inputStream = new ClassPathResource(configFile).getInputStream();
        StorageOptions options = StorageOptions.newBuilder()
                .setProjectId(projectId)
                .setCredentials(GoogleCredentials.fromStream(inputStream))
                .build();
        return options.getService();
    }
}
