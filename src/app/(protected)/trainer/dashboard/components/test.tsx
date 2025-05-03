'use client';

import { useUserQuery } from '@/generated/graphql';

export function Test() {
	const { data, isLoading, error } = useUserQuery();
	return (
		<div>
			Test Data:
			<pre>{JSON.stringify(data, null, 2)}</pre>
			IsLoading:
			<pre>{JSON.stringify(isLoading, null, 2)}</pre>
			Error:
			<pre>{JSON.stringify(error, null, 2)}</pre>
		</div>
	);
}
