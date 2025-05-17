export function objectDelta<T extends object>(
    prev: undefined | T,
    delta: T
): T
export function objectDelta<T extends object>(
    prev: T,
    delta: undefined | T
): T
export function objectDelta<T extends object>(
    prev: T,
    delta: T
): T
export function objectDelta<T extends object>(
    prev: undefined,
    delta: undefined
): undefined
export function objectDelta<T extends object>(
    prev: T | undefined,
    delta: T | undefined
): T | undefined {
    if (!prev && !delta) {
        return void 0
    } else if (!delta) {
        return deepCopy(prev)
    } else if (!prev) {
        return deepCopy(delta)
    }
    const result: any = deepCopy(prev)
    for (const key in delta) {
        if (delta[key] && Array.isArray(delta[key])) {
            const oldValue: [] =
                (result[key] as [] | undefined) ?? []
            const deltaArray: [] = delta[key] as []
            result[key] = [...oldValue, ...deltaArray]
        } else if (typeof delta[key] === 'object') {
            result[key] = objectDelta(
                result[key] as object | undefined,
                delta[key] as object
            )
        } else if (typeof delta[key] === 'string') {
            const oldValue: string =
                (result[key] as string | undefined) ?? ''
            result[key] = oldValue + delta[key]
        } else if (typeof delta[key] === 'number') {
            const oldValue: number =
                (result[key] as number | undefined) ?? 0
            result[key] = oldValue + delta[key]
        } else {
            result[key] = delta[key]
        }
    }
    return result
}
// export interface ValueAdder {
//     add(oldValue: any, newValue: any): any
// }
// const numberAdder: ValueAdder = (oldValue, newValue) => {
//     if (typeof oldValue !== "number") {
//         return
//     }
//     if (typeof newValue !== "number") {
//         return
//     }

// }

function deepCopy<T>(source: T, cache = new WeakMap()): T {
    // 处理原始类型或函数
    if (source === null || typeof source !== 'object') {
        return source
    }

    // 处理循环引用
    if (cache.has(source)) {
        return cache.get(source)
    }

    // 处理日期
    if (source instanceof Date) {
        return new Date(source.getTime()) as T
    }

    // 处理正则表达式
    if (source instanceof RegExp) {
        return new RegExp(source.source, source.flags) as T
    }

    // 处理数组
    if (Array.isArray(source)) {
        const clonedArray: any[] = []
        cache.set(source, clonedArray)
        source.forEach((item) => {
            clonedArray.push(deepCopy(item, cache))
        })
        return clonedArray as T
    }

    // 处理普通对象

    const clonedObject = Object.create(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Object.getPrototypeOf(source)
    )
    cache.set(source, clonedObject)
    for (const key in source) {
        // eslint-disable-next-line no-prototype-builtins
        if (source.hasOwnProperty(key)) {
            clonedObject[key] = deepCopy(source[key], cache)
        }
    }

    return clonedObject
}
