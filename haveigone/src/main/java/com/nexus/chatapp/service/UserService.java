package com.nexus.chatapp.service;

import com.nexus.chatapp.model.Status;
import com.nexus.chatapp.model.User;
import com.nexus.chatapp.repository.UserRepository;
import com.nexus.chatapp.dto.UserProfileDTO;
import com.nexus.chatapp.model.Post;
import com.nexus.chatapp.model.Story;
import com.nexus.chatapp.repository.FollowRepository;
import com.nexus.chatapp.repository.PostRepository;
import com.nexus.chatapp.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final PostRepository postRepository;
    private final StoryRepository storyRepository;

    public User saveUser(User user) {
        user.setStatus(Status.ONLINE);
        return userRepository.save(user);
    }

    public void disconnectUser(User user) {
        if (user == null || user.getUsername() == null) return;
        var storedUser = userRepository.findByUsername(user.getUsername()).orElse(null);
        if (storedUser != null) {
            storedUser.setStatus(Status.OFFLINE);
            storedUser.setSessionId(null);
            userRepository.save(storedUser);
        }
    }

    public void disconnectBySessionId(String sessionId) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
             if (sessionId.equals(user.getSessionId())) {
                 user.setStatus(Status.OFFLINE);
                 user.setSessionId(null);
                 userRepository.save(user);
             }
        }
    }

    public List<User> findConnectedUsers() {
        return userRepository.findByStatus(Status.ONLINE);
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public User connectUser(String username, String fullName, String sessionId) {
        Optional<User> existingUser = userRepository.findByUsername(username);
        User user = existingUser.orElseGet(() -> User.builder()
                .username(username)
                .fullName(fullName)
                .build());
        
        user.setStatus(Status.ONLINE);
        user.setSessionId(sessionId);
        return userRepository.save(user);
    }

    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!BCrypt.checkpw(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Incorrect old password");
        }

        String hashedPassword = BCrypt.hashpw(newPassword, BCrypt.gensalt());
        user.setPassword(hashedPassword);
        userRepository.save(user);
    }

    public User updateProfile(String username, String fullName) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setFullName(fullName);
        return userRepository.save(user);
    }

    public UserProfileDTO getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        long followersCount = followRepository.countByFollowing(user);
        long followingCount = followRepository.countByFollower(user);
        long postsCount = postRepository.countByAuthor(user);
        List<Post> posts = postRepository.findByAuthorUsernameOrderByCreatedAtDesc(username);
        List<Story> activeStories = storyRepository.findActiveStoriesByUsername(username, java.time.LocalDateTime.now());

        return UserProfileDTO.builder()
                .user(user)
                .followersCount(followersCount)
                .followingCount(followingCount)
                .postsCount(postsCount)
                .posts(posts)
                .activeStories(activeStories)
                .build();
    }
}
