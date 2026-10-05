package com.projects.InventoryMangementSystem.Config;

import com.projects.InventoryMangementSystem.Entity.MasterValue;
import com.projects.InventoryMangementSystem.Repository.MasterValueRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.projects.InventoryMangementSystem.Entity.User;
import com.projects.InventoryMangementSystem.Repository.UserRepository;
import com.projects.InventoryMangementSystem.Service.RolePermissionService;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private final MasterValueRepository masterValueRepository;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RolePermissionService rolePermissionService;

    public DataInitializer(MasterValueRepository masterValueRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           RolePermissionService rolePermissionService) {
        this.masterValueRepository = masterValueRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.rolePermissionService = rolePermissionService;
    }

    private void createDefaultAdmin() {

        if (userRepository.count() > 0) {
            return;
        }

        User admin = new User();
        admin.setUsername("admin");
        admin.setName("Administrator");
        admin.setEmail("admin@example.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole("ADMIN");

        userRepository.save(admin);

        System.out.println("Created default admin account (username: admin, password: admin123)");
    }

    @Override
    public void run(String... args) {
        createDefaultMasterData();
        createDefaultAdmin();
        rolePermissionService.seedDefaults();
    }

    private void createDefaultMasterData() {

        Map<String, List<String>> defaultValues = new LinkedHashMap<>();
        defaultValues.put("DEPARTMENT", List.of("IT", "HR", "Finance", "Development"));
        defaultValues.put("DESIGNATION", List.of("Manager", "Team Lead", "Developer", "Analyst", "Intern"));
        defaultValues.put("ROLE", List.of("Admin", "Manager", "Employee", "Viewer"));
        defaultValues.put("PRODUCT_STATUS", List.of("AVAILABLE", "ASSIGNED", "MAINTENANCE", "DAMAGED", "RETURNED"));
        defaultValues.put("EMPLOYEE_STATUS", List.of("ACTIVE", "INACTIVE", "ON_LEAVE", "RESIGNED"));

        for (String type : defaultValues.keySet()) {

            boolean alreadyHasValues = !masterValueRepository.findByTypeIgnoreCaseOrderByValueAsc(type).isEmpty();

            if (alreadyHasValues) {
                continue;
            }

            for (String value : defaultValues.get(type)) {

                MasterValue masterValue = new MasterValue();
                masterValue.setType(type);
                masterValue.setValue(value);
                masterValue.setActive(true);

                masterValueRepository.save(masterValue);
            }

            System.out.println("Created default " + type + " values");
        }
    }
}
