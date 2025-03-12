import { DBService } from "@inceptools/db";
import express from "express";
import { config } from "./config";

const app = express();
const port = 3000;

const db = new DBService<keyof typeof config, typeof config>(config);

app.get("/", (req: any, res: any) => {
	res.send("Hello World!");
});

app.listen(port, async () => {
	// const data = db.instances.mongodb.users;

	// await db.instances.redis.connect();
	await db.connect();
	// const model = await db.instances.postgres.ContactUs
	console.log(await db.instances.mongodb.users.find());
	// db.instances.postgres;

	console.log(`Express is listening at http://localhost:${port}`);
});
