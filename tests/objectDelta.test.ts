import { objectDelta } from '@/objectDelta'
import { describe, it, expect } from 'vitest'
describe('basic', () => {
    it('add numbers', () => {
        const source = {
            a: 2,
        }
        const result = objectDelta(source, {
            a: 3,
        })
        expect(result.a).toBe(5)
    })
    it('add strings', () => {
        const source = {
            a: 'ab',
        }
        const result = objectDelta(source, {
            a: 'c',
        })
        expect(result.a).toBe('abc')
    })
})
describe('arrays', () => {
    it('append arrays', () => {
        expect(
            objectDelta({ a: [1, 2, 3] }, { a: [4, 5, 6] })
                .a
        ).toStrictEqual([1, 2, 3, 4, 5, 6])
    })
})
describe('deep', () => {
    it('add deep strings', () => {
        const source = {
            a: {
                q: 'a',
            },
            c: {
                w: 4,
                x: void 0,
            },
        }
        const result = objectDelta(source, {
            a: {
                q: 'b',
            },
            c: {
                x: 3,
            },
        })
        expect(result.a.q).toBe('ab')
        expect(result.c.x).toBe(3)
        expect(result.c.w).toBe(4)
    })
})
