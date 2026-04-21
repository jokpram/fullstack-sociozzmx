package com.nexus.chatapp.controller;

import com.nexus.chatapp.model.User;
import com.nexus.chatapp.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/follow")
    public ResponseEntity<Void> followUser(@RequestBody Map<String, String> payload) {
        String follower = payload.get("followerUsername");
        String following = payload.get("followingUsername");
        followService.followUser(follower, following);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unfollow")
    public ResponseEntity<Void> unfollowUser(@RequestBody Map<String, String> payload) {
        String follower = payload.get("followerUsername");
        String following = payload.get("followingUsername");
        followService.unfollowUser(follower, following);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<List<User>> getFollowers(@PathVariable String username) {
        return ResponseEntity.ok(followService.getFollowers(username));
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<List<User>> getFollowing(@PathVariable String username) {
        return ResponseEntity.ok(followService.getFollowing(username));
    }
    
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkFollowing(@RequestParam String follower, @RequestParam String following) {
        return ResponseEntity.ok(followService.isFollowing(follower, following));
    }
}
