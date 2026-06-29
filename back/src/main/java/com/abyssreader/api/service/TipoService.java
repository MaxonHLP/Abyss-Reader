package com.abyssreader.api.service;

import com.abyssreader.api.dto.catalog.BasicCatalogRequest;
import com.abyssreader.api.dto.catalog.BasicCatalogResponse;
import com.abyssreader.api.entity.Tipo;
import com.abyssreader.api.repository.TipoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TipoService {

    private final TipoRepository tipoRepository;

    @Transactional(readOnly = true)
    public List<BasicCatalogResponse> findAll() {
        return tipoRepository.findAll().stream()
                .map(tipo -> new BasicCatalogResponse(tipo.getId(), tipo.getNombre()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BasicCatalogResponse findById(Long id) {
        Tipo tipo = tipoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo no encontrado con ID: " + id));
        return new BasicCatalogResponse(tipo.getId(), tipo.getNombre());
    }

    @Transactional
    public BasicCatalogResponse save(BasicCatalogRequest request) {
        if (tipoRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("Ya existe un Tipo con ese nombre");
        }
        
        java.util.Optional<Tipo> deactivated = tipoRepository.findByNombreIncludingDeleted(request.getNombre());
        if (deactivated.isPresent()) {
            Tipo tipo = deactivated.get();
            tipo.setActivo(true);
            Tipo saved = tipoRepository.save(tipo);
            return new BasicCatalogResponse(saved.getId(), saved.getNombre());
        }

        Tipo tipo = new Tipo();
        tipo.setNombre(request.getNombre());
        Tipo saved = tipoRepository.save(tipo);
        return new BasicCatalogResponse(saved.getId(), saved.getNombre());
    }

    @Transactional
    public BasicCatalogResponse update(Long id, BasicCatalogRequest request) {
        Tipo tipo = tipoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo no encontrado con ID: " + id));
        
        if (!tipo.getNombre().equalsIgnoreCase(request.getNombre()) && tipoRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("Ya existe un Tipo con ese nombre");
        }
        
        tipo.setNombre(request.getNombre());
        Tipo updated = tipoRepository.save(tipo);
        return new BasicCatalogResponse(updated.getId(), updated.getNombre());
    }
    @Transactional
    public void delete(Long id) {
        Tipo tipo = tipoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo no encontrado con ID: " + id));
        tipoRepository.delete(tipo);
    }
}
