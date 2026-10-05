package com.projects.InventoryMangementSystem.Service;

import com.projects.InventoryMangementSystem.Entity.AssetAssignment;
import com.projects.InventoryMangementSystem.Entity.Employee;
import com.projects.InventoryMangementSystem.Entity.Product;
import com.projects.InventoryMangementSystem.Repository.AssetAssignmentRepository;
import com.projects.InventoryMangementSystem.Repository.EmployeeRepository;
import com.projects.InventoryMangementSystem.Repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class AssetAssignmentService {

    private final AssetAssignmentRepository assignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final ProductRepository productRepository;

    public AssetAssignmentService(
            AssetAssignmentRepository assignmentRepository,
            EmployeeRepository employeeRepository,
            ProductRepository productRepository) {

        this.assignmentRepository = assignmentRepository;
        this.employeeRepository = employeeRepository;
        this.productRepository = productRepository;
    }

    public AssetAssignment createAssignment(
            Long employeeId, Long productId, String assignmentType,
            LocalDate fromDate, LocalDate toDate, String remarks,
            String department, String designation, String role,
            String productStatus, String employeeStatus) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        if (!"AVAILABLE".equalsIgnoreCase(product.getStatus())) {
            throw new RuntimeException("Product is not available. Current status: " + product.getStatus());
        }

        if (assignmentType == null || assignmentType.isBlank()) {
            throw new RuntimeException("Assignment type is required");
        }

        if ("TEMPORARY".equalsIgnoreCase(assignmentType)) {

            if (fromDate == null || toDate == null) {
                throw new RuntimeException("Temporary assignment requires From Date and To Date");
            }

            if (!toDate.isAfter(fromDate)) {
                throw new RuntimeException("To Date must be after From Date");
            }

        } else if ("PERMANENT".equalsIgnoreCase(assignmentType)) {

            if (fromDate == null) {
                throw new RuntimeException("Permanent assignment requires From Date");
            }

            toDate = null;

        } else {
            throw new RuntimeException("Assignment type must be TEMPORARY or PERMANENT");
        }

        AssetAssignment assignment = new AssetAssignment();
        assignment.setEmployee(employee);
        assignment.setProduct(product);
        assignment.setAssignmentType(assignmentType.toUpperCase());
        assignment.setFromDate(fromDate);
        assignment.setToDate(toDate);
        assignment.setStatus("ACTIVE");
        assignment.setRemarks(remarks);

        assignment.setDepartment(isEmpty(department) ? employee.getDepartment() : department);
        assignment.setDesignation(isEmpty(designation) ? employee.getDesignation() : designation);
        assignment.setRole(role);

        assignment.setProductStatus(isEmpty(productStatus) ? product.getStatus() : productStatus);
        assignment.setEmployeeStatus(isEmpty(employeeStatus) ? employee.getStatus() : employeeStatus);

        product.setStatus("ASSIGNED");
        productRepository.save(product);

        return assignmentRepository.save(assignment);
    }

    private boolean isEmpty(String value) {
        return value == null || value.isBlank();
    }

    public List<AssetAssignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    public AssetAssignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));
    }

    public AssetAssignment returnAsset(Long id, String condition, String remarks) {

        AssetAssignment assignment = getAssignmentById(id);

        if (!"ACTIVE".equalsIgnoreCase(assignment.getStatus())) {
            throw new RuntimeException("Asset is already returned");
        }

        assignment.setStatus("RETURNED");
        assignment.setReturnedDate(LocalDate.now());
        assignment.setCondition(condition);
        assignment.setRemarks(remarks);

        Product product = assignment.getProduct();
        product.setStatus("AVAILABLE");
        productRepository.save(product);

        return assignmentRepository.save(assignment);
    }

    public List<AssetAssignment> getByStatus(String status) {
        return assignmentRepository.findByStatus(status);
    }

    public List<AssetAssignment> getByAssignmentType(String assignmentType) {
        return assignmentRepository.findByAssignmentType(assignmentType);
    }

    public List<AssetAssignment> searchAssignments(
            String id, String employeeName, String department, String productName,
            String model, String serialNumber, String assignmentType,
            String fromDate, String toDate, String status) {

        List<AssetAssignment> result = new ArrayList<>();

        for (AssetAssignment assignment : assignmentRepository.findAll()) {

            Employee employee = assignment.getEmployee();
            Product product = assignment.getProduct();

            if (!matches(String.valueOf(assignment.getId()), id)) continue;
            if (!matches(employee == null ? "" : employee.getEmployeeName(), employeeName)) continue;
            if (!matches(employee == null ? "" : employee.getDepartment(), department)) continue;
            if (!matches(product == null ? "" : product.getProductName(), productName)) continue;
            if (!matches(product == null ? "" : product.getModel(), model)) continue;
            if (!matches(product == null ? "" : product.getSerialNumber(), serialNumber)) continue;
            if (!matches(assignment.getAssignmentType(), assignmentType)) continue;
            if (!matches(assignment.getFromDate() == null ? "" : assignment.getFromDate().toString(), fromDate)) continue;
            if (!matches(assignment.getToDate() == null ? "" : assignment.getToDate().toString(), toDate)) continue;
            if (!matches(assignment.getStatus(), status)) continue;

            result.add(assignment);
        }

        return result;
    }

    private boolean matches(String fieldValue, String searchText) {

        if (searchText == null || searchText.isBlank()) {
            return true;
        }

        if (fieldValue == null) {
            return false;
        }

        return fieldValue.toLowerCase().contains(searchText.trim().toLowerCase());
    }
}
