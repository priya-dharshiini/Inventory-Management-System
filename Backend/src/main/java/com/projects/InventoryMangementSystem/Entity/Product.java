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
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productName;
    private String productType;
    private String brand;
    private String model;

    @Column(unique = true, nullable = false)
    private String serialNumber;

    private LocalDate purchaseDate;
    private Double price;
    private String status;
}
