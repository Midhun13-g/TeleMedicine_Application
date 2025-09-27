package com.example.projectbackend.repository;

import com.example.projectbackend.model.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
    List<HealthRecord> findByPatientIdOrderByRecordDateDesc(Long patientId);
    List<HealthRecord> findByPatientIdAndRecordType(Long patientId, String recordType);
}