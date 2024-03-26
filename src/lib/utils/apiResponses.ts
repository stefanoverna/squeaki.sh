import { ApiError } from '@datocms/cma-client';

export class ErrorWithStatus extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}

	respond() {
		return Response.json(
			{
				status: 'error',
				details: this.message,
			},
			{ status: this.status },
		);
	}
}

export function handleErrors(e: unknown) {
	if (e instanceof ErrorWithStatus) {
		return e.respond();
	}

	return Response.json(
		{
			status: 'error',
			details:
				e instanceof ApiError
					? e.response.body
					: e instanceof Error
						? e.message
						: JSON.stringify(e),
		},
		{ status: 500 },
	);
}
