package com.projects.InventoryMangementSystem.Service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    // Checks the username/password against the database and returns a
    // JWT token plus the user's role if they are correct.
    public Map<String, String> login(String username, String password) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        String token = jwtService.generateToken(authentication.getName());

        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_EMPLOYEE")
                .replace("ROLE_", "");

        Map<String, String> result = new HashMap<>();
        result.put("token", token);
        result.put("username", authentication.getName());
        result.put("role", role);

        return result;
    }
}
