package com.lockin.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "items")
@NoArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(nullable = false)
    private Long price = 0L;

    @Enumerated(EnumType.STRING)
    private ItemType type = ItemType.COSMETIC;

    public enum ItemType {
        COSMETIC,
        CONSUMABLE,
        COLLECTIBLE,
        SPECIAL
    }
}
