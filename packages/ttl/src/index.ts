import { DataFactory, Parser, Store, Writer } from 'n3'

const { literal, namedNode } = DataFactory

export class TTL<V extends { [key: string]: string } = any> {
  #store: Store
  base: string
  prefixes: { [key: string]: string }

  constructor(file: string) {
    const parser = new Parser()
    this.#store = new Store(parser.parse(file))
    this.base = parser._base
    this.prefixes = parser._prefixes
  }

  read() {
    const writer = new Writer({ prefixes: this.prefixes })

    const replaceFunction = (proxied: { apply: Function }) => {
      writer._writeQuad = function (subject: { equals: Function }) {
        if (!subject.equals(this._subject)) {
          this._write(this._subject === null ? '' : '.\n\n')
          this._subject = null
        }
        proxied.apply(this, arguments)
      }
    }
    replaceFunction(writer._writeQuad)

    writer.addQuads(this.#store.getQuads())
    const regexp = new RegExp(
      this.base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'g'
    )

    return new Promise<string>((resolve, reject) => {
      writer.end((error: Error, result: string) => {
        if (error) reject()
        resolve(`@base <${this.base}> .\n\n${result.replace(regexp, '')}`)
      })
    })
  }

  find(label: string) {
    const subject = namedNode(this.base + label)
    const quads = this.#store.getQuads(subject)
    return Object.fromEntries([
      ['label', label],
      ...quads
        .map((quad) => {
          const regExp = new RegExp(
            this.prefixes.vlueprint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            'g'
          )
          if (!regExp.test(quad.predicate.id)) return
          const key = quad.predicate.id.replace(this.prefixes.vlueprint, '')
          const value = quad.object.id.replace(/"/g, '')
          return [key, value]
        })
        .filter((value): value is [string, string] => value !== undefined),
    ]) as V
  }

  findAll() {
    const quads = this.#store.getQuads()
    let value = { label: quads[0].subject.id.replace(this.base, '') }

    return quads
      .map((quad, index, array) => {
        if (quad.predicate.id.includes(this.prefixes.vlueprint)) {
          value = {
            ...value,
            [quad.predicate.id.replace(
              this.prefixes.vlueprint,
              ''
            )]: quad.object.id.replace(/"/g, ''),
          }
        }

        const nextQuadSubjectId = array[index + 1]?.subject?.id
        if (quad.subject.id !== nextQuadSubjectId) {
          const prevValue = value
          value = { label: nextQuadSubjectId?.replace(this.base, '') }
          return prevValue
        }
      })
      .filter((value) => !!value)
  }

  update<T extends { [key: string]: string }>(
    params: T,
    payload: { [K in keyof T]?: string }
  ) {
    Object.keys(params).forEach((key: keyof T) => {
      if (key === 'label') return
      if (typeof payload[key] !== 'string') return

      const subject = namedNode(this.base + params.label)
      const predicate = namedNode(this.prefixes.vlueprint + key)
      const quads = this.#store.getQuads(
        subject,
        predicate,
        literal(params[key])
      )
      this.#store.removeQuads(quads)
      this.#store.addQuad(subject, predicate, literal(payload[key] as string))
    })
  }
}
