package com.projects.InventoryMangementSystem.Service;

import com.projects.InventoryMangementSystem.Entity.Employee;
import com.projects.InventoryMangementSystem.Repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static com.projects.InventoryMangementSystem.Util.TextSearch.isEmpty;
import static com.projects.InventoryMangementSystem.Util.TextSearch.matches;
import static com.projects.InventoryMangementSystem.Util.TextSearch.matchesAny;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public Employee createEmployee(Employee employee) {

        validateEmployee(employee);

        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (isEmpty(employee.getStatus())) {
            employee.setStatus("ACTIVE");
        }

        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }

    public Employee updateEmployee(Long id, Employee updatedEmployee) {

        Employee employee = getEmployeeById(id);

        validateEmployee(updatedEmployee);

        if (isEmpty(updatedEmployee.getStatus())) {
            throw new RuntimeException("Status is required");
        }

        employee.setEmployeeName(updatedEmployee.getEmployeeName());
        employee.setEmail(updatedEmployee.getEmail());
        employee.setPhone(updatedEmployee.getPhone());
        employee.setDepartment(updatedEmployee.getDepartment());
        employee.setDesignation(updatedEmployee.getDesignation());
        employee.setStatus(updatedEmployee.getStatus());

        return employeeRepository.save(employee);
    }

    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employeeRepository.delete(employee);
    }

    private void validateEmployee(Employee employee) {

        if (isEmpty(employee.getEmployeeName())) {
            throw new RuntimeException("Employee Name is required");
        }
        if (isEmpty(employee.getEmail())) {
            throw new RuntimeException("Email is required");
        }
        if (!employee.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new RuntimeException("Email must be a valid email address");
        }
        if (isEmpty(employee.getPhone())) {
            throw new RuntimeException("Phone is required");
        }
        if (!employee.getPhone().matches("^[0-9]{10}$")) {
            throw new RuntimeException("Phone must be exactly 10 digits");
        }
        if (isEmpty(employee.getDepartment())) {
            throw new RuntimeException("Department is required");
        }
        if (isEmpty(employee.getDesignation())) {
            throw new RuntimeException("Designation is required");
        }
    }

    public List<Employee> searchEmployees(
            String q, String id, String employeeName, String email, String phone,
            String department, String designation, String status) {

        List<Employee> result = new ArrayList<>();

        for (Employee employee : employeeRepository.findAll()) {

            if (!matches(String.valueOf(employee.getId()), id)) continue;
            if (!matches(employee.getEmployeeName(), employeeName)) continue;
            if (!matches(employee.getEmail(), email)) continue;
            if (!matches(employee.getPhone(), phone)) continue;
            if (!matches(employee.getDepartment(), department)) continue;
            if (!matches(employee.getDesignation(), designation)) continue;
            if (!matches(employee.getStatus(), status)) continue;

            boolean keywordMatch = matchesAny(q,
                    employee.getId(), employee.getEmployeeName(), employee.getEmail(),
                    employee.getPhone(), employee.getDepartment(), employee.getDesignation(),
                    employee.getStatus());

            if (keywordMatch) {
                result.add(employee);
            }
        }

        return result;
    }
}
