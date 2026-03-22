import { describe, it, expect } from 'vitest'
import { parseSql } from '../sql-parser'

describe('parseSql', () => {
  it('parses a simple CREATE TABLE', () => {
    const result = parseSql(`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL
      );
    `)
    expect(result.tables).toHaveLength(1)
    expect(result.tables[0].name).toBe('users')
    expect(result.tables[0].columns).toHaveLength(3)
    expect(result.tables[0].columns[0].isPrimaryKey).toBe(true)
    expect(result.tables[0].columns[0].dataType).toBe('uuid')
    expect(result.tables[0].columns[1].isNotNull).toBe(true)
    expect(result.tables[0].columns[1].isUnique).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('parses multiple tables', () => {
    const result = parseSql(`
      CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));
      CREATE TABLE posts (id INT PRIMARY KEY, title TEXT);
    `)
    expect(result.tables).toHaveLength(2)
    expect(result.tables[0].name).toBe('users')
    expect(result.tables[1].name).toBe('posts')
  })

  it('parses FOREIGN KEY constraints', () => {
    const result = parseSql(`
      CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));
      CREATE TABLE posts (
        id INT PRIMARY KEY,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `)
    expect(result.tables).toHaveLength(2)
    expect(result.relationships).toHaveLength(1)
    expect(result.relationships[0].cardinality).toBe('1:N')
    const fkCol = result.tables[1].columns.find((c) => c.name === 'user_id')
    expect(fkCol?.isForeignKey).toBe(true)
  })

  it('parses inline REFERENCES', () => {
    const result = parseSql(`
      CREATE TABLE users (id INT PRIMARY KEY);
      CREATE TABLE posts (
        id INT PRIMARY KEY,
        user_id INT REFERENCES users(id)
      );
    `)
    expect(result.relationships).toHaveLength(1)
    const fkCol = result.tables[1].columns.find((c) => c.name === 'user_id')
    expect(fkCol?.isForeignKey).toBe(true)
  })

  it('parses ALTER TABLE ADD FOREIGN KEY', () => {
    const result = parseSql(`
      CREATE TABLE users (id INT PRIMARY KEY);
      CREATE TABLE posts (id INT PRIMARY KEY, user_id INT);
      ALTER TABLE posts ADD FOREIGN KEY (user_id) REFERENCES users(id);
    `)
    expect(result.relationships).toHaveLength(1)
  })

  it('parses table-level PRIMARY KEY', () => {
    const result = parseSql(`
      CREATE TABLE t (
        a INT NOT NULL,
        b INT NOT NULL,
        PRIMARY KEY (a, b)
      );
    `)
    expect(result.tables[0].columns[0].isPrimaryKey).toBe(true)
    expect(result.tables[0].columns[1].isPrimaryKey).toBe(true)
  })

  it('parses DEFAULT values', () => {
    const result = parseSql(`
      CREATE TABLE t (
        id SERIAL PRIMARY KEY,
        active BOOLEAN DEFAULT true,
        name VARCHAR(100) DEFAULT 'unnamed'
      );
    `)
    expect(result.tables[0].columns[0].dataType).toBe('serial')
    expect(result.tables[0].columns[1].defaultValue).toBe('true')
    expect(result.tables[0].columns[2].defaultValue).toBe('unnamed')
  })

  it('parses CREATE INDEX', () => {
    const result = parseSql(`
      CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(255));
      CREATE INDEX idx_email ON users(email);
    `)
    expect(result.tables[0].indexes).toHaveLength(1)
    expect(result.tables[0].indexes[0].name).toBe('idx_email')
    expect(result.tables[0].indexes[0].type).toBe('btree')
  })

  it('parses CREATE UNIQUE INDEX', () => {
    const result = parseSql(`
      CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(255));
      CREATE UNIQUE INDEX idx_email ON users(email);
    `)
    expect(result.tables[0].indexes[0].isUnique).toBe(true)
  })

  it('handles SQL comments', () => {
    const result = parseSql(`
      -- This is a comment
      CREATE TABLE users (
        id INT PRIMARY KEY /* inline comment */
      );
    `)
    expect(result.tables).toHaveLength(1)
  })

  it('handles empty input', () => {
    const result = parseSql('')
    expect(result.tables).toHaveLength(0)
    expect(result.relationships).toHaveLength(0)
    expect(result.errors).toHaveLength(0)
  })

  it('reports errors for malformed SQL', () => {
    const result = parseSql('CREATE TABLE;')
    expect(result.tables).toHaveLength(0)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('parses MySQL AUTO_INCREMENT', () => {
    const result = parseSql(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255)
      );
    `)
    expect(result.tables[0].columns[0].dataType).toBe('serial')
  })

  it('parses table-level UNIQUE constraint', () => {
    const result = parseSql(`
      CREATE TABLE t (
        email VARCHAR(255),
        UNIQUE (email)
      );
    `)
    expect(result.tables[0].columns[0].isUnique).toBe(true)
  })

  it('parses USING index type', () => {
    const result = parseSql(`
      CREATE TABLE users (id INT PRIMARY KEY, tags JSONB);
      CREATE INDEX idx_tags ON users USING gin(tags);
    `)
    expect(result.tables[0].indexes[0].type).toBe('gin')
  })
})
