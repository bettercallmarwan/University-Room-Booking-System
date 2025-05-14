package com.university.roomservice.service;

import com.university.roomservice.entity.Room;
import com.university.roomservice.repository.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class RoomService {

    private static final Logger logger = LoggerFactory.getLogger(RoomService.class);

    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        logger.debug("Fetching all rooms");
        return roomRepository.findAll();
    }


    public Room getRoomById(int id) {
        logger.debug("Fetching room with id: {}", id);
        Optional<Room> roomOptional = roomRepository.findById(id);
        if (roomOptional.isEmpty()) {
            logger.error("No room found in database for id: {}", id);
        }
        return roomOptional.orElseThrow(() -> new NoSuchElementException("Room not found with id: " + id));
    }


    public Room createRoom(Room room) {
        logger.debug("Creating room: {}", room.getName());
        if (room.getName() == null || room.getName().isBlank()) {
            logger.error("Room name is required");
            throw new IllegalArgumentException("Room name is required");
        }
        if (roomRepository.existsByName(room.getName())) {
            logger.error("Room name already exists: {}", room.getName());
            throw new IllegalArgumentException("Room name already exists");
        }
        return roomRepository.save(room);
    }

    public Room updateRoom(int id, Room room) {
        logger.debug("Updating room with id: {}", id);
        Room existingRoom = roomRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Room not found"));
        if (room.getName() != null && !room.getName().isBlank()) {
            if (!room.getName().equals(existingRoom.getName()) && roomRepository.existsByName(room.getName())) {
                logger.error("Room name already exists: {}", room.getName());
                throw new IllegalArgumentException("Room name already exists");
            }
            existingRoom.setName(room.getName());
        }
        if (room.getLocation() != null) existingRoom.setLocation(room.getLocation());
        if (room.getCapacity() != null) existingRoom.setCapacity(room.getCapacity());
        if (room.getType() != null) existingRoom.setType(room.getType());
        if (room.getIsAvailable() != null) existingRoom.setIsAvailable(room.getIsAvailable());
        return roomRepository.save(existingRoom);
    }

    public void deleteRoom(int id) {
        logger.debug("Deleting room with id: {}", id);
        if (!roomRepository.existsById(id)) {
            logger.error("Room not found with id: {}", id);
            throw new NoSuchElementException("Room not found");
        }
        roomRepository.deleteById(id);
    }


    public boolean isAvailable(int id) {
        var room = roomRepository.findById(id);
        return room.get().getIsAvailable();
    }
}