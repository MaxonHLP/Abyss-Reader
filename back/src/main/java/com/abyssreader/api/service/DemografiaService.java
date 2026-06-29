package com.abyssreader.api.service;

import com.abyssreader.api.dto.catalog.BasicCatalogRequest;
import com.abyssreader.api.dto.catalog.BasicCatalogResponse;
import com.abyssreader.api.entity.Demografia;
import com.abyssreader.api.repository.DemografiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DemografiaService {

    private final DemografiaRepository demografiaRepository;

    @Transactional(readOnly = true)
    public List<BasicCatalogResponse> findAll() {
        return demografiaRepository.findAll().stream()
                .map(demografia -> new BasicCatalogResponse(demografia.getId(), demografia.getNombre()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BasicCatalogResponse findById(Long id) {
        Demografia demografia = demografiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demografia no encontrada con ID: " + id));
        return new BasicCatalogResponse(demografia.getId(), demografia.getNombre());
    }

    @Transactional
    public BasicCatalogResponse save(BasicCatalogRequest request) {
        if (demografiaRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("Ya existe una Demografía con ese nombre");
        }
        
        java.util.Optional<Demografia> deactivated = demografiaRepository.findByNombreIncludingDeleted(request.getNombre());
        if (deactivated.isPresent()) {
            Demografia demografia = deactivated.get();
            demografia.setActivo(true);
            Demografia saved = demografiaRepository.save(demografia);
            return new BasicCatalogResponse(saved.getId(), saved.getNombre());
        }

        Demografia demografia = new Demografia();
        demografia.setNombre(request.getNombre());
        Demografia saved = demografiaRepository.save(demografia);
        return new BasicCatalogResponse(saved.getId(), saved.getNombre());
    }

    @Transactional
    public BasicCatalogResponse update(Long id, BasicCatalogRequest request) {
        Demografia demografia = demografiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demografia no encontrada con ID: " + id));
        
        if (!demografia.getNombre().equalsIgnoreCase(request.getNombre()) && demografiaRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("Ya existe una Demografia con ese nombre");
        }
        
        demografia.setNombre(request.getNombre());
        Demografia updated = demografiaRepository.save(demografia);
        return new BasicCatalogResponse(updated.getId(), updated.getNombre());
    }
    @Transactional
    public void delete(Long id) {
        Demografia demografia = demografiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demografia no encontrada con ID: " + id));
        demografiaRepository.delete(demografia);
    }
}
