package com.university.roomservice.controller;


import com.university.roomservice.entity.Room;
import com.university.roomservice.service.RoomService;
import org.aspectj.weaver.ast.Var;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;


    // GET : BaseUrl/rooms
    // To Get All Rooms
    @GetMapping
    public ResponseEntity<List<Room>> GetAllRooms(){
        var rooms = roomService.GetAllRooms();

        return ResponseEntity.ok(rooms);
    }    

        @GetMapping({"/{id}"})
        public ResponseEntity<Room> GetRoomById(@PathVariable int id){
            var room = roomService.GetRoomById(id);

            if(room == null){
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(room);
        }

        @PostMapping
        public ResponseEntity<Room> CreateRoom(@RequestBody Room room){
            try{
                var createdRoom = roomService.CreateRoom(room);

                return ResponseEntity.status(HttpStatus.CREATED)
                        .header("Location", "/rooms/" + createdRoom.getId())
                        .body(createdRoom);
            }catch (IllegalArgumentException e){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(null);
            }
        }


    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable int id, @RequestBody Room room) {
        try {
            Room updatedRoom = roomService.updateRoom(id, room);
            return ResponseEntity.ok(updatedRoom);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable int id) {
        try {
            roomService.deleteRoom(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }




}
