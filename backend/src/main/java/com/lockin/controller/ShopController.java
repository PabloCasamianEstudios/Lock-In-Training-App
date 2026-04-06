package com.lockin.controller;

import com.lockin.model.Item;
import com.lockin.model.User;
import com.lockin.service.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shop")
public class ShopController {

    @Autowired private ShopService shopService;

    @GetMapping("/items")
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(shopService.getAllItems());
    }

    @PostMapping("/purchase/item/{userId}/{itemId}")
    public ResponseEntity<?> buyItem(@PathVariable Long userId, @PathVariable Long itemId) {
        try {
            User updatedUser = shopService.buyItem(userId, itemId);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/purchase/title/{userId}/{titleId}")
    public ResponseEntity<?> buyTitle(@PathVariable Long userId, @PathVariable Long titleId) {
        try {
            User updatedUser = shopService.buyTitle(userId, titleId);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
