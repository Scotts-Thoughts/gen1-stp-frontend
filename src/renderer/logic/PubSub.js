
// This is a standard-pattern for allowing communication between vue components and other things.
class PubSub {
	constructor() {
		this.subscribers = new Map();
	}

	// Subscribe to the target event, e.g. "timeUpdate". The "subscriber" is also the function that will be called
	// if that event is "published".
	subscribe(event, subscriber) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event).push(subscriber);
    }

	// Unsubscribe a previously registered subscriber from an event:
	unsubscribe(event, subscriber) {
        if (this.subscribers.has(event)) {
            const updatedSubscribers = this.subscribers.get(event).filter(sub => sub !== subscriber);
            if (updatedSubscribers.length > 0) {
                this.subscribers.set(event, updatedSubscribers);
            } else {
                this.subscribers.delete(event);
            }
        }
    }

	// Notify subscribers about an event.
	publish(event, payload) {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event).forEach(subscriber => {
                subscriber(payload);
            });
        }
    }
}

export default new PubSub();