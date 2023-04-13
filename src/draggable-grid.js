import { LitElement, html, css } from 'lit';
import { ReactiveElement } from '@lit/reactive-element';
import { motion } from '@lit/labs/motion';
import interact from 'interactjs';

class DraggableGrid extends ReactiveElement {
  static get properties() {
    return {
      items: { type: Array },
    };
  }
  static get styles() {
    return css`
      .grid {
        position: relative;
        width: 100%;
        height: 100%;
      }
  
      .grid-item {
        position: absolute;
        background-color: rgba(0, 150, 255, 0.5);
        border: 1px solid rgba(0, 0, 0, 0.25);
        touch-action: none;
        cursor: move;
        box-sizing: border-box;
      }
  
      .grid-item::after {
        content: "";
        position: absolute;
        bottom: 0;
        right: 0;
        width: 16px;
        height: 16px;
        background: linear-gradient(45deg, transparent 0%, transparent 46%, rgba(0, 0, 0, 0.25) 46%, rgba(0, 0, 0, 0.25) 54%, transparent 54%, transparent 100%), linear-gradient(-45deg, transparent 0%, transparent 46%, rgba(0, 0, 0, 0.25) 46%, rgba(0, 0, 0, 0.25) 54%, transparent 54%, transparent 100%);
        cursor: nwse-resize;
      }
  
      button {
        display: block;
        margin-top: 8px;
      }
    `;
  }

  constructor() {
    super();
    this.items = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadGrid();
  }

  _loadGrid() {
    const savedGrid = localStorage.getItem('grid');
    if (savedGrid) {
      this.items = JSON.parse(savedGrid);
    }
  }

  _saveGrid() {
    localStorage.setItem('grid', JSON.stringify(this.items));
  }

  addItem() {
    const newItem = {
      id: new Date().getTime(),
      x: 0,
      y: 0,
      w: 100,
      h: 100,
    };
    this.items = [...this.items, newItem];
    this._saveGrid();
  }

  updated(changedProperties) {
    if (changedProperties.has('items')) {
      interact('.grid-item').draggable({
        onmove: (event) => {
          const target = event.target;
          const { x, y } = target.dataset;

          const newX = (parseFloat(x) || 0) + event.dx;
          const newY = (parseFloat(y) || 0) + event.dy;

          target.style.transform = `translate(${newX}px, ${newY}px)`;

          target.dataset.x = newX;
          target.dataset.y = newY;

          const itemIndex = this.items.findIndex(
            (item) => item.id === parseInt(target.id, 10)
          );
          this.items[itemIndex].x = newX;
          this.items[itemIndex].y = newY;
          this._saveGrid();
        },
      });

      interact('.grid-item').resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        onend: (event) => {
          const target = event.target;
          const itemIndex = this.items.findIndex(
            (item) => item.id === parseInt(target.id, 10)
          );
          this.items[itemIndex].w = target.offsetWidth;
          this.items[itemIndex].h = target.offsetHeight;
          this._saveGrid();
        },
      });
    }
  }

  render() {
    return html`
      <div class="grid">
        ${this.items.map(
          (item) => html`
            <div
              class="grid-item"
              id="${item.id}"
              data-x="${item.x}"
              data-y="${item.y}"
              style="transform: translate(${item.x}px, ${item.y}px); width: ${item.w}px; height: ${item.h}px;"
            ></div>
          `
        )}
      </div>
      <button @click="${this.addItem}">Add Item</button>
    `;
  }
}

customElements.define('draggable-grid', DraggableGrid);
