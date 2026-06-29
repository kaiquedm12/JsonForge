import { describe, it, expect } from 'vitest'
import { convertJson } from '../converters'

describe('convertJson', () => {
  it('should convert to YAML', () => {
    const json = '{"name": "test", "value": 42}'
    const result = convertJson(json)
    expect(result.yaml).toContain('name: test')
    expect(result.yaml).toContain('value: 42')
  })

  it('should convert to XML', () => {
    const json = '{"name": "test"}'
    const result = convertJson(json)
    expect(result.xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(result.xml).toContain('<name>test</name>')
  })

  it('should convert to CSV', () => {
    const json = '{"name": "test", "age": 30}'
    const result = convertJson(json)
    expect(result.csv).toContain('name')
    expect(result.csv).toContain('age')
    expect(result.csv).toContain('test')
    expect(result.csv).toContain('30')
  })

  it('should convert to TOML', () => {
    const json = '{"name": "test", "count": 42}'
    const result = convertJson(json)
    expect(result.toml).toContain('name = "test"')
    expect(result.toml).toContain('count = 42')
  })

  it('should handle all formats for nested objects', () => {
    const json = '{"user": {"name": "John", "scores": [1, 2, 3]}}'
    const result = convertJson(json)
    expect(result.yaml).toBeTruthy()
    expect(result.xml).toContain('<user>')
    expect(result.csv).toBeTruthy()
    expect(result.toml).toBeTruthy()
  })
})
