package com.example.projectbackend.repository;

import com.example.projectbackend.model.Call;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CallRepository extends JpaRepository<Call, Long> {
    List<Call> findByCallerIdOrReceiverId(String callerId, String receiverId);
    Optional<Call> findBySessionId(String sessionId);
    List<Call> findByReceiverIdAndStatus(String receiverId, Call.CallStatus status);
}