package org.example.elearningbackend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "courses")
@Data
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String category;

    @Column(length = 1000)
    private String description;

    private String instructor;
    private String videoUrl;

    private String quizQuestion;
    private String quizOptions;
    private int quizCorrect;
}