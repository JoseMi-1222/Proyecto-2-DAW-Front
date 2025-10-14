package com.gimnasio.proyecto_gimnasio.repository;

import com.gimnasio.proyecto_gimnasio.model.Dieta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DietaRepository extends JpaRepository<Dieta, Long> {
}

