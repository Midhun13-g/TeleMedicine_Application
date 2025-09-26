package com.example.projectbackend.service;

import com.example.projectbackend.model.User;
import com.example.projectbackend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user; // Return user even if suspended, let controller handle it
            }
        }
        return null;
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<User> findByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User save(User user) {
        if (user.getId() == null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User suspendUser(Long userId) {
        User user = findById(userId);
        if (user != null && user.getRole() != User.Role.ADMIN) {
            user.setSuspended(true);
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        return null;
    }
    
    public User unsuspendUser(Long userId) {
        User user = findById(userId);
        if (user != null) {
            user.setSuspended(false);
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        return null;
    }
    
    public boolean deleteUser(Long userId) {
        User user = findById(userId);
        if (user != null && user.getRole() != User.Role.ADMIN) {
            userRepository.delete(user);
            return true;
        }
        return false;
    }

}
