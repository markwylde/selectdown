# selectdown

A dropdown select input for mithril

## Example

[Demo app](https://markwylde.github.io/selectdown/)

## Getting started

```bash
npm i --save selectdown
```

### Usage
The basic usage can be seen below, but a better example is [the demo](demo/src/index.js) included in this project.

```js
const SelectDown = require('selectdown');
m(SelectDown, {
  onchange: () => {},
  onsearch: () => {},

  placeholder: 'Select an item...',

  items: [],
  value: null,
  valueText: null,

  renderListItem: ({ item }) => (
    m('span', { key: item.id }, item.title)
  )
})
```

## License
This project is licensed under the terms of the MIT license.
