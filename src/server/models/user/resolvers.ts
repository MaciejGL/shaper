// export const Query: GQLQueryResolvers = {}

export const Query = {
	user: async () => {
		return { id: '123' };
	},
};

export const Mutation = {};
