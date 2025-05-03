import { createYoga } from 'graphql-yoga';
import { createSchema } from './schema';

const schema = await createSchema();

const yoga = createYoga({
	graphqlEndpoint: '/api/graphql',
	schema: schema,
	logging: 'debug',
});
// Handler wrapper for Next.js API routes
export async function GET(request: Request) {
	return yoga.handleRequest(request, {});
}

export async function POST(request: Request) {
	return yoga.handleRequest(request, {});
}
