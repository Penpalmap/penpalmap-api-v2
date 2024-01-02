# Penpalmap-api-v2

## About penpalmap-api-v2

`penpalmap-api-v2` is a modern and efficient backend API, developed in TypeScript using an Express server for Penpalmap project.

## Prerequisites

To run `penpalmap-api-v2`, ensure your system has the following:

- Node.js version 20 or higher.
- Docker with Docker Compose plugin.

## Installation and Configuration

1. **Installing Dependencies**: Install the required dependencies using:

   ```bash
   npm install
   ```

2. **Setting Up environment variables**: Copy `example.env` to `.env` and update the values as required.

3. **Start required services**: Launch required services (like databases) using Docker Compose:

   ```bash
   docker compose up -d
   ```

4. **Starting the API**: To start the server in development mode, run:
   ```bash
   npm run dev
   ```

## Deployment in Production

1. **Building the Docker Image**: Build a Docker image for the application using:

   ```bash
   docker build -t penpalmap-api-v2:latest .
   ```

2. **Running the API**: To run the API in production mode, use:

   ```bash
   docker run --env-file /path/to/env/file -p 5000:5000 penpalmap-api-v2:latest
   ```

   Ensure to replace `/path/to/env/file` with the path to your custom environment file.

## Database in Production

In production mode, `penpalmap-api-v2` requires a PostgreSQL database version 12 or higher with PostGIS plugin installed. Configure the database and ensure it's accessible from the API.
