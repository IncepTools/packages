import { constants } from "./constants";
import { SUPPORTED_DBS } from "@inceptools/db";
import mongoose from "mongoose";

import path from "path";
import {
	DataTypes,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Options,
	Sequelize,
} from "sequelize";

class ContactUs extends Model<InferAttributes<ContactUs>, InferCreationAttributes<ContactUs>> {
	public name!: string;
	public email!: string;

	static setup(sequelize: Sequelize) {
		return ContactUs.init(
			{
				name: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				email: {
					type: DataTypes.STRING,
					allowNull: false,
				},
			},
			{
				sequelize,
				modelName: "ContactUs",
			},
		);
	}
}
type name = {
	name: string;
	email: string;
};
// Define your database schemas/models
const db = {
	mongodb: {
		users: new mongoose.Schema<name>({
			name: String,
			email: String,
		}),
	},
	postgres: {
		contacts: (sequelize: Sequelize) => {
			return ContactUs.setup(sequelize);
		},
	},
};
export const config = {
	mongodb: {
		providerName: constants.DB_SERVICES.MONGO_DB_SERVICE.PROVIDER_NAME,
		type: SUPPORTED_DBS.MONGO_DB,
		connectionString: "mongodb://localhost:27017/myapp",
		models: db.mongodb,
		logger: console,
		migrationPath: path.join(__dirname, "migrations", "mongo"),
	},
	postgres: {
		// providerName: constants.DB_SERVICES.POSTGRES_DB_SERVICE.PROVIDER_NAME,
		type: SUPPORTED_DBS.SQL,
		connectionString: "postgresql://user:password@localhost:5432/myapp",
		models: db.postgres,
		logger: console,
		configOptions: {
			dialect: "postgres",
			logging: (sql: any, timing: any) => {},
		} as Options,
		migrationPath: path.join(__dirname, "migrations", "postgres"),
	},
	redis: {
		// providerName: constants.DB_SERVICES.REDIS_SERVICE.PROVIDER_NAME,
		type: SUPPORTED_DBS.REDIS,
		connectionString: "redis://localhost:6379",
		logger: console,
	},
};
