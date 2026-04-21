package com.nexus.chatapp.controller;

import com.nexus.chatapp.dto.UserProfileDTO;
import com.nexus.chatapp.model.User;
import com.nexus.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor

public class UserController {

    private final UserService userService;

    @PostMapping("/connect")
    public ResponseEntity<User> connectUser(@RequestBody User userPayload, @RequestHeader("Session-Id") String sessionId) {
        User connectedUser = userService.connectUser(userPayload.getUsername(), userPayload.getFullName(), sessionId);
        return ResponseEntity.ok(connectedUser);
    }

    @PostMapping("/disconnect")
    public ResponseEntity<Void> disconnectUser(@RequestBody User userPayload) {
        userService.disconnectUser(userPayload);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/connected")
    public ResponseEntity<List<User>> findConnectedUsers() {
        return ResponseEntity.ok(userService.findConnectedUsers());
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> findAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody java.util.Map<String, String> request) {
        try {
            String username = request.get("username");
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");

            if (username == null || oldPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Username, old password, and new password are required");
            }

            userService.changePassword(username, oldPassword, newPassword);
            return ResponseEntity.ok().body("Password changed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while changing password");
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody java.util.Map<String, String> request) {
        try {
            String username = request.get("username");
            String fullName = request.get("fullName");

            if (username == null || fullName == null) {
                return ResponseEntity.badRequest().body("Username and full name are required");
            }

            User updatedUser = userService.updateProfile(username, fullName);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while updating profile");
        }
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        try {
            UserProfileDTO profile = userService.getUserProfile(username);
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
