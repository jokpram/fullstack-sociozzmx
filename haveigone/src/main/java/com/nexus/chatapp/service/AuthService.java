package com.nexus.chatapp.service;

import com.nexus.chatapp.dto.LoginRequest;
import com.nexus.chatapp.dto.RegisterRequest;
import com.nexus.chatapp.model.Status;
import com.nexus.chatapp.model.User;
import com.nexus.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public User register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt());
        
        User user = User.builder()
                .username(request.getUsername())
                .password(hashedPassword)
                .fullName(request.getFullName())
                .status(Status.OFFLINE)
                .build();
                
        return userRepository.save(user);
    }
    
    public User login(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (BCrypt.checkpw(request.getPassword(), user.getPassword())) {
                user.setStatus(Status.ONLINE);
                return userRepository.save(user);
            }
        }
        throw new IllegalArgumentException("Invalid username or password");
    }

    public void resetPassword(String username, String newPassword) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found: " + username);
        }
        
        User user = userOptional.get();
        String hashedPassword = BCrypt.hashpw(newPassword, BCrypt.gensalt());
        user.setPassword(hashedPassword);
        userRepository.save(user);
    }
}
