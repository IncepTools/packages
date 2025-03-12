import { Options, Sequelize, SyncOptions } from "sequelize";
import { IDBService, Logger } from "../interfaces";
import { SqlServiceError } from "./error";
import { SUPPORTED_DBS } from "../constants";
import { SequelizeMigrationService } from "./migration";
export * from "./migration";

/**
 * Type definition for SQL models.
 */
export type SqlModelsType = Record<string, (db: Sequelize) => any>;

/**
 * Interface representing the instantiated Sequelize models.
 */
export type ISqlModels<T extends SqlModelsType> = {
	[K in keyof T]: ReturnType<T[K]>;
};

/**
 * Configuration options for initializing the SqlService.
 */
export interface ISqlConfigOptions<M extends SqlModelsType> {
	type: typeof SUPPORTED_DBS.SQL;
	connectionString: string;
	models: M;
	migrationPath?: string;
	configOptions?: Options;
	logger?: Logger;
}

/**
 * Interface representing the SQL Service instance.
 */
export type ISqlService<T extends SqlModelsType> = SqlService<T> & ISqlModels<T>;

/**
 * SqlService provides a structured way to manage Sequelize connections,
 * handle model initialization, and manage database migrations.
 */
export class SqlService<T extends SqlModelsType> implements IDBService {
	[key: string]: any;

	private logger: Logger;
	private modelsRef: T;
	public models: ISqlModels<T> = {} as ISqlModels<T>;

	private connectionString: string;
	private dialectOptions: Options;
	public connection!: Sequelize;

	private migrationPath?: string;
	public migrationService!: SequelizeMigrationService;

	/**
	 * Constructs an instance of SqlService.
	 * @param config Configuration options for the SQL service.
	 */
	constructor(config: ISqlConfigOptions<T>) {
		this.connectionString = config.connectionString;
		this.dialectOptions = config.configOptions ?? {};
		this.modelsRef = config.models;
		this.logger = config.logger ?? console;
		this.migrationPath = config.migrationPath;
	}

	/**
	 * Returns the Sequelize instance.
	 */
	get sequelize() {
		return this.connection;
	}

	/**
	 * Establishes a connection to the database.
	 */
	async connect() {
		if (!this.connection) {
			this.connection = await this.initiateConnection(
				this.connectionString,
				this.dialectOptions,
			);

			if (this.migrationPath) {
				this.migrationService = new SequelizeMigrationService(
					this.connection,
					this.migrationPath,
					this.logger,
				);
			}
			this.setupModels();
		} else {
			this.logger.log(`Already connected to Sequelize: ${this.connection?.config.host}`);
		}
	}

	/**
	 * Initializes a new Sequelize connection.
	 * @param connectionString Database connection string.
	 * @param configOptions Sequelize configuration options.
	 */
	async initiateConnection(connectionString: string, configOptions: Options) {
		try {
			const conn = new Sequelize(connectionString, configOptions);
			await conn.authenticate();
			this.logger.log(`Successfully connected to Sequelize: ${conn.config.host}`);
			return conn;
		} catch (e) {
			const err = new SqlServiceError("Error connecting to Sequelize", e);
			this.logger.error(err.message);
			throw err;
		}
	}

	/**
	 * Initializes and associates all defined models.
	 */
	async setupModels() {
		for (const [modelName, model] of Object.entries(this.modelsRef)) {
			(this.models as any)[modelName] = model(this.connection);
		}
		Object.keys(this.models).forEach((modelName) => {
			const model = this.models[modelName];
			if (model?.associate) {
				model.associate(this.models);
			}
			this[modelName] = model;
		});
	}

	/**
	 * Checks if the database connection is active.
	 */
	async isConnected() {
		try {
			await this.connection.authenticate();
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Closes the database connection.
	 */
	async closeConnection() {
		try {
			const dbName = this.connection.getDatabaseName();
			await this.connection.close();
			this.logger.log(`Sequelize connection closed: ${dbName}`);
		} catch (e) {
			const err = new SqlServiceError("Error closing Sequelize connection", e);
			this.logger.error(err.message);
			throw err;
		}
	}

	/**
	 * Synchronizes the database schema.
	 */
	async syncDb(options?: SyncOptions) {
		try {
			return await this.connection.sync(options);
		} catch (e) {
			const err = new SqlServiceError("Error closing sequelize connection", e);
			this.logger.error(err.message);
			throw err;
		}
	}
}
