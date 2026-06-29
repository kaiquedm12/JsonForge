import { describe, it, expect, beforeEach } from 'vitest'
import { parseJson, stringifyJson, toggleCollapse, findValue, searchNodes } from '../jsonParser'

describe('parseJson', () => {
  it('should parse a simple object', () => {
    const json = '{"name": "test", "age": 30}'
    const node = parseJson(json)
    expect(node.type).toBe('object')
    expect(node.key).toBeNull()
    expect(node.path).toBe('$')
    expect(node.children).toHaveLength(2)
  })

  it('should parse nested objects', () => {
    const json = '{"a": {"b": 1}}'
    const node = parseJson(json)
    expect(node.type).toBe('object')
    expect(node.children).toHaveLength(1)
    expect(node.children[0].type).toBe('object')
    expect(node.children[0].children[0].value).toBe(1)
  })

  it('should parse arrays', () => {
    const json = '{"items": [1, 2, 3]}'
    const node = parseJson(json)
    expect(node.children[0].type).toBe('array')
    expect(node.children[0].children).toHaveLength(3)
  })

  it('should handle primitive types', () => {
    const json = '{"s": "hello", "n": 42, "b": true, "nu": null}'
    const node = parseJson(json)
    const types = node.children.map((c) => c.type)
    expect(types).toContain('string')
    expect(types).toContain('number')
    expect(types).toContain('boolean')
    expect(types).toContain('null')
  })

  it('should throw on invalid JSON', () => {
    expect(() => parseJson('invalid')).toThrow()
  })
})

describe('stringifyJson', () => {
  it('should convert node back to JSON string', () => {
    const json = '{"name":"test","values":[1,2,3]}'
    const node = parseJson(json)
    const result = stringifyJson(node)
    expect(JSON.parse(result)).toEqual(JSON.parse(json))
  })

  it('should preserve nested structures', () => {
    const json = '{"a":{"b":{"c":42}}}'
    const node = parseJson(json)
    const result = stringifyJson(node)
    expect(JSON.parse(result)).toEqual({ a: { b: { c: 42 } } })
  })
})

describe('toggleCollapse', () => {
  it('should toggle collapse state of a node', () => {
    const json = '{"a": {"b": 1}, "c": 2}'
    const node = parseJson(json)
    const toggled = toggleCollapse(node, '$.a')
    expect(toggled.children[0].collapsed).toBe(true)
    const toggledAgain = toggleCollapse(toggled, '$.a')
    expect(toggledAgain.children[0].collapsed).toBe(false)
  })
})

describe('findValue', () => {
  it('should find a value by path', () => {
    const json = '{"a": {"b": 42}}'
    const node = parseJson(json)
    expect(findValue(node, '$.a.b')).toBe(42)
  })

  it('should return undefined for non-existent path', () => {
    const json = '{"a": 1}'
    const node = parseJson(json)
    expect(findValue(node, '$.b')).toBeUndefined()
  })
})

describe('searchNodes', () => {
  const json = '{"name": "John", "age": 30, "nested": {"name": "Jane"}}'
  const node = parseJson(json)

  it('should search by key', () => {
    const results = searchNodes(node, 'name', 'key')
    expect(results).toHaveLength(2)
  })

  it('should search by value', () => {
    const results = searchNodes(node, 'John', 'value')
    expect(results).toHaveLength(1)
    expect(results[0]).toBe('$.name')
  })

  it('should search by path', () => {
    const results = searchNodes(node, 'nested.name', 'path')
    expect(results).toHaveLength(1)
    expect(results[0]).toBe('$.nested.name')
  })

  it('should return empty array for no match', () => {
    const results = searchNodes(node, 'xyz', 'key')
    expect(results).toHaveLength(0)
  })
})
