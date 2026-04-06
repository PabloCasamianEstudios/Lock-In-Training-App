package com.lockin.service;

import com.lockin.model.*;
import com.lockin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShopService {

    @Autowired private UserRepository userRepository;
    @Autowired private ItemRepository itemRepository;
    @Autowired private UserItemRepository userItemRepository;
    @Autowired private TitleRepository titleRepository;
    @Autowired private UserTitleRepository userTitleRepository;

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @Transactional
    public User buyItem(Long userId, Long itemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Objeto no encontrado"));

        if (user.getCoins() < item.getPrice()) {
            throw new RuntimeException("Monedas insuficientes para comprar " + item.getName());
        }

        // Deduct coins
        user.setCoins(user.getCoins() - item.getPrice());
        userRepository.save(user);

        // Add to inventory
        UserItem userItem = userItemRepository.findByUserIdAndItemId(userId, itemId)
                .orElse(new UserItem(user, item, 0));
        
        userItem.setQuantity(userItem.getQuantity() + 1);
        userItemRepository.save(userItem);

        return user;
    }

    @Transactional
    public User buyTitle(Long userId, Long titleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Title title = titleRepository.findById(titleId)
                .orElseThrow(() -> new RuntimeException("Título no encontrado"));

        if (user.getCoins() < title.getPrice()) {
            throw new RuntimeException("Monedas insuficientes para comprar el título: " + title.getName());
        }

        // Check if already owned
        if (userTitleRepository.findByUserIdAndTitleId(userId, titleId).isPresent()) {
            throw new RuntimeException("Ya posees este título");
        }

        // Deduct coins
        user.setCoins(user.getCoins() - title.getPrice());
        userRepository.save(user);

        // Add to user titles
        UserTitle userTitle = new UserTitle();
        userTitle.setUser(user);
        userTitle.setTitle(title);
        userTitle.setEquipped(false);
        userTitleRepository.save(userTitle);

        return user;
    }
}
