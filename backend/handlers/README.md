# Request Handlers

This directory contains business logic handlers - the functions that process requests and handle core application functionality.

## Structure

- **print_jobs.py** - Handles print job creation and processing

## Purpose

Handlers separate route logic from business logic, making code:
- **Testable** - Easy to unit test business logic independently
- **Reusable** - Business logic can be called from multiple routes or services
- **Maintainable** - Keep business logic organized away from HTTP concerns
