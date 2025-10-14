package com.gimnasio.proyecto_gimnasio.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tarifas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tarifa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String descripcion;
    private Double precio;
    private String tipo; // mensual, anual, por_clase
}
