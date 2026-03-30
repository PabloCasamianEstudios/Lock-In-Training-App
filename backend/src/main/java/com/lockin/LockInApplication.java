package com.lockin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.lockin"})
public class LockInApplication {
    public static void main(String[] args) {
        SpringApplication.run(LockInApplication.class, args);
    }
}
