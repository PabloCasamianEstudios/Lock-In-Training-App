# LOCK IN - Fullstack Leveling System

Project LOCK IN is a fullstack application built with React (Vite), Spring Boot, and MySQL, orchestrated via Docker. This repository provides a modular and containerized environment for building RPG-style character development systems.

## Prerequisites

To run this project, you must have the following installed on your machine:

- Docker Desktop (includes Docker Compose)
- Git
- Java 17+ (Only if running backend without Docker)
- Node.js 18+ (Only if running frontend without Docker)
- Maven 3.8+ (Only if running backend build without Docker)

## Installation and Execution

### Using Docker (Recommended)

1. Clone the repository and navigate to the root directory.
2. Create a `.env` file from the template:
   ```powershell
   cp .env.example .env
   ```
3. Update the `.env` file with your secure credentials.
4. Run the provided startup script (Windows):
   ```powershell
   ./scripts/start-system.ps1
   ```

### Accessing the System

Once the containers are running:

- **Frontend Interface**: http://localhost:5173
- **Backend API**: http://localhost:8080/api/system/status
- **Database**: Port 3306

## Project Structure

- **/backend**: Spring Boot application (Java 17).
- **/frontend**: React + Vite application with Tailwind CSS.
- **/db**: Database configuration and persistent storage.
- **/scripts**: Helper scripts for system management.

## Technical Architecture

- **Frontend**: React, Vite, Tailwind CSS. Theme inspired by Solo Leveling (Electric Blue/Black).
- **Backend**: Spring Boot 3.2, Spring Data JPA.
- **Database**: MySQL 8.0.
- **Orchestration**: Docker Compose with healthchecks for service dependency management.

## Environment Variables

The system uses environment variables for sensitive configuration. Refer to `.env.example` for the required keys. **Never commit your `.env` file to a public repository.**
