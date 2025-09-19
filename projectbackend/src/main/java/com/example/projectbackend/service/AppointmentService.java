package com.example.projectbackend.service;

import com.example.projectbackend.model.Appointment;
import com.example.projectbackend.model.User;
import com.example.projectbackend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    public Appointment save(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }
    
    public List<Appointment> findByPatient(User patient) {
        return appointmentRepository.findByPatient(patient);
    }
    
    public List<Appointment> findByDoctor(User doctor) {
        return appointmentRepository.findByDoctor(doctor);
    }
    
    public List<Appointment> findByPatientAndStatus(User patient, Appointment.Status status) {
        return appointmentRepository.findByPatientAndStatus(patient, status);
    }
    
    public List<Appointment> findByDoctorAndStatus(User doctor, Appointment.Status status) {
        return appointmentRepository.findByDoctorAndStatus(doctor, status);
    }
    
    public List<Appointment> findByDoctorAndDateRange(User doctor, LocalDateTime start, LocalDateTime end) {
        return appointmentRepository.findByDoctorAndAppointmentDateBetween(doctor, start, end);
    }
}