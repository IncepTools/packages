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

## Overview

`@inceptools/db` is a powerful database adapter that provides seamless integration with multiple databases, including:

- **MongoDB** (via Mongoose)
- **SQL** (via Sequelize)
- **Redis**

It simplifies database management by offering a unified API for different database types, allowing for efficient and scalable application development.

## Features

- **Unified Interface**: Work with MongoDB, SQL databases, and Redis using a consistent API.
- **Multiple Connections**: Connect to multiple databases of different types simultaneously.
- **Type Safety**: Full TypeScript support with proper type inference.
- **Migration Support**: Built-in migration tools for MongoDB and SQL databases.
- **Logging**: Configurable logging for all database operations.

## Installation

```sh
npm install @inceptools/db
```

or

```sh
yarn add @inceptools/db
```

## Quick Start

```typescript
import { DBService, SUPPORTED_DBS } from "@inceptools/db";
import mongoose from "mongoose";
import { Sequelize, DataTypes } from "sequelize";

// Define your database schemas/models
const db = {
 mongodb: {
  users: new mongoose.Schema({
   name: String,
   email: String,
  }),
 },
 postgres: {
  contacts: (sequelize: Sequelize) => {
   return sequelize.define("Contact", {
    name: {
     type: DataTypes.STRING,
     allowNull: false,
    },
    email: {
     type: DataTypes.STRING,
     allowNull: false,
    },
   });
  },
 },
};

// Configure your database connections
const config = {
 mongodb: {
  type: SUPPORTED_DBS.MONGO_DB,
  connectionString: "mongodb://localhost:27017/myapp",
  models: db.mongodb,
 },
 postgres: {
  type: SUPPORTED_DBS.SQL,
  connectionString: "postgresql://user:password@localhost:5432/myapp",
  models: db.postgres,
  configOptions: {
   dialect: "postgres",
  },
 },
 redis: {
  type: SUPPORTED_DBS.REDIS,
  connectionString: "redis://localhost:6379",
 },
};

// Create a database service instance
const dbService = new DBService(config);

// Connect to all databases
await dbService.connect();

// Use your database models
const users = await dbService.mongodb.users.find();
const contacts = await dbService.postgres.contacts.findAll();
await dbService.redis.set("key", "value");

// Close all connections when done
await dbService.closeConnection();
```

## Individual Database Usage

### MongoDB

```typescript
import { MongoService, SUPPORTED_DBS } from "@inceptools/db";
import mongoose from "mongoose";

// Define your MongoDB schemas
const schemas = {
 users: new mongoose.Schema({
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
 }),
};

// Create a MongoDB service instance
const mongoService = new MongoService({
 type: SUPPORTED_DBS.MONGO_DB,
 connectionString: "mongodb://localhost:27017/myapp",
 models: schemas,
});

// Connect to MongoDB
await mongoService.connect();

// Use your models
const newUser = await mongoService.users.create({
 name: "John Doe",
 email: "john@example.com",
});

const users = await mongoService.users.find();

// Close the connection when done
await mongoService.closeConnection();
```

## Migrations

### MongoDB Migrations

```typescript
// Create a migration service
const mongoService = dbService.mongodb;
const migrationService = mongoService.migrationService;

// Initialize migrations
await migrationService.init();

// Generate a new migration
await migrationService.generateMigration("add-user-roles");

// Apply pending migrations
await migrationService.migrate();
```

### SQL Migrations

```typescript
// Create a migration service
const sqlService = dbService.postgres;
const migrationService = sqlService.migrationService;

// Initialize migrations
await migrationService.init();

// Generate a new migration
await migrationService.generateMigration("add-order-status");

// Apply pending migrations
await migrationService.migrate();
```

## References

- [nestjs-boilerplate](https://github.com/CoderChirag/nestjs-boilerplate) By [CoderChirag](https://github.com/CoderChirag)
- [mongoose](https://github.com/Automattic/mongoose) By [Automattic](https://github.com/Automattic)
- [sequelize](https://github.com/sequelize/sequelize) By [Sequelize](https://github.com/sequelize)
- [ioredis](https://github.com/luin/ioredis) By [luin](https://github.com/luin)

## Support

`@inceptools/db` is an open-source project under the MIT license. If you find this package useful, consider supporting it by contributing or reporting issues on GitHub.

## Stay in Touch

- GitHub - [IncepTools](https://github.com/IncepTools/packages)
- NPM - [@inceptools/db](https://www.npmjs.com/package/@inceptools/db)

## License

`@inceptools/db` is [MIT licensed](LICENSE).
