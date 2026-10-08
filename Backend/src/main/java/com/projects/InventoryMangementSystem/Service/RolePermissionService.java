package com.projects.InventoryMangementSystem.Service;

import com.projects.InventoryMangementSystem.Entity.RolePermission;
import com.projects.InventoryMangementSystem.Repository.RolePermissionRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RolePermissionService {

    public static final String ADMIN = "ADMIN";

    public static final List<String> ROLES = List.of("ADMIN", "EMPLOYEE");

    public static final List<String> SCREENS = List.of(
            "PRODUCTS", "EMPLOYEES", "ASSET_ASSIGNMENT", "ASSIGNMENT_REGISTER", "MASTER_DATA"
    );

    private final RolePermissionRepository repository;

    public RolePermissionService(RolePermissionRepository repository) {
        this.repository = repository;
    }


    public void seedDefaults() {

        for (String role : ROLES) {
            for (String screen : SCREENS) {

                if (repository.findByRoleAndScreen(role, screen).isPresent()) {
                    continue;
                }

                boolean isAdmin = ADMIN.equals(role);

                RolePermission p = new RolePermission();
                p.setRole(role);
                p.setScreen(screen);
                p.setCanView(true);
                p.setCanEdit(isAdmin);
                repository.save(p);
            }
        }
    }

    public List<RolePermission> getAll() {
        List<RolePermission> all = repository.findAll();
        all.sort(Comparator.comparing(RolePermission::getRole)
                .thenComparingInt(p -> SCREENS.indexOf(p.getScreen())));
        return all;
    }


    public Map<String, Map<String, Boolean>> getForRole(String role) {

        Map<String, Map<String, Boolean>> result = new LinkedHashMap<>();

        for (String screen : SCREENS) {

            boolean admin = ADMIN.equalsIgnoreCase(role);

            Optional<RolePermission> p = repository.findByRoleAndScreen(role.toUpperCase(), screen);

            Map<String, Boolean> flags = new LinkedHashMap<>();
            flags.put("canView", admin || p.map(x -> Boolean.TRUE.equals(x.getCanView())).orElse(false));
            flags.put("canEdit", admin || p.map(x -> Boolean.TRUE.equals(x.getCanEdit())).orElse(false));
            result.put(screen, flags);
        }

        return result;
    }
    public List<RolePermission> saveAll(List<RolePermission> incoming) {

        for (RolePermission in : incoming) {

            if (in.getRole() == null || in.getScreen() == null) {
                throw new RuntimeException("Role and screen are required");
            }

            String role = in.getRole().toUpperCase();
            String screen = in.getScreen().toUpperCase();

            if (!ROLES.contains(role) || !SCREENS.contains(screen)) {
                throw new RuntimeException("Unknown role or screen: " + role + " / " + screen);
            }


            if (ADMIN.equals(role)) {
                continue;
            }

            RolePermission row = repository.findByRoleAndScreen(role, screen).orElseGet(() -> {
                RolePermission p = new RolePermission();
                p.setRole(role);
                p.setScreen(screen);
                return p;
            });

            boolean canEdit = Boolean.TRUE.equals(in.getCanEdit());

            boolean canView = Boolean.TRUE.equals(in.getCanView()) || canEdit;

            row.setCanView(canView);
            row.setCanEdit(canEdit);
            repository.save(row);
        }

        return getAll();
    }


    public boolean canWrite(String role, String path) {

        if (role == null || role.isBlank()) {
            return false;
        }

        if (ADMIN.equalsIgnoreCase(role)) {
            return true;
        }

        List<String> screens = screensForPath(path);

        for (String screen : screens) {
            boolean allowed = repository.findByRoleAndScreen(role.toUpperCase(), screen)
                    .map(p -> Boolean.TRUE.equals(p.getCanEdit()))
                    .orElse(false);
            if (allowed) {
                return true;
            }
        }

        return false;
    }

    private List<String> screensForPath(String path) {

        if (path.startsWith("/api/products")) return List.of("PRODUCTS");
        if (path.startsWith("/api/employees")) return List.of("EMPLOYEES");
        if (path.startsWith("/api/masters")) return List.of("MASTER_DATA");
        if (path.startsWith("/api/assignments")) return List.of("ASSET_ASSIGNMENT", "ASSIGNMENT_REGISTER");

        return List.of();
    }
}
