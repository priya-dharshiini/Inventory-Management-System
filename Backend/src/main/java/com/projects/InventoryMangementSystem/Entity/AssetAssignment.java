package com.projects.InventoryMangementSystem.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "asset_assignments")
public class AssetAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private String assignmentType;

    private String department;
    private String designation;
    private String role;

    @Column(name = "product_status")
    private String productStatus;

    @Column(name = "employee_status")
    private String employeeStatus;

    private LocalDate fromDate;
    private LocalDate toDate;

    private String status;

    private LocalDate returnedDate;

    @Column(name = "asset_condition")
    private String condition;

    private String remarks;
}
