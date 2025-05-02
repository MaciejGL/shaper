import { createYoga } from 'graphql-yoga';
import { createSchema } from './schema';

const schema = await createSchema();

const yoga = createYoga({
	graphqlEndpoint: '/api/graphql',
	schema: schema,
});

// Export handlers for Next.js API routes
export { yoga as GET, yoga as POST };
