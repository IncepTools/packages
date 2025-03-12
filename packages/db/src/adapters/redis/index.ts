import { Redis, RedisKey, RedisOptions } from "ioredis";
import { IDBService, Logger } from "../interfaces";
import { RedisServiceError } from "./error";
import { SUPPORTED_DBS } from "../constants";

/**
 * Configuration options for Redis connection.
 */
export type RedisConfig =
	| {
			port: number;
			host?: string;
			options?: RedisOptions;
	  }
	| {
			path: string;
			options?: RedisOptions;
	  }
	| {
			[key: string]: never;
	  };

/**
 * Interface defining the Redis configuration options.
 */
export interface IRedisConfigOptions {
	type: typeof SUPPORTED_DBS.REDIS;
	connectionString?: string;
	models?: any;
	configOptions?: RedisConfig;
	migrationPath?: string;
	logger?: Logger;
	transactionLogger?: Logger;
}

/**
 * Type alias for the RedisService class.
 */
export type IRedisService = RedisService;

/**
 * Service for managing Redis connections and operations.
 */
export class RedisService implements IDBService {
	public connection!: Redis;
	private logger: Logger;
	private transactionLogger: Logger;
	private connectionString?: string;
	private configOptions?: RedisConfig;

	// Required by IDBService interface
	public models: Record<string, unknown> = {};

	/**
	 * Initializes a new RedisService instance.
	 * @param config Configuration options for Redis connection.
	 */
	constructor(config: IRedisConfigOptions) {
		this.logger = config.logger ?? console;
		this.transactionLogger = config.transactionLogger ?? this.logger;
		this.connectionString = config.connectionString;
		this.configOptions = config.configOptions;
	}
	// eslint-disable-next-line sonarjs/cognitive-complexity
	async initiateConnection(
		connectionString?: string,
		configOptions?: RedisConfig,
	): Promise<Redis> {
		try {
			// Handle connection string or configuration object
			const server = await new Promise<Redis>((resolve, reject) => {
				let client: Redis;
				if (connectionString) {
					client = new Redis(connectionString);
				} else if (configOptions && typeof configOptions === "object") {
					if ("port" in configOptions) {
						const { port, host, options } = configOptions;

						if (host && options) client = new Redis(port, host, options);
						else if (host) client = new Redis(port, host);
						else if (options) client = new Redis(port, options);
						else client = new Redis(port);
					} else if ("path" in configOptions) {
						const { path, options } = configOptions;

						if (options) client = new Redis(path, options);
						else client = new Redis(path);
					} else {
						client = new Redis();
					}
				} else {
					client = new Redis();
				}
				client.on("connect", () => resolve(client));

				client.on("error", (err) => reject(err));
			});

			this.logger.log(`Successfully connected to Redis    : ${server.options.host}`);

			return server;
		} catch (e) {
			const err = new RedisServiceError("Error connecting to Redis", e);
			this.logger.error(err.message);
			throw err;
		}
	}

	async isConnected(): Promise<boolean> {
		await this.connection.ping();
		return true;
	}

	/**
	 * Verifies connection to Redis by sending a ping command.
	 * @throws RedisServiceError if connection fails.
	 */
	async connect() {
		if (!this.connection) {
			this.connection = await this.initiateConnection(
				this.connectionString,
				this.configOptions,
			);
		} else {
			this.logger.log(`Already connected to Redis: ${this.connection.options.host}`);
		}
	}

	/**
	 * Closes the Redis connection gracefully.
	 * @throws RedisServiceError if closing fails.
	 */
	async closeConnection() {
		try {
			await this.connection.quit();
			this.logger.log("Redis connection closed");
		} catch (e) {
			const err = new RedisServiceError("Error closing Redis connection", e);
			this.logger.error(err.message);
			throw err;
		}
	}

	/**
	 * Retrieves the value associated with a Redis key.
	 * @param key Redis key to retrieve.
	 * @returns The value stored at the key or null if not found.
	 */
	async get(key: RedisKey) {
		try {
			this.transactionLogger.log(`Getting key(${key}) from redis`);
			return await this.connection.get(key);
		} catch (e) {
			const err = new RedisServiceError(`Error getting key(${key})`, e);
			this.transactionLogger.error(err.message);
			throw err;
		}
	}

	/**
	 * Sets a Redis key with a specified value.
	 * @param key Redis key to set.
	 * @param value Value to store in Redis.
	 * @param args Additional Redis set options.
	 * @returns Redis response string.
	 */
	async set(key: RedisKey, value: string | Buffer | number, ...args: any[]) {
		try {
			this.transactionLogger.log(`Setting key(${key}) in redis: ${value}`);
			return await this.connection.set(key, value, ...args);
		} catch (e) {
			const err = new RedisServiceError(`Error setting key(${key})`, e);
			this.transactionLogger.error(err.message);
			throw err;
		}
	}

	async keys(pattern: string) {
		try {
			this.transactionLogger.log(`Getting keys with pattern: ${pattern}`);
			return await this.connection.keys(pattern);
		} catch (e) {
			const err = new RedisServiceError(`Error getting keys with pattern: ${pattern}`, e);
			this.transactionLogger.error(err.message);
			throw err;
		}
	}

	// Add other Redis methods as needed
	async del(...key: RedisKey[]) {
		try {
			this.transactionLogger.log(`Deleting key(s): ${key}`);
			return await this.connection.del(key);
		} catch (e) {
			const err = new RedisServiceError(`Error deleting key(s): ${key}`, e);
			this.transactionLogger.error(err.message);
			throw err;
		}
	}

	async expire(key: RedisKey, seconds: number) {
		try {
			this.transactionLogger.log(`Setting expiry for key(${key}): ${seconds} seconds`);
			return await this.connection.expire(key, seconds);
		} catch (e) {
			const err = new RedisServiceError(`Error setting expiry for key(${key})`, e);
			this.transactionLogger.error(err.message);
			throw err;
		}
	}

	async ttl(key: RedisKey) {
		try {
			return await this.connection.ttl(key);
		} catch (e) {
			const err = new RedisServiceError(`Error getting TTL for key(${key})`, e);
			this.transactionLogger.error(err.message);
			throw err;
		}
	}

	async hset(key: RedisKey, field: string, value: string | number | Buffer) {
		try {
			this.transactionLogger.log(`Setting hash field(${field}) for key(${key}): ${value}`);
			return await this.connection.hset(key, field, value);
		} catch (e) {
			const err = new RedisServiceError(
				`Error setting hash field(${field}) for key(${key})`,
				e,
			);
			this.transactionLogger.error(err.message);
			throw err;
		}
	}

	async hget(key: RedisKey, field: string) {
		try {
			this.transactionLogger.log(`Getting hash field(${field}) for key(${key})`);
			return await this.connection.hget(key, field);
		} catch (e) {
			const err = new RedisServiceError(
				`Error getting hash field(${field}) for key(${key})`,
				e,
			);
			this.transactionLogger.error(err.message);
			throw err;
		}
	}

	async hgetall(key: RedisKey) {
		try {
			this.transactionLogger.log(`Getting all hash fields for key(${key})`);
			return await this.connection.hgetall(key);
		} catch (e) {
			const err = new RedisServiceError(`Error getting all hash fields for key(${key})`, e);
			this.transactionLogger.error(err.message);
			throw err;
		}
	}
}
