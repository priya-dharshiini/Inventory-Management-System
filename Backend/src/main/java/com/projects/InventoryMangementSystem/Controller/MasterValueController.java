package com.projects.InventoryMangementSystem.Controller;

import com.projects.InventoryMangementSystem.Entity.MasterValue;
import com.projects.InventoryMangementSystem.Service.MasterValueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/masters")
public class MasterValueController {

    private final MasterValueService masterValueService;

    public MasterValueController(MasterValueService masterValueService) {
        this.masterValueService = masterValueService;
    }

    @PostMapping("/{type}")
    public ResponseEntity<MasterValue> createValue(@PathVariable String type, @RequestBody MasterValue masterValue) {
        MasterValue saved = masterValueService.createValue(type, masterValue);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/{type}")
    public ResponseEntity<List<MasterValue>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(masterValueService.getByType(type));
    }

    @GetMapping("/entry/{id}")
    public ResponseEntity<MasterValue> getById(@PathVariable Long id) {
        return ResponseEntity.ok(masterValueService.getById(id));
    }

    @PutMapping("/{type}/{id}")
    public ResponseEntity<MasterValue> updateValue(
            @PathVariable String type, @PathVariable Long id, @RequestBody MasterValue masterValue) {

        return ResponseEntity.ok(masterValueService.updateValue(id, masterValue));
    }

    @DeleteMapping("/{type}/{id}")
    public ResponseEntity<String> deleteValue(@PathVariable String type, @PathVariable Long id) {
        masterValueService.deleteValue(id);
        return ResponseEntity.ok("Master value deleted successfully");
    }
}
