package com.projects.InventoryMangementSystem.Controller;

import com.projects.InventoryMangementSystem.Entity.RolePermission;
import com.projects.InventoryMangementSystem.Service.RolePermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/role-access")
public class RolePermissionController {

    private final RolePermissionService service;

    public RolePermissionController(RolePermissionService service) {
        this.service = service;
    }


    @GetMapping
    public ResponseEntity<Map<String, Object>> getMatrix() {
        return ResponseEntity.ok(Map.of(
                "roles", RolePermissionService.ROLES,
                "screens", RolePermissionService.SCREENS,
                "permissions", service.getAll()
        ));
    }


    @PutMapping
    public ResponseEntity<List<RolePermission>> save(@RequestBody List<RolePermission> permissions) {
        return ResponseEntity.ok(service.saveAll(permissions));
    }


    @GetMapping("/my")
    public ResponseEntity<Map<String, Map<String, Boolean>>> myPermissions(Authentication authentication) {

        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_EMPLOYEE")
                .replace("ROLE_", "");

        return ResponseEntity.ok(service.getForRole(role));
    }
}
