package com.lockin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.lockin.model.Friendship;
import java.util.List;
import java.util.Optional;

/* --- REPOSITORY ZONE --- */
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    List<Friendship> findByReceiverIdAndStatus(Long receiverId, Friendship.FriendshipStatus status);
    List<Friendship> findBySenderIdAndStatus(Long senderId, Friendship.FriendshipStatus status);

    @Query("SELECT f FROM Friendship f WHERE (f.sender.id = :u1 AND f.receiver.id = :u2) OR (f.sender.id = :u2 AND f.receiver.id = :u1)")
    Optional<Friendship> findExistingFriendship(Long u1, Long u2);

    @Query("SELECT f FROM Friendship f WHERE ((f.sender.id = :id OR f.receiver.id = :id) AND f.status = 'ACCEPTED')")
    List<Friendship> findAllAcceptedFriends(Long id);
}
