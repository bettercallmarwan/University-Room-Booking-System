package com.university.roomservice.service;

import com.university.roomservice.entity.Room;
import com.university.roomservice.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;

    public List<Room> GetAllRooms(){
        return roomRepository.findAll();
    }

    public Room GetRoomById(int id){
        return roomRepository.findById(id).get();
    }


    public Room CreateRoom(Room room){
        if (roomRepository.existsByName(room.getName())) {
            throw new IllegalArgumentException("A room with this name already exists.");
        }

        if(room.getName() == null || room.getName().isEmpty()){
            throw new IllegalArgumentException("Room name cannot be empty");
        }

        if (room.getCapacity() == null || room.getCapacity() <= 0) {
            throw new IllegalArgumentException("Room capacity must be greater than 0");
        }

        return roomRepository.save(room);
    }


    public Room updateRoom(int id, Room updatedRoom) {
        return roomRepository.findById(id).map(room -> {
            room.setName(updatedRoom.getName());
            room.setLocation(updatedRoom.getLocation());
            room.setCapacity(updatedRoom.getCapacity());
            room.setType(updatedRoom.getType());
            room.setIsAvailable(updatedRoom.getIsAvailable());
            return roomRepository.save(room);
        }).orElseThrow(() -> new NoSuchElementException("Room not found with ID: " + id));
    }

    public void deleteRoom(int id) {
        if (!roomRepository.existsById(id)) {
            throw new NoSuchElementException("Room not found with ID: " + id);
        }
        roomRepository.deleteById(id);
    }

}
