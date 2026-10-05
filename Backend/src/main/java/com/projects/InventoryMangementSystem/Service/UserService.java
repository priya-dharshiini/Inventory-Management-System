package com.projects.InventoryMangementSystem.Service;

import com.projects.InventoryMangementSystem.Entity.User;
import com.projects.InventoryMangementSystem.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class UserService {

    private static final List<String> ALLOWED_ROLES = Arrays.asList("ADMIN", "EMPLOYEE");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(User user) {

        validateUser(user, true);

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(user.getRole().toUpperCase());

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User updateUser(Long id, User updatedUser) {

        User user = getUserById(id);

        validateUser(updatedUser, false);

        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        user.setRole(updatedUser.getRole().toUpperCase());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    private void validateUser(User user, boolean isCreate) {

        if (user.getUsername() == null || user.getUsername().isBlank()) {
            throw new RuntimeException("Username is required");
        }

        if (user.getName() == null || user.getName().isBlank()) {
            throw new RuntimeException("Name is required");
        }

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (!user.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new RuntimeException("Email must be a valid email address");
        }

        if (isCreate && (user.getPassword() == null || user.getPassword().isBlank())) {
            throw new RuntimeException("Password is required");
        }

        if (user.getRole() == null || !ALLOWED_ROLES.contains(user.getRole().toUpperCase())) {
            throw new RuntimeException("Role must be ADMIN or EMPLOYEE");
        }
    }
}
