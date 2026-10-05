package com.projects.InventoryMangementSystem.Repository;

import com.projects.InventoryMangementSystem.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySerialNumber(String serialNumber);
}
