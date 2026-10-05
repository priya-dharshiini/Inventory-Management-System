package com.projects.InventoryMangementSystem.Repository;

import com.projects.InventoryMangementSystem.Entity.AssetAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long> {

    List<AssetAssignment> findByStatus(String status);

    List<AssetAssignment> findByAssignmentType(String assignmentType);
}
