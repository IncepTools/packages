import { ConnectOptions, Connection, Schema, Model, createConnection } from "mongoose";
import { IDBService, Logger } from "../interfaces";
import { MongoServiceError } from "./error";
import { SUPPORTED_DBS } from "../constants";
import { MongoMigrationService } from "./migration";
export * from "./migration";

/**
 * Type representing a collection of MongoDB schemas.
 */
export type MongoSchemasType<S = any> = Record<string, any>;

/**
 * Extracts the entity type from a given Mongoose schema.
 */
export type MongoSchemaEntityType<S> = S extends Schema<infer T> ? T : never;

/**
 * Represents a collection of Mongoose models based on provided schemas.
 */
export type IMongoModels<S> = {
	[K in keyof S]: Model<MongoSchemaEntityType<S[K]>>;
};

/**
 * Configuration options for initializing MongoService.
 */
export interface IMongoConfigOptions<S extends MongoSchemasType> {
	type: typeof SUPPORTED_DBS.MONGO_DB;
	connectionString: string;
	models: S;
	migrationPath?: string;
	configOptions?: ConnectOptions;
	hooks?: (schemas: S) => void | Promise<void>;
	logger?: Logger;
}

/**
 * Represents the MongoDB service responsible for managing connections, models, and migrations.
 */
export type IMongoService<S extends MongoSchemasType> = MongoService<S> & IMongoModels<S>;

/**
 * MongoService provides a structured approach to connecting, managing, and migrating MongoDB instances.
 */
export class MongoService<S extends MongoSchemasType<any>> implements IDBService {
	[key: string]: any;
	private logger: Logger;
	public schemas: S;
	public models: IMongoModels<S> = {} as IMongoModels<S>;
	private connectionString: string;
	private configOptions: ConnectOptions;
	private hooks: (schemas: S) => void | Promise<void>;
	public connection!: Connection;
	private migrationPath?: string;
	public migrationService!: MongoMigrationService;

	/**
	 * Initializes a new instance of MongoService.
	 * @param config Configuration options including connection string, schemas, and optional hooks.
	 */
	constructor(config: IMongoConfigOptions<S>) {
		this.connectionString = config.connectionString;
		this.schemas = config.models;
		this.configOptions = config.configOptions ?? {};
		this.hooks = config.hooks ?? (() => {});
		this.logger = config.logger ?? console;
		this.migrationPath = config.migrationPath;
	}

	/**
	 * Establishes a connection to MongoDB.
	 */
	async connect() {
		if (!this.connection) {
			this.connection = await this.initiateConnection(
				this.connectionString,
				this.configOptions,
			);
			if (this.migrationPath)
				this.migrationService = new MongoMigrationService(
					this.connection,
					this.migrationPath,
					this.logger,
				);
			await this.setupModels();
		} else {
			this.logger.log(`Already connected to MongoDB: ${this.connection.host}`);
		}
	}

	/**
	 * Initiates a MongoDB connection using Mongoose.
	 * @param connectionString MongoDB connection string.
	 * @param configOptions Additional connection options.
	 * @returns A promise resolving to the established connection.
	 */
	async initiateConnection(
		connectionString: string,
		configOptions: ConnectOptions,
	): Promise<Connection> {
		try {
			const server = await new Promise<Connection>((resolve, reject) => {
				const server = createConnection(connectionString, configOptions);
				server.on("connected", () => resolve(server));
				server.on("error", (err) => reject(err));
			});
			this.logger.log(`Successfully connected to MongoDB  : ${server.host}`);
			return server;
		} catch (e) {
			const err = new MongoServiceError("Error connecting to MongoDB", e);
			this.logger.error(err.message);
			throw err;
		}
	}

	/**
	 * Sets up Mongoose models based on the provided schemas.
	 */
	async setupModels() {
		try {
			await this.hooks(this.schemas);
			for (const [modelName, schema] of Object.entries(this.schemas)) {
				(this.models as any)[modelName] =
					this.connection?.models[modelName] ??
					this.connection?.model(modelName, schema as any);
				this[modelName] = (this.models as any)[modelName];
			}
		} catch (e) {
			const err = new MongoServiceError("Error setting up models", e);
			this.logger.error(err.message);
			throw err;
		}
	}

	/**
	 * Checks whether the MongoDB connection is established.
	 * @returns A boolean indicating connection status.
	 */
	async isConnected(): Promise<boolean> {
		return this.connection?.readyState === 1;
	}

	/**
	 * Closes the MongoDB connection.
	 */
	async closeConnection() {
		try {
			await this.connection?.close();
			this.logger.log(`MongoDB connection closed: ${this.connection?.host}`);
		} catch (e) {
			const err = new MongoServiceError("Error closing MongoDB connection", e);
			this.logger.error(err.message);
			throw err;
		}
	}
}
