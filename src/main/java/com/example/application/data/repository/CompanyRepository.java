package com.example.application.data.repository;

import com.example.application.data.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {

//    @Query("select c from Company c " +
//            "where lower(name) like lower(concat('%', :searchTerm, '%'))")
    Page<Company> findByNameContains(String searchTerm, Pageable pageable);

}
