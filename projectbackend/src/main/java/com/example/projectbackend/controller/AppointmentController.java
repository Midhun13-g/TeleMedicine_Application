package com.example.projectbackend.controller;

import com.example.projectbackend.model.Appointment;
import com.example.projectbackend.model.User;
import com.example.projectbackend.service.AppointmentService;
import com.example.projectbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;
    
    @Autowired
    private UserService userService;

    @GetMapping("/doctors")
    public ResponseEntity<List<Map<String, Object>>> getDoctors() {
        List<User> doctors = userService.findByRole(User.Role.DOCTOR);
        List<Map<String, Object>> doctorList = doctors.stream().map(doctor -> {
            Map<String, Object> doctorMap = new HashMap<>();
            doctorMap.put("id", doctor.getId());
            doctorMap.put("name", doctor.getName());
            doctorMap.put("specialization", doctor.getSpecialization() != null ? doctor.getSpecialization() : "General Medicine");
            doctorMap.put("email", doctor.getEmail());
            return doctorMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(doctorList);
    }

    @PostMapping("/book")
    public ResponseEntity<Map<String, Object>> bookAppointment(@RequestBody Map<String, Object> appointmentData) {
        try {
            Long patientId = Long.valueOf(appointmentData.get("patientId").toString());
            Long doctorId = Long.valueOf(appointmentData.get("doctorId").toString());
            String dateTimeStr = (String) appointmentData.get("appointmentDate");
            String symptoms = (String) appointmentData.get("symptoms");
            
            User patient = userService.findById(patientId);
            User doctor = userService.findById(doctorId);
            
            if (patient == null || doctor == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid patient or doctor"));
            }
            
            LocalDateTime appointmentDate = LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            
            Appointment appointment = new Appointment();
            appointment.setPatient(patient);
            appointment.setDoctor(doctor);
            appointment.setAppointmentDate(appointmentDate);
            appointment.setSymptoms(symptoms);
            
            Appointment savedAppointment = appointmentService.save(appointment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Appointment booked successfully");
            response.put("appointmentId", savedAppointment.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Booking failed: " + e.getMessage()));
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Map<String, Object>>> getPatientAppointments(@PathVariable Long patientId) {
        User patient = userService.findById(patientId);
        if (patient == null) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Appointment> appointments = appointmentService.findByPatient(patient);
        List<Map<String, Object>> appointmentList = appointments.stream().map(appointment -> {
            Map<String, Object> appointmentMap = new HashMap<>();
            appointmentMap.put("id", appointment.getId());
            appointmentMap.put("doctorName", appointment.getDoctor().getName());
            appointmentMap.put("doctorSpecialization", appointment.getDoctor().getSpecialization());
            appointmentMap.put("appointmentDate", appointment.getAppointmentDate().toString());
            appointmentMap.put("status", appointment.getStatus().toString().toLowerCase());
            appointmentMap.put("symptoms", appointment.getSymptoms());
            return appointmentMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(appointmentList);
    }

    @GetMapping("/available-slots/{doctorId}")
    public ResponseEntity<List<String>> getAvailableSlots(@PathVariable Long doctorId, @RequestParam String date) {
        // Generate available time slots (simplified)
        List<String> slots = List.of(
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
        );
        return ResponseEntity.ok(slots);
    }
}