# gatsby-transformer-svg-sprites

Gatsby plugin to generate SVG sprites from GraphQL sources.

## Install

```sh
$ npm install gatsby-transformer-svg-sprites
```

Enable the plugin in `gatsby-config.js`:

```js
module.exports = {
  plugins: [
    `gatsby-transformer-svg-sprites`
  ]
}
```

## Usage

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

## Configure

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-svg-sprites`,
      // options: {
      //   optimize: process.env.NODE_ENV === 'production',
      //   skip: '',
      //   // ...SVG Mixer options
      // }
    }
  ]
}
```

### options

Type: `Object`. Default: `{}`.

The `options` object is passed to __SVG Mixer__. More info about its
configuration can be found [here][1].



### optimize

Type: `boolean`. Default: `process.env.NODE_ENV === 'production'`.

Defines if the sprites file should be minified. By default, it is enabled on
production environments.

### skip

Type: `string` or `Array`. Default: `''`.

A path or an array of paths that shouldn't be included in the sprites file. It
supports glob patterns.

## License

[The MIT License][license]

[1]: https://github.com/JetBrains/svg-mixer/tree/master/packages/svg-mixer#configuration
[license]: ./LICENSE
