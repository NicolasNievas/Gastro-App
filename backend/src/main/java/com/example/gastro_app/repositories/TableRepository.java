package com.example.gastro_app.repositories;

import com.example.gastro_app.entities.TableEntity;
import com.example.gastro_app.enums.MesaStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TableRepository extends JpaRepository<TableEntity, Long> {
    List<TableEntity> findAllByOrderByNumberAsc();
    List<TableEntity> findByStateNotOrderByNumberAsc(MesaStatus state);
    boolean existsByNumber(Integer number);
    boolean existsByNumberAndIdNot(Integer number, Long id);
    Optional<TableEntity> findByNumber(Integer number);
}
