package com.lockin.controller;

import com.lockin.model.*;
import com.lockin.repository.UserRepository;
import com.lockin.repository.FriendshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/social")
public class SocialController {

    @Autowired
    private FriendshipRepository friendshipRepository;
    @Autowired
    private UserRepository userRepository;

    /* --- FRIENDSHIP ACTIONS ZONE --- */
    @PostMapping("/friends/request")
    public ResponseEntity<Object> sendRequest(@RequestParam Long senderId, @RequestParam Long receiverId) {
        if (senderId.equals(receiverId))
            return ResponseEntity.badRequest().body("No puedes ser tu propio amigo");

        Optional<Friendship> existing = friendshipRepository.findExistingFriendship(senderId, receiverId);
        if (existing.isPresent())
            return ResponseEntity.badRequest().body("Ya existe una relación o petición");

        User sender = userRepository.findById(senderId).orElse(null);
        User receiver = userRepository.findById(receiverId).orElse(null);
        if (sender == null || receiver == null)
            return ResponseEntity.status(404).body("Usuario no encontrado");

        Friendship friendship = new Friendship();
        friendship.setSender(sender);
        friendship.setReceiver(receiver);
        friendship.setStatus(Friendship.FriendshipStatus.PENDING);

        return ResponseEntity.ok(friendshipRepository.save(friendship));
    }

    @PostMapping("/friends/accept/{requestId}")
    public ResponseEntity<Object> acceptRequest(@PathVariable Long requestId) {
        Friendship friendship = friendshipRepository.findById(requestId).orElse(null);
        if (friendship == null)
            return ResponseEntity.status(404).body("Petición no encontrada");

        friendship.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        return ResponseEntity.ok(friendshipRepository.save(friendship));
    }

    @GetMapping("/friends/{userId}")
    public List<User> getFriends(@PathVariable Long userId) {
        /* --- FRIEND LIST MAPPING ZONE --- */
        return friendshipRepository.findAllAcceptedFriends(userId).stream()
                .map(f -> f.getSender().getId().equals(userId) ? f.getReceiver() : f.getSender())
                .toList();
    }
}
