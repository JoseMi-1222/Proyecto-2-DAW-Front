package com.gimnasio.proyecto_gimnasio.repository;

import com.gimnasio.proyecto_gimnasio.model.Tarifa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TarifaRepository extends JpaRepository<Tarifa, Long> {
}
