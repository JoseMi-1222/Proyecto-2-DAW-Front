package com.gimnasio.proyecto_gimnasio.model;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(unique = true)
    private String email;

    private String password;
    private String tipoUsuario; // "cliente", "admin", "entrenador"
    private String estado; // "activo","inactivo"
}
