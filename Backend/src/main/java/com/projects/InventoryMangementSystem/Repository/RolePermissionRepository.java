package com.projects.InventoryMangementSystem.Repository;

import com.projects.InventoryMangementSystem.Entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    List<RolePermission> findByRole(String role);

    Optional<RolePermission> findByRoleAndScreen(String role, String screen);
}
