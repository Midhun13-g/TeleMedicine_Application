package com.example.projectbackend.repository;

import com.example.projectbackend.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByReporterIdOrderByTimestampDesc(String reporterId);
    List<Report> findByStatusOrderByTimestampDesc(String status);
    List<Report> findAllByOrderByTimestampDesc();
}