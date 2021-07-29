import numbertoWords from 'number-to-words';
import m from 'mithril';
import { css } from '@emotion/css';

import SelectDown from '../../lib/index';

const createArray = length => Array(length).fill('').map((_, index) => index);

function Demo () {
  const state = {
    items: createArray(100).map(index => {
      return { id: index, title: numbertoWords.toWords(index) }
    }),
    filteredItems: null,
    value: null
  };

  function handleSearchChange (searchTerm) {
    if (!searchTerm) {
      state.filteredItems = state.items;
      return
    }

    state.filteredItems = state.items.filter(item => {
      return item.title.toLowerCase().includes(searchTerm.toLowerCase());
    })

    m.redraw();
  }
  handleSearchChange();

  function handleSelectChange (newValue) {
    state.value = newValue;

    m.redraw();
  }

  return {
    view: () => {
      return (
        m('div',
          m('h1', 'Demo of SelectDown'),
          m('input'),
          m(SelectDown, {
            class: css`
              sd-dropdown {
                background-color: #ffffd5;
              }
            `,
            onchange: handleSelectChange,
            onsearch: handleSearchChange,

            placeholder: 'Select an item...',

            items: state.filteredItems,
            value: state.value,
            valueText: state.value && state.value.title,

            renderListItem: ({ item }) => (
              m('span', { key: item.id }, item.title)
            )
          }),
          state.value && state.value.title
        )
      )
    }
  };
}

document.addEventListener('DOMContentLoaded', function () {
  m.redraw = () => m.render(document.body, m(Demo));
  m.redraw();
});
