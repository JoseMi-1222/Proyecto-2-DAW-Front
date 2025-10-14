package com.gimnasio.proyecto_gimnasio.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "pagos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long usuarioId;
    private Long tarifaId;
    private LocalDate fechaPago;
    private Double monto;
    private String metodo; // tarjeta, paypal, efectivo
    private String estado; // completado, pendiente, fallido
}
