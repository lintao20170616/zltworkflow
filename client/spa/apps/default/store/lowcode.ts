import { defineStore } from 'pinia';

export interface ComponentConfig {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentConfig[];
  events?: Record<string, string>;
  text?: string;
  style?: Record<string, string>;
  class?: string | string[];
}

export interface PageConfig {
  version: string;
  page: {
    title: string;
    layout: string;
  };
  components: ComponentConfig[];
}

interface EditorState {
  components: ComponentConfig[];
  selectedComponentId: string | null;
  history: PageConfig[];
  historyIndex: number;
  maxHistorySize: number;
}

export const useLowcodeStore = defineStore('lowcode', {
  state: (): EditorState => ({
    components: [],
    selectedComponentId: null,
    history: [],
    historyIndex: -1,
    maxHistorySize: 50,
  }),

  getters: {
    selectedComponent: (state): ComponentConfig | null => {
      if (!state.selectedComponentId) return null;
      return findComponent(state.components, state.selectedComponentId);
    },

    canUndo: (state): boolean => {
      return state.historyIndex > 0;
    },

    canRedo: (state): boolean => {
      return state.historyIndex < state.history.length - 1;
    },
  },

  actions: {
    addComponent(component: ComponentConfig, parentId?: string) {
      if (parentId) {
        const parent = findComponent(this.components, parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(component);
        }
      } else {
        this.components.push(component);
      }
      this.saveHistory();
    },

    removeComponent(componentId: string) {
      removeComponentFromTree(this.components, componentId);
      if (this.selectedComponentId === componentId) {
        this.selectedComponentId = null;
      }
      this.saveHistory();
    },

    updateComponentProps(componentId: string, props: Record<string, any>) {
      const component = findComponent(this.components, componentId);
      if (component) {
        Object.assign(component.props, props);
        this.saveHistory();
      }
    },

    updateComponentText(componentId: string, text: string) {
      const component = findComponent(this.components, componentId);
      if (component) {
        component.text = text;
        this.saveHistory();
      }
    },

    updateComponentStyle(componentId: string, style: Record<string, string>) {
      const component = findComponent(this.components, componentId);
      if (component) {
        if (!component.style) {
          component.style = {};
        }
        Object.assign(component.style, style);
        this.saveHistory();
      }
    },

    selectComponent(componentId: string | null) {
      this.selectedComponentId = componentId;
    },

    moveComponent(componentId: string, targetIndex: number, parentId?: string) {
      const component = findComponent(this.components, componentId);
      if (!component) return;

      removeComponentFromTree(this.components, componentId);

      if (parentId) {
        const parent = findComponent(this.components, parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.splice(targetIndex, 0, component);
        }
      } else {
        this.components.splice(targetIndex, 0, component);
      }
      this.saveHistory();
    },

    duplicateComponent(componentId: string) {
      const component = findComponent(this.components, componentId);
      if (!component) return;

      const duplicated = deepCloneComponent(component);
      this.addComponent(duplicated);
    },

    saveHistory() {
      const currentState: PageConfig = {
        version: '1.0.0',
        page: {
          title: '页面标题',
          layout: 'container',
        },
        components: deepCloneComponents(this.components),
      };

      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(currentState);

      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      } else {
        this.historyIndex++;
      }
    },

    undo() {
      if (this.canUndo) {
        this.historyIndex--;
        const previousState = this.history[this.historyIndex];
        this.components = deepCloneComponents(previousState.components);
        this.selectedComponentId = null;
      }
    },

    redo() {
      if (this.canRedo) {
        this.historyIndex++;
        const nextState = this.history[this.historyIndex];
        this.components = deepCloneComponents(nextState.components);
        this.selectedComponentId = null;
      }
    },

    clear() {
      this.components = [];
      this.selectedComponentId = null;
      this.history = [];
      this.historyIndex = -1;
    },

    loadConfig(config: PageConfig) {
      this.components = deepCloneComponents(config.components);
      this.selectedComponentId = null;
      this.saveHistory();
    },

    exportConfig(): PageConfig {
      return {
        version: '1.0.0',
        page: {
          title: '页面标题',
          layout: 'container',
        },
        components: deepCloneComponents(this.components),
      };
    },
  },
});

function findComponent(components: ComponentConfig[], id: string): ComponentConfig | null {
  for (const component of components) {
    if (component.id === id) {
      return component;
    }
    if (component.children) {
      const found = findComponent(component.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeComponentFromTree(components: ComponentConfig[], id: string): boolean {
  for (let i = 0; i < components.length; i++) {
    if (components[i].id === id) {
      components.splice(i, 1);
      return true;
    }
    if (components[i].children) {
      if (removeComponentFromTree(components[i].children!, id)) {
        return true;
      }
    }
  }
  return false;
}

function deepCloneComponent(component: ComponentConfig): ComponentConfig {
  return {
    ...component,
    id: generateId(),
    props: { ...component.props },
    children: component.children ? component.children.map(deepCloneComponent) : undefined,
    events: component.events ? { ...component.events } : undefined,
    text: component.text,
    style: component.style ? { ...component.style } : undefined,
    class: component.class,
  };
}

function deepCloneComponents(components: ComponentConfig[]): ComponentConfig[] {
  return components.map(deepCloneComponent);
}

function generateId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
