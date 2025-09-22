package com.example.projectbackend.repository;

import com.example.projectbackend.model.Appointment;
import com.example.projectbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient(User patient);

    List<Appointment> findByDoctor(User doctor);

    List<Appointment> findByPatientAndStatus(User patient, Appointment.Status status);

    List<Appointment> findByDoctorAndStatus(User doctor, Appointment.Status status);

    List<Appointment> findByDoctorAndAppointmentDateBetween(User doctor, LocalDateTime start, LocalDateTime end);

    // New methods for enhanced appointment functionality
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date AND a.timeSlot = :time")
    List<Appointment> findByDoctorIdAndAppointmentDateAndTimeSlot(@Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("time") LocalTime time);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.appointmentDate >= :date ORDER BY a.appointmentDate ASC, a.timeSlot ASC")
    List<Appointment> findUpcomingAppointmentsByPatientId(@Param("patientId") Long patientId,
            @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.appointmentDate < :date ORDER BY a.appointmentDate DESC, a.timeSlot DESC")
    List<Appointment> findPastAppointmentsByPatientId(@Param("patientId") Long patientId,
            @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate >= :date ORDER BY a.appointmentDate ASC, a.timeSlot ASC")
    List<Appointment> findUpcomingAppointmentsByDoctorId(@Param("doctorId") Long doctorId,
            @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date ORDER BY a.timeSlot ASC")
    List<Appointment> findByDoctorIdAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId")
    List<Appointment> findByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId")
    List<Appointment> findByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT a FROM Appointment a WHERE a.status = :status ORDER BY a.appointmentDate ASC, a.timeSlot ASC")
    List<Appointment> findByStatus(@Param("status") Appointment.Status status);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :startDate AND :endDate ORDER BY a.appointmentDate ASC, a.timeSlot ASC")
    List<Appointment> findByAppointmentDateBetween(@Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}