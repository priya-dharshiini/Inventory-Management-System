package com.projects.InventoryMangementSystem.Controller;

import com.projects.InventoryMangementSystem.Entity.AssetAssignment;
import com.projects.InventoryMangementSystem.Service.AssetAssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssetAssignmentController {

    private final AssetAssignmentService assignmentService;

    public AssetAssignmentController(AssetAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping("/createAssignments")
    public ResponseEntity<AssetAssignment> createAssignment(
            @RequestParam Long employeeId,
            @RequestParam Long productId,
            @RequestParam String assignmentType,
            @RequestParam LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) String remarks,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String designation,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String productStatus,
            @RequestParam(required = false) String employeeStatus) {

        AssetAssignment assignment = assignmentService.createAssignment(
                employeeId, productId, assignmentType, fromDate, toDate, remarks,
                department, designation, role, productStatus, employeeStatus
        );

        return new ResponseEntity<>(assignment, HttpStatus.CREATED);
    }

    @GetMapping("/getAllAssignments")
    public ResponseEntity<List<AssetAssignment>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @GetMapping("/getAllAssignmentsById/{id}")
    public ResponseEntity<AssetAssignment> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @PostMapping("/createAsignments/{id}/return")
    public ResponseEntity<AssetAssignment> returnAsset(
            @PathVariable Long id,
            @RequestParam String condition,
            @RequestParam(required = false) String remarks) {

        return ResponseEntity.ok(assignmentService.returnAsset(id, condition, remarks));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AssetAssignment>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(assignmentService.getByStatus(status));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<AssetAssignment>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(assignmentService.getByAssignmentType(type));
    }

    @GetMapping("/search")
    public ResponseEntity<List<AssetAssignment>> searchAssignments(
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String serialNumber,
            @RequestParam(required = false) String assignmentType,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String status) {

        List<AssetAssignment> assignments = assignmentService.searchAssignments(
                id, employeeName, department, productName, model,
                serialNumber, assignmentType, fromDate, toDate, status
        );

        return ResponseEntity.ok(assignments);
    }
}
