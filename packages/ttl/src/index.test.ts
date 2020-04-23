import { promises as fs } from 'fs'
import { resolve } from 'path'
import { TTL } from '.'

let file = ''
let ttl: TTL

describe('TTL', () => {
  beforeAll(async () => {
    file = await fs.readFile(resolve('sample.ttl'), 'utf-8')
    ttl = new TTL(file)
  })

  it('should load .ttl file correctly', async () => {
    expect(await ttl.read()).toBe(file)
  })

  it('should find virtual being', () => {
    expect(ttl.find('キズナアイ')).toBeDefined()
  })

  it('should update virtual being', () => {
    const virtualBeing = ttl.find('キズナアイ')
    ttl.update(virtualBeing, { twitterAccount: 'test' })
    expect(ttl.find('キズナアイ').twitterAccount).toBe('test')
  })

  it ('should find all virtual beings', () => {
    expect(ttl.findAll()).toBeDefined()
  })
})
