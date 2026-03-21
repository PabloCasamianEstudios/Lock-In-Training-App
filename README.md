# LOCK IN - Fullstack Leveling System

Project LOCK IN is a fullstack application built with React (Vite), Spring Boot, and MySQL, orchestrated via Docker. This repository provides a modular and containerized environment for building RPG-style character development systems.

## Prerequisites

To run this project, you must have the following installed on your machine:

- Docker Desktop (includes Docker Compose)
- Git
- Java 17+ (Only if running backend without Docker)
- Node.js 20+ (Only if running frontend without Docker)
- Maven 3.8+ (Only if running backend build without Docker)

## Quick Start Guide (After Cloning the Project)

Follow these steps to set up the system for the first time:

1. **Configure Environment Variables**:
   Navigate to the root directory and create a `.env` file from the template:
   ```powershell
   cp .env.example .env
   ```
   Open the `.env` file and ensure the credentials match what you want to use locally.

2. **Start Docker**:
   Ensure Docker Desktop is open and running correctly before proceeding.

3. **Run the Startup Script**:
   In a PowerShell terminal from the root directory, run:
   ```powershell
   ./scripts/start-system.ps1
   ```
   This command will build the necessary images and lift the database, backend, and frontend containers.

## Accessing the System

Once the containers are active and healthy:

- **Frontend Interface**: http://localhost:5173
- **Backend API**: http://localhost:8081/api/system/status
- **Database (MySQL)**: Port 3306

## Project Structure

- **/backend**: Spring Boot application (Java 17 / Eclipse Temurin).
- **/frontend**: React + Vite application with Tailwind CSS. "Solo Leveling" aesthetic (Orange/Black).
- **/db**: Database configuration and persistent storage.
- **/scripts**: Helper scripts for system management.

## Technical Architecture

- **Frontend**: React, Vite, Tailwind CSS. Design system based on centralized CSS variables.
- **Backend**: Spring Boot 3.2, Spring Data JPA. Configured to connect with the DB container.
- **Database**: MySQL 8.0.
- **Orchestration**: Docker Compose with healthchecks for service dependency management.

## Security and Environment Variables

The system uses environment variables for sensitive configuration. Refer to `.env.example` for the required keys.
