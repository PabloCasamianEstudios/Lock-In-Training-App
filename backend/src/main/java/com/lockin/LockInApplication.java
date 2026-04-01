package com.lockin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = {"com.lockin"})
public class LockInApplication {
    public static void main(String[] args) {
        SpringApplication.run(LockInApplication.class, args);
    }
}
