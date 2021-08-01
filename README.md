# gatsby-transformer-svg-sprites

Gatsby plugin for creating SVG sprites from GraphQL sources.

## Install

```bash
$ npm install gatsby-transformer-svg-sprites
```

## Configure

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-svg-sprites`,
      options: {
        minify: process.env.NODE_ENV === 'production',
        skip: '',
        /* ...SVG Mixer options */
      },
    },
  ],
}
```

## Options

### options

Default: `{}`; Type: `Object`.

The `options` object is passed to __SVG Mixer__. More info about its
configuration can be found [here][1].

[1]: https://github.com/JetBrains/svg-mixer/tree/master/packages/svg-mixer#configuration

### minify

Default: `process.env.NODE_ENV === 'production'`; Type: `boolean`.

Defines if the sprites file should be minified. By default, it is enabled on
production environments.

### skip

Default: `''`; Type: `string` or `Array`.

A path or an array of paths that shouldn't be included in the sprites file. It
supports glob patterns.

## Usage

```javascript
import { graphql } from 'gatsby'
import React from 'react'

const Page = ({ data }) => (
  <>
    {data.allFile.nodes.map(node => {
      const svg = node.childSvgSprites

      return svg && (
        <svg key={svg.url} viewBox={svg.viewBox}>
          <use xlinkHref={svg.url}/>
        </svg>
      )
    })}
  </>
)

export default Page

export const query = graphql`
  query {
    allFile {
      nodes {
        childSvgSprites {
          url
          viewBox
        }
      }
    }
  }
`
```

## License

[The MIT License](./LICENSE)
