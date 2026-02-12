const fakeStorage = {
	_data: {},

	setItem(id, val) {
		return this._data[id] = String(val);
	},

	getItem(id) {
		return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
	},

	removeItem(id) {
		return delete this._data[id];
	},

	clear() {
		return this._data = {};
	},
};

class LocalStorage {
	constructor() {
		const supported = this.localStorageSupported();
		this.storage = supported ? window.localStorage : fakeStorage;
	}

	localStorageSupported() {
		const testKey = 'testRedemptionViewer';
		const storage = window.localStorage;

		try {
			storage.setItem(testKey, '1');
			storage.removeItem(testKey);
			return true;
		} catch (error) {
			return false;
		}
	}
}

export { LocalStorage, fakeStorage };
