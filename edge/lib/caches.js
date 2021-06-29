const cache = {}
export function getCache () {
    if (typeof caches !== 'undefined') {
        return caches.default
    } else {
        return {
            put: async (key, val) => {
                // cache[key] = val
            },
            match: async (key) => {
                // if (cache[key] && cache[key].clone) {
                //     return cache[key].clone()
                // }

                return null // cache[key]
            }
        }
    }
}