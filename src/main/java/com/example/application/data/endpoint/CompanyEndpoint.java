package com.example.application.data.endpoint;

import com.example.application.data.entity.Company;
import com.example.application.data.repository.CompanyRepository;
import dev.hilla.Endpoint;
import dev.hilla.Nonnull;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import javax.annotation.security.PermitAll;
import java.util.UUID;

@Endpoint
@PermitAll
public class CompanyEndpoint {

    private CompanyRepository companyRepository;

    public CompanyEndpoint(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public int count() {
        return (int) companyRepository.count();
    }

    @Nonnull
    public Page<@Nonnull Company> getCompanies(String searchText, Pageable pageable){
        if (StringUtils.isEmpty(searchText)){
            return companyRepository.findAll(pageable);
        }
        return companyRepository.findByNameContains(searchText,pageable);
    }

    @Nonnull
    public Company getCompany(UUID companyId){
        return companyRepository.findById(companyId).orElse(null);
    }

    @Nonnull
    public Company save(Company company){
        return companyRepository.save(company);
    }
}
