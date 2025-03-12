import { Sequelize, InferCreationAttributes, Model, InferAttributes, DataTypes } from "sequelize";
import path from "path";
import fs from "fs";
import { IDBMigrationService, Logger } from "../interfaces";

/**
 * SequelizeMeta Model
 * Represents the metadata table that tracks applied migrations.
 */
export class SequelizeMeta extends Model<
	InferAttributes<SequelizeMeta>,
	InferCreationAttributes<SequelizeMeta>
> {
	declare migration_name: string;
	declare readonly createdAt?: Date | null;
	declare readonly updatedAt?: Date | null;

	/**
	 * Initializes the SequelizeMeta model within the provided Sequelize instance.
	 * @param sequelize - The Sequelize instance.
	 * @returns The initialized SequelizeMeta model.
	 */
	static setup(sequelize: Sequelize) {
		SequelizeMeta.init(
			{
				migration_name: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false,
				},
			},
			{
				sequelize,
				tableName: "SequelizeMeta",
				modelName: "SequelizeMeta",
				timestamps: true,
			},
		);
		return SequelizeMeta;
	}
}

/**
 * SequelizeMigrationService
 * Handles database migration operations, including generation, execution, and tracking of migrations.
 */
export class SequelizeMigrationService implements IDBMigrationService {
	private connection: Sequelize;
	private migrationsPath: string;
	private logger: Logger;

	/**
	 * Constructor
	 * @param sequelize - The Sequelize instance.
	 * @param migrationsPath - The path where migration files are stored.
	 * @param logger - Optional logger instance for logging (defaults to console).
	 */
	constructor(sequelize: Sequelize, migrationsPath: string, logger?: Logger) {
		this.connection = sequelize;
		this.migrationsPath = migrationsPath ?? path.join(__dirname, "migrations", "sequelize");
		this.logger = logger ?? console;
	}

	/**
	 * Establishes a connection to the database and ensures the SequelizeMeta table exists.
	 */
	async connect() {
		await this.connection.authenticate();
		this.logger.log("Connected to SQL database.");
		await SequelizeMeta.setup(this.connection).sync();
	}

	/**
	 * Initializes the migration system.
	 * Ensures the migrations directory exists and generates an initial migration file if none exists.
	 */
	async init() {
		await this.connect();
		if (!fs.existsSync(this.migrationsPath)) {
			fs.mkdirSync(this.migrationsPath, { recursive: true });
			this.generateMigration("first");
		}
	}

	/**
	 * Generates a new migration file with a timestamped name.
	 * @param name - The descriptive name of the migration.
	 */
	async generateMigration(name: string) {
		const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "");
		const filename = `${timestamp}-${name}.ts`;
		const filepath = path.join(this.migrationsPath, filename);

		const template = `import { Sequelize } from "sequelize";

export const up = async (connection: Sequelize) => {
    // Migration logic
	// await connection.createTable(modelName, schema);
};

export const down = async (connection: Sequelize) => {
    // Rollback logic
	// await connection.dropTable(modelName);
};
`;

		fs.writeFileSync(filepath, template);
		this.logger.log(`Migration created: ${filename}`);
	}

	/**
	 * Applies pending migrations in sequential order.
	 */
	async migrate() {
		this.logger.log("Applying pending Sequelize migrations...");
		await this.connect();

		// Fetch applied migrations from SequelizeMeta
		const appliedMigrations = await SequelizeMeta.findAll();
		const appliedMigrationNames = new Set(
			appliedMigrations.map((m) => m.dataValues.migration_name),
		);

		// Get all migration files sorted by timestamp
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
					up: (connection: Sequelize) => Promise<void>;
					down: (connection: Sequelize) => Promise<void>;
				} = await import(path.join(this.migrationsPath, file));

				if (typeof up === "function" && typeof down === "function") {
					try {
						await up(this.connection);
						await SequelizeMeta.create({ migration_name: file });
						this.logger.log(`Migration applied: ${file}`);
					} catch (e) {
						this.logger.error(e);
						await down(this.connection);
					}
				} else {
					this.logger.error(`Invalid migration file: ${file}`);
				}
			}
		}
	}
}
