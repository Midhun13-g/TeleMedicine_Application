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
            doctorMap.put("specialization",
                    doctor.getSpecialization() != null ? doctor.getSpecialization() : "General Medicine");
            doctorMap.put("email", doctor.getEmail());
            return doctorMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(doctorList);
    }

    @PostMapping("/book")
    public ResponseEntity<Map<String, Object>> bookAppointment(@RequestBody Map<String, Object> appointmentData) {
        try {
            System.out.println("Received appointment booking request: " + appointmentData);
            
            Long patientId = Long.valueOf(appointmentData.get("patientId").toString());
            Long doctorId = Long.valueOf(appointmentData.get("doctorId").toString());
            String dateTimeStr = (String) appointmentData.get("appointmentDate");
            String symptoms = (String) appointmentData.get("symptoms");
            
            System.out.println("Parsed data - PatientId: " + patientId + ", DoctorId: " + doctorId + ", DateTime: " + dateTimeStr);
            
            User patient = userService.findById(patientId);
            User doctor = userService.findById(doctorId);
            
            System.out.println("Found patient: " + (patient != null ? patient.getName() : "null"));
            System.out.println("Found doctor: " + (doctor != null ? doctor.getName() : "null"));
            
            if (patient == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Patient not found with ID: " + patientId));
            }
            
            if (doctor == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Doctor not found with ID: " + doctorId));
            }
            
            LocalDateTime appointmentDateTime = LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            System.out.println("Parsed appointment datetime: " + appointmentDateTime);
            
            Appointment appointment = new Appointment();
            appointment.setPatient(patient);
            appointment.setDoctor(doctor);
            appointment.setAppointmentDate(appointmentDateTime.toLocalDate());
            appointment.setTimeSlot(appointmentDateTime.toLocalTime());
            appointment.setSymptoms(symptoms);
            appointment.setStatus(Appointment.Status.PENDING);
            
            System.out.println("Created appointment object");
            
            Appointment savedAppointment = appointmentService.save(appointment);
            System.out.println("Saved appointment with ID: " + savedAppointment.getId());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Appointment booked successfully",
                "appointmentId", savedAppointment.getId()
            ));
        } catch (Exception e) {
            System.err.println("Appointment booking error: " + e.getMessage());
            e.printStackTrace();
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
            if (appointment.getTimeSlot() != null) {
                appointmentMap.put("timeSlot", appointment.getTimeSlot().toString());
            }
            appointmentMap.put("status", appointment.getStatus().toString().toLowerCase());
            appointmentMap.put("symptoms", appointment.getSymptoms());
            return appointmentMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(appointmentList);
    }

    @GetMapping("/available-slots/{doctorId}")
    public ResponseEntity<List<String>> getAvailableSlots(@PathVariable Long doctorId, @RequestParam String date) {
        List<String> defaultSlots = List.of(
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
        );
        return ResponseEntity.ok(defaultSlots);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Map<String, Object>>> getDoctorAppointments(@PathVariable Long doctorId) {
        User doctor = userService.findById(doctorId);
        if (doctor == null) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Appointment> appointments = appointmentService.findByDoctor(doctor);
        List<Map<String, Object>> appointmentList = appointments.stream().map(appointment -> {
            Map<String, Object> appointmentMap = new HashMap<>();
            appointmentMap.put("id", appointment.getId());
            appointmentMap.put("patientName", appointment.getPatient().getName());
            appointmentMap.put("patientId", appointment.getPatient().getId());
            appointmentMap.put("appointmentDate", appointment.getAppointmentDate().toString());
            if (appointment.getTimeSlot() != null) {
                appointmentMap.put("timeSlot", appointment.getTimeSlot().toString());
            }
            appointmentMap.put("status", appointment.getStatus().toString().toLowerCase());
            appointmentMap.put("symptoms", appointment.getSymptoms());
            appointmentMap.put("consultationType", appointment.getConsultationType());
            appointmentMap.put("reasonForVisit", appointment.getReasonForVisit());
            return appointmentMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(appointmentList);
    }



    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable Long appointmentId, @RequestBody Map<String, String> statusData) {
        try {
            String status = statusData.get("status");
            Appointment updatedAppointment = appointmentService.updateAppointmentStatus(appointmentId, status);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Appointment status updated successfully",
                "appointment", updatedAppointment
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }



    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long appointmentId) {
        try {
            appointmentService.cancelAppointment(appointmentId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Appointment cancelled successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long appointmentId) {
        try {
            var appointment = appointmentService.findById(appointmentId);
            if (appointment.isPresent()) {
                Appointment apt = appointment.get();
                Map<String, Object> appointmentMap = new HashMap<>();
                appointmentMap.put("id", apt.getId());
                appointmentMap.put("doctorName", apt.getDoctor().getName());
                appointmentMap.put("doctorSpecialization", apt.getDoctor().getSpecialization());
                appointmentMap.put("appointmentDate", apt.getAppointmentDate().toString());
                if (apt.getTimeSlot() != null) {
                    appointmentMap.put("timeSlot", apt.getTimeSlot().toString());
                }
                appointmentMap.put("status", apt.getStatus().toString().toLowerCase());
                appointmentMap.put("symptoms", apt.getSymptoms());
                appointmentMap.put("consultationType", apt.getConsultationType());
                appointmentMap.put("reasonForVisit", apt.getReasonForVisit());
                return ResponseEntity.ok(appointmentMap);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/debug/all")
    public ResponseEntity<?> getAllAppointmentsDebug() {
        try {
            List<User> allUsers = userService.getAllUsers();
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("totalUsers", allUsers.size());
            debugInfo.put("users", allUsers.stream().map(user -> Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "role", user.getRole().toString()
            )).collect(Collectors.toList()));
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}