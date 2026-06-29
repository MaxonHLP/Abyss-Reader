package com.abyssreader.api.service;

import com.abyssreader.api.dto.catalog.BasicCatalogRequest;
import com.abyssreader.api.dto.catalog.BasicCatalogResponse;
import com.abyssreader.api.entity.Genero;
import com.abyssreader.api.repository.GeneroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GeneroService {

    private final GeneroRepository generoRepository;

    @Transactional(readOnly = true)
    public List<BasicCatalogResponse> findAll() {
        return generoRepository.findAll().stream()
                .map(genero -> new BasicCatalogResponse(genero.getId(), genero.getNombre()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BasicCatalogResponse findById(Long id) {
        Genero genero = generoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Genero no encontrado con ID: " + id));
        return new BasicCatalogResponse(genero.getId(), genero.getNombre());
    }

    @Transactional
    public BasicCatalogResponse save(BasicCatalogRequest request) {
        if (generoRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("Ya existe un Genero con ese nombre");
        }
        
        java.util.Optional<Genero> deactivated = generoRepository.findByNombreIncludingDeleted(request.getNombre());
        if (deactivated.isPresent()) {
            Genero genero = deactivated.get();
            genero.setActivo(true);
            Genero saved = generoRepository.save(genero);
            return new BasicCatalogResponse(saved.getId(), saved.getNombre());
        }

        Genero genero = new Genero();
        genero.setNombre(request.getNombre());
        Genero saved = generoRepository.save(genero);
        return new BasicCatalogResponse(saved.getId(), saved.getNombre());
    }

    @Transactional
    public BasicCatalogResponse update(Long id, BasicCatalogRequest request) {
        Genero genero = generoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Genero no encontrado con ID: " + id));
        
        if (!genero.getNombre().equalsIgnoreCase(request.getNombre()) && generoRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("Ya existe un Genero con ese nombre");
        }
        
        genero.setNombre(request.getNombre());
        Genero updated = generoRepository.save(genero);
        return new BasicCatalogResponse(updated.getId(), updated.getNombre());
    }
    @Transactional
    public void delete(Long id) {
        Genero genero = generoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Genero no encontrado con ID: " + id));
        generoRepository.delete(genero);
    }
}
