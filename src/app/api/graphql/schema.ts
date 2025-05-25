import * as fs from 'node:fs';
import * as path from 'node:path';
import { makeExecutableSchema } from '@graphql-tools/schema';

export async function createSchema() {
	const modelFolder = path.join(process.cwd(), 'src', 'server', 'models');

	const resolvers = {
		Query: {},
		Mutation: {},
	};
	const typeDefs: string[] = [];

	const files = fs.readdirSync(modelFolder, { recursive: true });
	for (const file of files) {
		const fileString = String(file);
		if (fileString.endsWith('resolvers.ts')) {
			// Convert the file path to a file URL for dynamic import
			const resolversModule = await import(`../../../server/models/${fileString}`);

			resolvers.Query = { ...resolvers.Query, ...resolversModule.Query };
			resolvers.Mutation = {
				...resolvers.Mutation,
				...resolversModule.Mutation,
			};
		} else if (fileString.endsWith('.graphql')) {
			const schema = fs.readFileSync(path.join(modelFolder, fileString), 'utf8');
			typeDefs.push(schema);
		}
	}

	return makeExecutableSchema({
		typeDefs,
		resolvers,
	});
}
