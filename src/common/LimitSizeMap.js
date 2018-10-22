class LimitSizeMap {
    dictionaryMeta = [];

    constructor(maxSize = 1000, iterable) {
        this.maxSize = maxSize;
        this.inner = new Map(iterable)
    }

    put(key, value) {
       this.set(key, value);
    }

    set(key, value) {
        this.dictionaryMeta.push(key);
        this.inner.set(key, value);

        if(this.inner.size > this.maxSize) {
            this.inner.delete(this.dictionaryMeta.shift());
        }
    }

    get(key) {
        return this.inner.get(key);
    }

    contains(key) {
        return this.has(key);
    }

    has(key) {
        return this.inner.has(key);
    }
}

export default LimitSizeMap;
