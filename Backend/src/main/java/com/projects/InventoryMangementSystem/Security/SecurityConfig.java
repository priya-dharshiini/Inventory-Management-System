package com.projects.InventoryMangementSystem.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.projects.InventoryMangementSystem.Service.RolePermissionService;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    private final RolePermissionService rolePermissionService;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, RolePermissionService rolePermissionService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.rolePermissionService = rolePermissionService;
    }

    // Admin can always write. Other roles can write only on screens where
    // the Admin ticked "Edit" in the Role Access screen.
    private AuthorizationManager<RequestAuthorizationContext> writeAccess() {
        return (authSupplier, context) -> {

            Authentication auth = authSupplier.get();

            if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
                return new AuthorizationDecision(false);
            }

            String role = auth.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("")
                    .replace("ROLE_", "");

            boolean allowed = rolePermissionService.canWrite(role, context.getRequest().getRequestURI());

            return new AuthorizationDecision(allowed);
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        // Not logged in / bad token -> 401 (frontend logs the user out)
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(401);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"message\":\"Please log in again\"}");
                        })
                        // Logged in but not an Admin -> 403
                        .accessDeniedHandler((req, res, e) -> {
                            res.setStatus(403);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"message\":\"You do not have permission to do this\"}");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Spring forwards controller exceptions to /error. If /error is not
                        // open, the real error (400/409/...) is hidden behind a fake 403.
                        .requestMatchers("/error").permitAll()
                        // Login must be reachable before anyone is logged in
                        .requestMatchers("/api/auth/**").permitAll()
                        // Every logged-in user can ask what they themselves may access
                        .requestMatchers(HttpMethod.GET, "/api/role-access/my").authenticated()
                        // Only an Admin may change who can access what
                        .requestMatchers("/api/role-access/**").hasRole("ADMIN")
                        // Only an Admin may view or manage login accounts
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        // Everyone who is logged in (Admin or Employee) can view data
                        .requestMatchers(HttpMethod.GET, "/api/**").authenticated()
                        // Create / change / delete: Admin, or any role given "Edit" on that screen
                        .requestMatchers(HttpMethod.POST, "/api/**").access(writeAccess())
                        .requestMatchers(HttpMethod.PUT, "/api/**").access(writeAccess())
                        .requestMatchers(HttpMethod.DELETE, "/api/**").access(writeAccess())
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
