package com.gimnasio.proyecto_gimnasio.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dietas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dieta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String tipo; // Ejemplo: "Baja en calorías", "Alta en proteínas"
    private String descripcion;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}

