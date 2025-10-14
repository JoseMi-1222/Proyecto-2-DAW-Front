package com.gimnasio.proyecto_gimnasio.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rutinas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rutina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private String nivel; // Principiante, Intermedio, Avanzado

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}
