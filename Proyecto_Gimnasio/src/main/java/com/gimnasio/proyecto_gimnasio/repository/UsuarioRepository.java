package com.gimnasio.proyecto_gimnasio.repository;

import com.gimnasio.proyecto_gimnasio.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Ejemplo de método personalizado:
    Usuario findByEmail(String email);
}


