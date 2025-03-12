export class DBServiceError extends Error {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		const errorMessage = data ? `${message}: ${data.toString()}` : message;
		super(errorMessage);
		this.name = "DBServiceError";
		this.data = data;
	}
}
