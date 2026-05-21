import "reflect-metadata";
import express from "express";
import { CategoryInMemoryRepository } from "./category/infra/db/in-memory/category-in-memory.repository";
import { CastMemberInMemoryRepository } from "./cast-member/infra/db/in-memory/cast-member-in-memory.repository";
import { categoryRouter } from "./category/infra/api/category.route";
import { castMemberRouter } from "./cast-member/infra/api/cast-member.route";

export function createApp() {
	const app = express();
	app.use(express.json());

	const categoryRepo = new CategoryInMemoryRepository();
	const castMemberRepo = new CastMemberInMemoryRepository();

	app.use("/categories", categoryRouter(categoryRepo));
	app.use("/cast-members", castMemberRouter(castMemberRepo));

	return app;
}
