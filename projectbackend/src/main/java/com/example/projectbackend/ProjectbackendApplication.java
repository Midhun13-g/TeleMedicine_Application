package com.example.projectbackend;

import com.example.projectbackend.model.User;
import com.example.projectbackend.model.Pharmacy;
import com.example.projectbackend.model.Medicine;
import com.example.projectbackend.service.UserService;
import com.example.projectbackend.service.PharmacyService;
import com.example.projectbackend.service.MedicineService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ProjectbackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProjectbackendApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(UserService userService, PharmacyService pharmacyService, MedicineService medicineService) {
		return args -> {
			// Check if data already exists
			if (userService.getAllUsers().isEmpty()) {
				System.out.println("Database is empty. Creating initial test data...");

				// Create test users
				User patient1 = new User("patient1@test.com", "password", "Ramesh Kumar", User.Role.PATIENT);
				patient1.setPhone("+91-9876543210");
				patient1.setAddress("123 Main St, Delhi");
				userService.save(patient1);
				System.out.println("Created patient: Ramesh Kumar with ID: " + patient1.getId());

				User patient2 = new User("patient2@test.com", "password", "Sunita Devi", User.Role.PATIENT);
				patient2.setPhone("+91-9876543211");
				patient2.setAddress("456 Park Ave, Mumbai");
				userService.save(patient2);
				System.out.println("Created patient: Sunita Devi with ID: " + patient2.getId());

				User patient3 = new User("patient3@test.com", "password", "Kiran Patel", User.Role.PATIENT);
				patient3.setPhone("+91-9876543212");
				patient3.setAddress("789 Oak St, Bangalore");
				userService.save(patient3);
				System.out.println("Created patient: Kiran Patel with ID: " + patient3.getId());

				User doctor1 = new User("doctor1@test.com", "password", "Dr. Rachit Sharma", User.Role.DOCTOR);
				doctor1.setPhone("+91-9876543213");
				doctor1.setSpecialization("General Medicine");
				doctor1.setExperience("5+ years");
				doctor1.setLicenseNumber("MED12345");
				userService.save(doctor1);
				System.out.println("Created doctor: Dr. Rachit Sharma with ID: " + doctor1.getId());

				User doctor2 = new User("doctor2@test.com", "password", "Dr. Priya Singh", User.Role.DOCTOR);
				doctor2.setPhone("+91-9876543214");
				doctor2.setSpecialization("Cardiology");
				doctor2.setExperience("8+ years");
				doctor2.setLicenseNumber("MED12346");
				userService.save(doctor2);
				System.out.println("Created doctor: Dr. Priya Singh with ID: " + doctor2.getId());

				User doctor3 = new User("doctor3@test.com", "password", "Dr. Amit Patel", User.Role.DOCTOR);
				doctor3.setPhone("+91-9876543215");
				doctor3.setSpecialization("Dermatology");
				doctor3.setExperience("6+ years");
				doctor3.setLicenseNumber("MED12347");
				userService.save(doctor3);
				System.out.println("Created doctor: Dr. Amit Patel with ID: " + doctor3.getId());

				// Create pharmacy users
				User pharmacy1 = new User("pharmacy1@test.com", "password", "Apollo Pharmacy Manager", User.Role.PHARMACY);
				pharmacy1.setPhone("+91-9876543216");
				pharmacy1.setPharmacyName("Apollo Pharmacy");
				pharmacy1.setAddress("123 Main Street, City Center");
				userService.save(pharmacy1);
				System.out.println("Created pharmacy user: Apollo Pharmacy Manager with ID: " + pharmacy1.getId());

				User pharmacy2 = new User("pharmacy2@test.com", "password", "MedPlus Manager", User.Role.PHARMACY);
				pharmacy2.setPhone("+91-9876543217");
				pharmacy2.setPharmacyName("MedPlus");
				pharmacy2.setAddress("456 Park Avenue, Downtown");
				userService.save(pharmacy2);
				System.out.println("Created pharmacy user: MedPlus Manager with ID: " + pharmacy2.getId());

				User pharmacy3 = new User("pharmacy3@test.com", "password", "Wellness Pharmacy Manager", User.Role.PHARMACY);
				pharmacy3.setPhone("+91-9876543218");
				pharmacy3.setPharmacyName("Wellness Pharmacy");
				pharmacy3.setAddress("789 Health Street, Medical District");
				userService.save(pharmacy3);
				System.out.println("Created pharmacy user: Wellness Pharmacy Manager with ID: " + pharmacy3.getId());

				// Create pharmacy entities with same IDs as users
				Pharmacy apolloPharmacy = new Pharmacy(pharmacy1.getId(), "Apollo Pharmacy", "123 Main Street, City Center", "+91-9876543216", 28.6139, 77.2090, "24 Hours", true, 4.5);
				pharmacyService.save(apolloPharmacy);
				System.out.println("Created pharmacy: Apollo Pharmacy with ID: " + apolloPharmacy.getId());

				Pharmacy medPlusPharmacy = new Pharmacy(pharmacy2.getId(), "MedPlus", "456 Park Avenue, Downtown", "+91-9876543217", 28.6129, 77.2295, "8:00 AM - 10:00 PM", false, 4.2);
				pharmacyService.save(medPlusPharmacy);
				System.out.println("Created pharmacy: MedPlus with ID: " + medPlusPharmacy.getId());

				Pharmacy wellnessPharmacy = new Pharmacy(pharmacy3.getId(), "Wellness Pharmacy", "789 Health Street, Medical District", "+91-9876543218", 28.6149, 77.2195, "9:00 AM - 9:00 PM", false, 4.7);
				pharmacyService.save(wellnessPharmacy);
				System.out.println("Created pharmacy: Wellness Pharmacy with ID: " + wellnessPharmacy.getId());

				// Create sample medicines with correct pharmacy IDs
				Medicine paracetamol1 = new Medicine(null, "Paracetamol 500mg", "GSK", "Pain Relief", "For fever and pain relief", 25.0, true, "500mg", "Nausea, dizziness", 123, 10, "2025-12-31", "BATCH001", apolloPharmacy.getId());
				medicineService.save(paracetamol1);
				System.out.println("Created medicine: Paracetamol 500mg for pharmacy ID: " + apolloPharmacy.getId());

				Medicine paracetamol2 = new Medicine(null, "Paracetamol 500mg", "Cipla", "Pain Relief", "For fever and pain relief", 22.0, true, "500mg", "Nausea, dizziness", 85, 10, "2025-11-30", "BATCH002", medPlusPharmacy.getId());
				medicineService.save(paracetamol2);
				System.out.println("Created medicine: Paracetamol 500mg for pharmacy ID: " + medPlusPharmacy.getId());

				Medicine crocin = new Medicine(null, "Crocin 650mg", "GSK", "Pain Relief", "Advanced pain relief", 35.0, true, "650mg", "Mild stomach upset", 67, 10, "2025-10-15", "BATCH003", wellnessPharmacy.getId());
				medicineService.save(crocin);
				System.out.println("Created medicine: Crocin 650mg for pharmacy ID: " + wellnessPharmacy.getId());

				Medicine aspirin = new Medicine(null, "Aspirin 75mg", "Bayer", "Blood Thinner", "For heart health", 45.0, true, "75mg", "Stomach irritation", 42, 10, "2025-09-20", "BATCH004", apolloPharmacy.getId());
				medicineService.save(aspirin);
				System.out.println("Created medicine: Aspirin 75mg for pharmacy ID: " + apolloPharmacy.getId());

				// Add more medicines for better testing
				Medicine azithromycin = new Medicine(null, "Azithromycin 500mg", "Pfizer", "Antibiotic", "For bacterial infections", 120.0, true, "500mg", "Stomach upset, diarrhea", 30, 5, "2025-08-15", "BATCH005", medPlusPharmacy.getId());
				medicineService.save(azithromycin);
				System.out.println("Created medicine: Azithromycin 500mg for pharmacy ID: " + medPlusPharmacy.getId());

				Medicine cetirizine = new Medicine(null, "Cetirizine 10mg", "Sun Pharma", "Antihistamine", "For allergies", 15.0, true, "10mg", "Drowsiness", 200, 20, "2025-07-30", "BATCH006", wellnessPharmacy.getId());
				medicineService.save(cetirizine);
				System.out.println("Created medicine: Cetirizine 10mg for pharmacy ID: " + wellnessPharmacy.getId());

				System.out.println("Initial data creation completed.");
			} else {
				System.out.println("Database already contains data. Skipping initialization.");
			}



			// Print all users for debugging
			System.out.println("\n=== All Users in Database ===");
			userService.getAllUsers().forEach(user -> System.out
					.println("ID: " + user.getId() + ", Name: " + user.getName() + ", Role: " + user.getRole()));
			System.out.println("==============================\n");
			
			// Print all pharmacies for debugging
			System.out.println("\n=== All Pharmacies in Database ===");
			pharmacyService.getAllPharmacies().forEach(pharmacy -> System.out
					.println("ID: " + pharmacy.getId() + ", Name: " + pharmacy.getName() + ", Contact: " + pharmacy.getContact()));
			System.out.println("==============================\n");
			
			// Print all medicines for debugging
			System.out.println("\n=== All Medicines in Database ===");
			medicineService.getAllMedicines().forEach(medicine -> System.out
					.println("ID: " + medicine.getId() + ", Name: " + medicine.getName() + ", Pharmacy ID: " + medicine.getPharmacyId() + ", Stock: " + medicine.getStock()));
			System.out.println("==============================\n");
		};
	}
}
