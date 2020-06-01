class Emitter {
	constructor() {
		this.events = {};
	}

	emit(event, ...args) {
		if (this.events[event]) {
			this.events[event].forEach((fn) => fn(...args));
		}
		return this;
	}

	on(event, fn) {
		if (this.events[event]) this.events[event].push(fn);
		else this.events[event] = [fn];
		return this;
	}

	off(event, fn) {
		if (event) {
			const listeners = this.events[event];
			this.events[event] = listeners.filter((_fn) => _fn !== fn);
		} else this.events[event] = [];
		return this;
	}
}

export default Emitter;
