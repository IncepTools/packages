import { SUPPORTED_DBS } from "./constants";
import { DBServiceError } from "./error";
import { DB_TYPES, IDBService } from "./interfaces";
import { IMongoConfigOptions, IMongoService, MongoSchemasType, MongoService } from "./mongodb";
import { ISqlConfigOptions, ISqlService, SqlModelsType, SqlService } from "./sequelize";
import { IRedisConfigOptions, IRedisService, RedisService } from "./redis";
import { SyncOptions } from "sequelize";

export * from "./interfaces";
export * from "./constants";
export * from "./redis";
export * from "./sequelize";
export * from "./mongodb";

/** Type representing possible database models or schemas. */
export type IConfigModels<T extends DB_TYPES> = T extends typeof SUPPORTED_DBS.MONGO_DB
	? MongoSchemasType
	: T extends typeof SUPPORTED_DBS.SQL
		? SqlModelsType
		: never;

/** Maps a database type to its corresponding service instance type. */
export type IDbInstance<
	T extends DB_TYPES,
	S extends IConfigModels<T>,
> = T extends typeof SUPPORTED_DBS.MONGO_DB
	? IMongoService<S>
	: T extends typeof SUPPORTED_DBS.SQL
		? ISqlService<S>
		: T extends typeof SUPPORTED_DBS.REDIS
			? IRedisService
			: never;

/** Maps a database type to its configuration options. */
export type IDBConfigOptions<
	T extends DB_TYPES,
	S extends IConfigModels<T>,
> = T extends typeof SUPPORTED_DBS.MONGO_DB
	? IMongoConfigOptions<S>
	: T extends typeof SUPPORTED_DBS.SQL
		? ISqlConfigOptions<S>
		: T extends typeof SUPPORTED_DBS.REDIS
			? IRedisConfigOptions
			: never;

/** Maps a database type to its corresponding service implementation. */
export type IDBServiceReturnType<
	T extends DB_TYPES,
	S extends IConfigModels<T>,
> = T extends typeof SUPPORTED_DBS.MONGO_DB
	? IMongoService<S>
	: T extends typeof SUPPORTED_DBS.SQL
		? ISqlService<S>
		: T extends typeof SUPPORTED_DBS.REDIS
			? IRedisService
			: never;

/** Configuration options with an optional provider name. */
export type ConfigOptions<T extends DB_TYPES, S extends IConfigModels<T>> = IDBConfigOptions<
	T,
	S
> & {
	providerName?: string;
};

export type ConfigRecord = ConfigOptions<DB_TYPES, IConfigModels<DB_TYPES>>;

/** Configuration object for multiple database connections. */
export type DBConfigs<K extends string, T extends Record<K, ConfigRecord>> = {
	[P in K]: ConfigOptions<T[P]["type"], T[P]["models"]>;
};
export type DBInstances<K extends string, T extends Record<K, ConfigRecord>> = {
	[P in K]: IDBServiceReturnType<T[P]["type"], T[P]["models"]>;
};

export type IDBServices<K extends string, T extends Record<K, ConfigRecord>> = DBService<K, T> &
	DBInstances<K, T>;

/** The main service class for managing multiple database connections. */
export class DBService<K extends string, T extends Record<K, ConfigRecord>> implements IDBService {
	/** Holds instances of connected databases. */
	instances: DBInstances<K, T>;

	/** Configuration object. */
	config: DBConfigs<K, T>;

	/** Dynamic key-value storage (ensuring correct type inference). */
	[key: string]: IDBServiceReturnType<DB_TYPES, IConfigModels<DB_TYPES>> | any;

	constructor(config: DBConfigs<K, T>) {
		this.config = config;
		this.instances = {} as DBInstances<K, T>;

		for (const key in config) {
			const dbConfig = config[key as K];
			if (!dbConfig) throw new Error("Invalid configuration");
			const instance = DBService.forRoot<
				(typeof dbConfig)["type"],
				(typeof dbConfig)["models"]
			>(dbConfig as any);
			(this.instances as any)[key as K] = instance;
			(this as any)[key as K] = instance;
		}
	}

	/** Creates a database instance based on the provided configuration. */
	static forRoot<T extends DB_TYPES, S extends IConfigModels<T>>(
		config: IDBConfigOptions<T, S>,
	): IDBServiceReturnType<T, S> {
		const { type, connectionString, logger = console, models, configOptions } = config;

		switch (type) {
			case SUPPORTED_DBS.MONGO_DB:
				if (!models) throw new DBServiceError("Models are required for MongoDB connection");
				return new MongoService({
					type,
					connectionString,
					models: models as S,
					configOptions,
					hooks: config.hooks,
					logger,
					migrationPath: config.migrationPath,
				}) as IDBServiceReturnType<T, S>;

			case SUPPORTED_DBS.SQL:
				if (!models) throw new DBServiceError("Models are required for SQL connection");
				return new SqlService({
					type,
					connectionString,
					models,
					configOptions,
					logger,
					migrationPath: config.migrationPath,
				}) as IDBServiceReturnType<T, S>;

			case SUPPORTED_DBS.REDIS:
				return new RedisService({
					type,
					connectionString,
					configOptions,
					logger,
					transactionLogger: logger,
				}) as IDBServiceReturnType<T, S>;

			default:
				throw new DBServiceError(`DB type not supported: ${type}`);
		}
	}

	/** Establishes connections for all configured databases. */
	async connect(): Promise<void> {
		await Promise.all(Object.values(this.instances).map((instance: any) => instance.connect()));
	}

	/** Closes all database connections. */
	async closeConnection(): Promise<void> {
		await Promise.all(
			Object.values(this.instances).map((instance: any) => instance.closeConnection()),
		);
	}

	/** Checks if all databases are connected. */
	async isConnected(): Promise<boolean> {
		const results = await Promise.all(
			Object.values(this.instances).map((instance: any) => instance.isConnected()),
		);
		return results.every((isConnected) => isConnected);
	}

	/** Synchronizes the database schema. */
	async syncDb(options?: SyncOptions): Promise<void> {
		await Promise.all(
			Object.values(this.instances).map(async (instance: any) => {
				if (instance.syncDb) await instance.syncDb(options);
			}),
		);
	}
}
