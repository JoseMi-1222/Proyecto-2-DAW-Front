package com.gimnasio.proyecto_gimnasio.repository;

import com.gimnasio.proyecto_gimnasio.model.Rutina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RutinaRepository extends JpaRepository<Rutina, Long> {
}
