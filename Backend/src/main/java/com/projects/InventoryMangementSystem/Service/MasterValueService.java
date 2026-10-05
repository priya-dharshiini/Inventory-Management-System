package com.projects.InventoryMangementSystem.Service;

import com.projects.InventoryMangementSystem.Entity.MasterValue;
import com.projects.InventoryMangementSystem.Repository.MasterValueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class MasterValueService {

    public static final List<String> ALLOWED_TYPES = Arrays.asList(
            "DEPARTMENT", "DESIGNATION", "ROLE", "PRODUCT_STATUS", "EMPLOYEE_STATUS"
    );

    @Autowired
    private MasterValueRepository masterValueRepository;

    public MasterValue createValue(String type, MasterValue masterValue) {

        String normalizedType = normalizeType(type);

        if (masterValue.getValue() == null || masterValue.getValue().isBlank()) {
            throw new RuntimeException("Value is required");
        }

        String value = masterValue.getValue().trim();

        if (masterValueRepository.existsByTypeIgnoreCaseAndValueIgnoreCase(normalizedType, value)) {
            throw new RuntimeException(normalizedType + " value '" + value + "' already exists");
        }

        masterValue.setType(normalizedType);
        masterValue.setValue(value);

        if (masterValue.getActive() == null) {
            masterValue.setActive(true);
        }

        return masterValueRepository.save(masterValue);
    }

    public List<MasterValue> getByType(String type) {
        String normalizedType = normalizeType(type);
        return masterValueRepository.findByTypeIgnoreCaseOrderByValueAsc(normalizedType);
    }

    public MasterValue getById(Long id) {
        return masterValueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Master value not found with id: " + id));
    }

    public MasterValue updateValue(Long id, MasterValue updated) {

        MasterValue existing = getById(id);

        if (updated.getValue() != null && !updated.getValue().isBlank()) {
            existing.setValue(updated.getValue().trim());
        }

        if (updated.getDescription() != null) {
            existing.setDescription(updated.getDescription());
        }

        if (updated.getActive() != null) {
            existing.setActive(updated.getActive());
        }

        return masterValueRepository.save(existing);
    }

    public void deleteValue(Long id) {
        MasterValue existing = getById(id);
        masterValueRepository.delete(existing);
    }

    private String normalizeType(String type) {

        if (type == null || type.isBlank()) {
            throw new RuntimeException("Master type is required");
        }

        String normalized = type.trim().toUpperCase();

        if (!ALLOWED_TYPES.contains(normalized)) {
            throw new RuntimeException("Invalid master type: " + type + ". Allowed types: " + ALLOWED_TYPES);
        }

        return normalized;
    }
}
