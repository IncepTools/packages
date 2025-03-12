import { SUPPORTED_DBS } from "./constants";

export type DB_TYPES = (typeof SUPPORTED_DBS)[keyof typeof SUPPORTED_DBS];

export interface IDBService {
	connection?: unknown;
	migrationService?: unknown;
	models?: Record<string, unknown>;
	instances?: Record<string, unknown>;

	connect(): Promise<void>;
	initiateConnection?(connectionString: string, configOptions: unknown): Promise<unknown>;
	setupModels?(): void | Promise<void>;
	closeConnection(): Promise<void>;
	isConnected(): boolean | Promise<boolean>;
	syncDb?(): Promise<unknown>;
}

export interface IDBMigrationService {
	init(): Promise<void>;
	generateMigration(name: string): Promise<void>;
	migrate(): Promise<void>;
}

export interface Logger {
	log(...args: unknown[]): unknown;
	error(...args: unknown[]): unknown;
}
