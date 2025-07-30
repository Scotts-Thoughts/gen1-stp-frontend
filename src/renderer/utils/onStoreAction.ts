import { Store, StoreActions } from "pinia";
export function onStoreAction<T extends Store>(
	store: T, 
	action: keyof StoreActions<T>,
	callback: () => void,
) {	
	store.$onAction(({name}) => {
		if (name === action ) {
			callback();
		}
	});
}