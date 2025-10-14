package com.gimnasio.proyecto_gimnasio.repository;

import com.gimnasio.proyecto_gimnasio.model.Clase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaseRepository extends JpaRepository<Clase, Long> {
}
