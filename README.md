# gatsby-transformer-svg-sprites [![npm][1]][2]

Gatsby plugin to generate SVG sprites from GraphQL sources.

## Installation

```sh
npm install gatsby-transformer-svg-sprites
```

## Usage

```js
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-transformer-svg-sprites',
      options: {
        /* gatsby-transformer-svg-sprites options here */
      }
    }
  ]
}
```

### GraphQL / JavaScript example

```js
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

## Options

### optimize

Type: `boolean`. Default: `process.env.NODE_ENV === 'production'`.

Defines if the sprites file should be minified. By default, it is enabled on
production environments.

### skip

Type: `string` or `Array`. Default: `''`.

A path or an array of paths that shouldn't be included in the sprites file. It
supports glob patterns.

### SVG Mixer options

Any other option passed to `gatsby-transformer-svg-sprites` will be passed to
`svg-mixer` — more info about its options can be found [here][3].

## License

[The MIT License][license]

[1]: https://img.shields.io/npm/v/gatsby-transformer-svg-sprites
[2]: https://www.npmjs.com/package/gatsby-transformer-svg-sprites
[3]: https://github.com/JetBrains/svg-mixer/tree/master/packages/svg-mixer#configuration
[license]: ./LICENSE
