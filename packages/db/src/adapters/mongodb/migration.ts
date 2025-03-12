import fs from "fs";
import path from "path";
import mongoose, { Connection, Model } from "mongoose";
import { IDBMigrationService, Logger } from "../interfaces";

const modelName = "MongoMeta";
const schema = new mongoose.Schema(
	{
		migration_name: { type: String, required: true, unique: true },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

/**
 * MongoDB Migration Service
 * Handles the creation and application of database migrations for MongoDB.
 */
export class MongoMigrationService implements IDBMigrationService {
	private migrationsPath: string;
	private connection: Connection;
	private logger: Logger;
	private model!: Model<{ migration_name: string }>;

	/**
	 * Initializes the MongoDB migration service.
	 * @param connection Active MongoDB connection.
	 * @param migrationsPath Directory path where migration files are stored.
	 * @param logger Optional logger for logging migration details.
	 */
	constructor(connection: Connection, migrationsPath: string, logger?: Logger) {
		this.migrationsPath = migrationsPath;
		this.connection = connection;
		this.logger = logger ?? console;
	}

	/**
	 * Establishes a connection and initializes the migration model.
	 */
	connect() {
		if (this.connection?.readyState === 1) {
			this.logger.log("Connected to Mongo database.");
			this.model = (this.connection.models[modelName] ??
				this.connection?.model(modelName, schema)) as any;
		}
	}

	/**
	 * Initializes the migration service by ensuring the migration directory exists.
	 * Generates an initial migration file if none exist.
	 */
	async init() {
		this.connect();
		if (!fs.existsSync(this.migrationsPath)) {
			fs.mkdirSync(this.migrationsPath, { recursive: true });
			this.generateMigration("first");
		}
	}

	/**
	 * Generates a new migration file with a timestamped name.
	 * @param name Name of the migration.
	 */
	async generateMigration(name: string) {
		const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "");
		const filename = `${timestamp}-${name}.ts`;
		const filepath = path.join(this.migrationsPath, filename);

		const template = `import { Connection } from "mongoose";

export const up = async (connection: Connection) => {
    // Migration logic
	// await connection.createCollection(modelName);
};

export const down = async (connection: Connection) => {
    // Rollback logic
    // await connection.dropCollection(modelName);
};
`;

		fs.writeFileSync(filepath, template);
		this.logger.log(`Migration created: ${filename}`);
	}

	/**
	 * Applies any pending MongoDB migrations.
	 */
	async migrate() {
		this.logger.log("Applying pending MongoDB migrations...");
		this.connect();

		const appliedMigrations = await this.model.find().lean();
		const appliedMigrationNames = new Set(appliedMigrations.map((m) => m.migration_name));

		const migrationFiles = fs
			.readdirSync(this.migrationsPath)
			.filter((file) => file.endsWith(".ts"))
			.sort();

		for (const file of migrationFiles) {
			if (!appliedMigrationNames.has(file)) {
				this.logger.log(`Applying migration: ${file}`);
				const {
					up,
					down,
				}: {
					up: (connection: Connection) => Promise<void>;
					down: (connection: Connection) => Promise<void>;
				} = await import(path.join(this.migrationsPath, file));

				if (typeof up === "function" && typeof down === "function") {
					try {
						await up(this.connection);
						await this.model.create({ migration_name: file });
						this.logger.log(`Migration applied: ${file}`);
					} catch (e) {
						this.logger.error(e);
						down(this.connection);
					}
				} else {
					this.logger.error(`Invalid migration file: ${file}`);
				}
				this.logger.log(`Migration applied: ${file}`);
			} else {
				this.logger.error(`Invalid migration file: ${file}`);
			}
		}
	}
}
