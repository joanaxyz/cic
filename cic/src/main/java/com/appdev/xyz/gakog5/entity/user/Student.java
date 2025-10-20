package com.appdev.xyz.gakog5.entity.user;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Setter;
import lombok.Getter;


import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Getter
@Setter
@Entity
@NoArgsConstructor 
@AllArgsConstructor
@Builder
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long id;
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}