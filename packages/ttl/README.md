# @vlueprint-experimental/ttl

JavaScript libraly that parse and update `.ttl` file for [vlueprint](https://vlueprint.org).

## Usage

```ts
import { promises as fs } from 'fs'
import { resolve } from 'path'
import { TTL } from 'path-to-TTL'

const file = await fs.readFile(resolve('sample.ttl'), 'utf-8')
const ttl = new TTL(file)

const kizunaAi = ttl.find('キズナアイ')
// {
//   label: 'キズナアイ',
//   youtubeChannelId: 'UC4YaOt1yT-ZeyB0OmxHgolA',
//   youtubeChannelName: 'A.I.Channel',
//   twitterAccount: 'aichan_nel',
//   office: 'upd8'
// }

const kizunaAi = ttl.findAll()
// [{
//   label: 'キズナアイ',
//   youtubeChannelId: 'UC4YaOt1yT-ZeyB0OmxHgolA',
//   youtubeChannelName: 'A.I.Channel',
//   twitterAccount: 'aichan_nel',
//   office: 'upd8'
// }, ...]

ttl.update(kizunaAi, { twitterAccount: 'test' })
const updatedLKizunaAi = ttl.find('キズナアイ')
// {
//   label: 'キズナアイ',
//   youtubeChannelId: 'UC4YaOt1yT-ZeyB0OmxHgolA',
//   youtubeChannelName: 'A.I.Channel',
//   twitterAccount: 'test',
//   office: 'upd8'
// }

await ttl.read()
// @base <https://vlueprint.org/resource/> .

// @prefix vlueprint: <https://vlueprint.org/schema/>.
// @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
// @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.

// <キズナアイ> a vlueprint:VirtualBeing;
//     rdfs:label "キズナアイ";
//     vlueprint:youtubeChannelId "UC4YaOt1yT-ZeyB0OmxHgolA";
//     vlueprint:youtubeChannelName "A.I.Channel";
//     vlueprint:twitterAccount "test";
//     vlueprint:office "upd8".
```

## LISENCE

MIT
