package com.abyssreader.api.repository.specification;

import com.abyssreader.api.entity.Genero;
import com.abyssreader.api.entity.Obra;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class ObraSpecification {

    public static Specification<Obra> conTituloLike(String titulo) {
        return (root, query, cb) -> {
            if (titulo == null || titulo.trim().isEmpty()) {
                return null;
            }
            return cb.like(cb.lower(root.get("titulo")), "%" + titulo.toLowerCase() + "%");
        };
    }

    public static Specification<Obra> conTipos(List<Long> tiposIds) {
        return (root, query, cb) -> {
            if (tiposIds == null || tiposIds.isEmpty()) {
                return null;
            }
            return root.get("tipo").get("id").in(tiposIds);
        };
    }

    public static Specification<Obra> conDemografias(List<Long> demografiasIds) {
        return (root, query, cb) -> {
            if (demografiasIds == null || demografiasIds.isEmpty()) {
                return null;
            }
            return root.get("demografia").get("id").in(demografiasIds);
        };
    }

    public static Specification<Obra> conGeneros(List<Long> generosIds) {
        return (root, query, cb) -> {
            if (generosIds == null || generosIds.isEmpty()) {
                return null;
            }
            
            jakarta.persistence.criteria.Predicate finalPredicate = cb.conjunction();
            
            for (Long generoId : generosIds) {
                jakarta.persistence.criteria.Subquery<Long> subquery = query.subquery(Long.class);
                jakarta.persistence.criteria.Root<Obra> correlatedObra = subquery.correlate(root);
                Join<Obra, Genero> subqueryJoin = correlatedObra.join("generos");
                
                subquery.select(cb.literal(1L))
                        .where(cb.equal(subqueryJoin.get("id"), generoId));
                
                finalPredicate = cb.and(finalPredicate, cb.exists(subquery));
            }
            
            return finalPredicate;
        };
    }

    public static Specification<Obra> conEstados(List<com.abyssreader.api.util.EstadoObra> estados) {
        return (root, query, cb) -> {
            if (estados == null || estados.isEmpty()) {
                return null;
            }
            return root.get("estado").in(estados);
        };
    }
}
