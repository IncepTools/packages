import { DBServiceError } from "../error";

export class MongoServiceError extends DBServiceError {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		const errorMessage = data ? `${message}: ${data.toString()}` : message;
		super(errorMessage);
		this.name = "MongoServiceError";
		this.data = data;
	}
}
