package com.projects.InventoryMangementSystem.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// One row = what one role may do on one screen.
@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(
        name = "role_permissions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"role", "screen"})
)
public class RolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "role", nullable = false)
    private String role;


    @Column(name = "screen", nullable = false)
    private String screen;


    private Boolean canView = false;


    private Boolean canEdit = false;
}
