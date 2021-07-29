import m from 'mithril';
import { css } from '@emotion/css';

const wrapperStyle = css`
  &,
  sd-field {
    display: block;
  }

  * {
    box-sizing: border-box;
  }

  position: relative;

  sd-dropdown-input,
  sd-dropdown-input > * {
    cursor: pointer;
  }

  sd-dropdown-input:focus-within input {
    cursor: text;
  }

  sd-dropdown-input > * {
    align-self: center;
  }

  sd-dropdown-input > .icon {
    width: 30px;
  }

  width: 100%;

  & ul {
    max-height: 200px;
    overflow: auto;
    border: 1px solid black;
    padding: 0;
    margin: 0;
    width: 100%;
  }

  & li:hover {
    background-color: #563e6f;
    color: white;
  }
  & li.active:not(li:hover) {
    background-color: #dcceeb;
  }

  & li {
    padding: 7px;
    cursor: pointer;
  }
`

const dropdownStyle = css`
  position: absolute;
  width: 100%;
  z-index: 900;
  display: none;
  background-color: white;

  .opened & {
    display: block;
  }
`

const inputStyle = css`
  display: flex;
  flex-direction: row;
  border: 1px solid black;

  :focus-within {
    outline: -webkit-focus-ring-color solid 1px;
  }

  & input:focus {
    outline: none;
  }

  & input {
    flex-grow: 1;
    display: block;
    padding: 5px;
    font-size: 100%;
    border: none;
  }
`;

export default function SelectDown () {
  let searchTerm = null;
  let highlightedIndex = 0;
  let blurTimeout;
  let isOpen = false;

  const listboxId = Math.random().toString(36).substring(2);

  return {
    oncreate: () => {
      // iOS: fix bug where touching document
      // doesn't blur activeElement
      document.body.tabIndex = -1;
    },

    view: vnode => {
      const items = vnode.attrs.items;
      const highlightedItem = vnode.attrs.items[highlightedIndex];
      const ListItem = vnode.attrs.renderListItem;

      function handleListItemClick (item) {
        vnode.attrs.onchange && vnode.attrs.onchange(item);
        searchTerm = null;
        m.redraw();

        setTimeout(() => {
          document.activeElement.blur();
        });
      }

      function handleInputFocus (event) {
        event.target.value = '';
        setTimeout(() => {
          if (!isOpen) {
            return
          }
          event.target.select();
        }, 50);
      }

      function handleSearch (event) {
        if (event.target.value === '') {
          searchTerm = '';
          vnode.attrs.onchange(null);
          vnode.attrs.onsearch(null);
        } else {
          searchTerm = event.target.value;
          vnode.attrs.onsearch(searchTerm);
        }

        highlightedIndex = 0;
        m.redraw();

        setTimeout(()  => {
          const dropdownList = vnode.dom.querySelector('sd-dropdown ul');
          if (dropdownList) {
            dropdownList.scrollTop = 0;
          }
        });
      }

      function handleBlur (event) {
        searchTerm = null;
        if (event.relatedTarget && event.relatedTarget.closest('sd-select')) {
          return
        }

        event.stopPropagation();
        blurTimeout = setTimeout(() => {
          isOpen = false;
          if (searchTerm) {
            vnode.attrs.onchange(null);
          }
          searchTerm = null;
          vnode.attrs.onsearch(searchTerm);
          m.redraw();
        });
      }

      function handleFocus (event) {
        event.stopPropagation();

        if (!isOpen) {
          setTimeout(()  => {
            const activeElement = vnode.dom.querySelector('sd-dropdown li.active');
            if (activeElement) {
              vnode.dom.querySelector('sd-dropdown ul').scrollTop = activeElement.offsetTop;
            }
          });
        }

        isOpen = true;
        blurTimeout = clearTimeout(blurTimeout);

        highlightedIndex = items.findIndex(item => item === vnode.attrs.value);
        m.redraw();
      }

      function handleKeyDown (event) {
        if (event.key === 'ArrowDown') {
          highlightedIndex = highlightedIndex + 1;
          event.preventDefault();
        }

        if (event.key === 'ArrowUp') {
          highlightedIndex = highlightedIndex - 1;
          event.preventDefault();
        }

        if (event.key === 'Escape') {
          document.activeElement.blur();
        }

        if (['Enter', 'Tab'].includes(event.key)) {
          handleListItemClick(vnode.attrs.items[highlightedIndex]);
          searchTerm = null;
          document.activeElement.blur();
          isOpen = false;
        }

        m.redraw();
      }

      function focusOnInput () {
        vnode.dom.querySelector('input').focus();
      }

      return (
        m('sd-select',
          {
            onfocusout: handleBlur,
            onfocusin: handleFocus,
            class: [
              wrapperStyle,
              isOpen && 'opened',
              vnode.attrs.class
            ].filter(Boolean).join(' ')
          },
          m('sd-dropdown-input', { class: inputStyle, onclick: focusOnInput },
            m('input', {
              role: 'combobox',
              'aria-autocomplete': 'both',
              'area-owns': listboxId,

              id: vnode.attrs.id,
              value: searchTerm ? searchTerm : vnode.attrs.valueText,
              placeholder: vnode.attrs.placeholder,
              onfocus: handleInputFocus,
              oninput: handleSearch,
              onkeydown: handleKeyDown,
            }),

            m('div', {
              class: 'icon',
              innerHTML: `
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 36 36">
                  <path d="M10.5 15l7.5 7.5 7.5-7.5z"/>
                </svg>
              `              
            })
          ),

          isOpen && m('div', {
            style: { display: 'none' },
            'aria-live': 'assertive'
          }, items.length + ' suggestions found, choose using the up and down arrows'), 

          isOpen && m('sd-dropdown', { tabindex: 0, onfocusin: focusOnInput, class: dropdownStyle },
            m('ul', { id: listboxId, role: 'listbox' },
              items.map(item => {
                return (
                  m('li',
                    {
                      role: 'option',
                      className: item === highlightedItem ? 'active' : undefined,
                      onclick: handleListItemClick.bind(null, item)
                    },
                    ListItem({ item })
                  )
                )
              })
            )
          )
        )
      )
    }
  }
}