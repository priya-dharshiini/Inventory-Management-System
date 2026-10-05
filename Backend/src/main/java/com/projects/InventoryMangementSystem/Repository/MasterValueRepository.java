package com.projects.InventoryMangementSystem.Repository;

import com.projects.InventoryMangementSystem.Entity.MasterValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MasterValueRepository extends JpaRepository<MasterValue, Long> {

    List<MasterValue> findByTypeIgnoreCaseOrderByValueAsc(String type);

    boolean existsByTypeIgnoreCaseAndValueIgnoreCase(String type, String value);
}
