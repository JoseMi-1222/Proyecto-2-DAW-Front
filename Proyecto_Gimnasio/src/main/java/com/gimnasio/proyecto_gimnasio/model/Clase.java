package com.gimnasio.proyecto_gimnasio.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "clases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Clase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private LocalDateTime horario;
    private Integer capacidad;

    // opcional: relacion con entrenador (simplificada aquí)
    private Long entrenadorId;
}
