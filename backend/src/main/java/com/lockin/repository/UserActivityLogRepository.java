package com.lockin.repository;

import com.lockin.model.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {
    
    List<UserActivityLog> findByUserIdAndTimestampAfter(Long userId, LocalDateTime timestamp);
    
    List<UserActivityLog> findByTypeAndUserIdAndTimestampAfter(
            UserActivityLog.ActivityType type, Long userId, LocalDateTime timestamp);
}
