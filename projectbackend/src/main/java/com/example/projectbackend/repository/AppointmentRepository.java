package com.example.projectbackend.repository;

import com.example.projectbackend.model.Appointment;
import com.example.projectbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient(User patient);
    List<Appointment> findByDoctor(User doctor);
    List<Appointment> findByPatientAndStatus(User patient, Appointment.Status status);
    List<Appointment> findByDoctorAndStatus(User doctor, Appointment.Status status);
    List<Appointment> findByDoctorAndAppointmentDateBetween(User doctor, LocalDateTime start, LocalDateTime end);
}