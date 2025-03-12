# IncepTools Monorepo

<p align="center">
    <a href="https://github.com/IncepTools/packages" target="blank">
        <strong>IncepTools Monorepo</strong>
    </a>
</p>

<p align="center">
    A collection of modular packages for scalable application development.
</p>

<p align="center">
  <a href="https://github.com/IncepTools/packages"><img src="https://img.shields.io/github/license/IncepTools/packages" alt="License" /></a>
</p>

---

## Overview

The **IncepTools Monorepo** is a modular package system designed to streamline backend and database integrations for scalable applications. This repository is structured to support multiple packages, starting with `@inceptools/db`, with many more coming soon. Future packages will cover authentication, API integrations, and more, making it a comprehensive solution for modern application development.

## Folder Structure

```plaintext
examples/
├── express            # Example implementations for Express.js
configs/
├── eslint-config      # Shared ESLint configuration
├── tsconfig           # Shared TypeScript configuration
packages/
├── db                 # Database logic and utilities (@inceptools/db)
├── auth               # Authentication module (coming soon)
.gitignore
.npmrc
package.json
README.md
turbo.json
```

### Key Folders:

- `examples/`: Will contain example applications showcasing package usage.
- `configs/`: Holds shared configuration files for ESLint and TypeScript.
- `packages/`: Contains modular packages, starting with `@inceptools/db`, and upcoming modules like `auth`.
- `.gitignore`: Standard Git ignore settings.
- `.npmrc`: npm configuration.
- `turbo.json`: Configuration for Turborepo to optimize the monorepo workflow.

---

## Tech Stack

- **TypeScript**: Ensures type safety and robust development.
- **Turborepo**: Manages and optimizes monorepo workflows.
- **ESLint/Prettier**: Provides code linting and formatting.

---

## Available Packages

### `@inceptools/db`

<p align="center">
  <a href="https://github.com/IncepTools/packages" target="blank">
    @inceptools/db
  </a>
</p>

<p align="center">
  A modular database adapter for MongoDB, SQL (Sequelize), and Redis.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@inceptools/db"><img src="https://img.shields.io/npm/v/@inceptools/db.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/@inceptools/db"><img src="https://img.shields.io/npm/l/@inceptools/db.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/package/@inceptools/db"><img src="https://img.shields.io/npm/dm/@inceptools/db.svg" alt="NPM Downloads" /></a>
</p>

#### Features

- **Unified Interface**: Work with MongoDB, SQL databases, and Redis using a consistent API.
- **Multiple Connections**: Connect to multiple databases of different types simultaneously.
- **Type Safety**: Full TypeScript support with proper type inference.
- **Migration Support**: Built-in migration tools for MongoDB and SQL databases.
- **Logging**: Configurable logging for all database operations.

#### Installation

```sh
npm install @inceptools/db
```

or

```sh
yarn add @inceptools/db
```

---

## Upcoming Packages

- `@inceptools/auth` – Authentication and session management (coming soon)
- More utilities and integrations in development!

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (>= 16.x)
- **npm** or **yarn**
- **Turborepo** (for monorepo management)
- **MongoDB** (if using MongoDB integration)
- **PostgreSQL** (if using Sequelize with a relational database)
- **Redis** (if using Redis integration)

---

## Contributors

We welcome contributions from the community! If you're interested in contributing, feel free to submit a pull request or open an issue.

### Maintainers
- [IshanSingla](https://github.com/IshanSingla) - Creator & Lead Developer

### Contributors
- [List of contributors](https://github.com/IncepTools/packages/graphs/contributors)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
