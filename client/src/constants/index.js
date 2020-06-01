/**
 * @constant {Object} STATUS
 * @memberof Constants
 */
export const STATUS = {
	IDLE: 'idle',
	RUNNING: 'running',
	READY: 'ready',
	SUCCESS: 'success',
	ERROR: 'error',
};

export const BACKEND = process.env.REACT_APP_BASE_API_URL ?? '';
