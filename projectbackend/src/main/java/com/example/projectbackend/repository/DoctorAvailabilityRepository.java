package com.example.projectbackend.repository;

import com.example.projectbackend.model.DoctorAvailability;
import com.example.projectbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorAndDate(User doctor, LocalDate date);

    List<DoctorAvailability> findByDoctorAndDateBetween(User doctor, LocalDate startDate, LocalDate endDate);

    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId AND da.date = :date")
    List<DoctorAvailability> findByDoctorIdAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId AND da.date >= :date AND da.isAvailable = true")
    List<DoctorAvailability> findAvailableSlotsByDoctorFromDate(@Param("doctorId") Long doctorId,
            @Param("date") LocalDate date);

    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId AND da.dayOfWeek = :dayOfWeek AND da.isAvailable = true")
    List<DoctorAvailability> findByDoctorIdAndDayOfWeek(@Param("doctorId") Long doctorId,
            @Param("dayOfWeek") String dayOfWeek);

    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId AND da.date = :date AND da.startTime <= :time AND da.endTime > :time AND da.isAvailable = true")
    List<DoctorAvailability> findAvailableAtSpecificTime(@Param("doctorId") Long doctorId,
            @Param("date") LocalDate date, @Param("time") LocalTime time);

    List<DoctorAvailability> findByDoctorAndIsAvailable(User doctor, boolean isAvailable);

    @Query("SELECT da FROM DoctorAvailability da WHERE da.date = :date AND da.isAvailable = true")
    List<DoctorAvailability> findAllAvailableOnDate(@Param("date") LocalDate date);
}