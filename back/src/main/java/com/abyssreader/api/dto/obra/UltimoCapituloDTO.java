package com.abyssreader.api.dto.obra;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UltimoCapituloDTO {
    private double numero;
    private LocalDateTime createdAt;
}
