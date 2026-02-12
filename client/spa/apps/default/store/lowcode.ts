import { defineStore } from 'pinia';
import { getComponentSchema } from '@app/components/lowcode/componentSchemas';

export const CONTAINER_COMPONENTS = ['el-form', 'el-form-item', 'el-card', 'el-tabs', 'el-tab-pane', 'el-row', '__root__'];

export interface ComponentConfig {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentConfig[];
  events?: Record<string, string>;
  content?: string;
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

type InsertPosition = 'append';

interface EditorState {
  rootComponent: ComponentConfig | null;
  selectedComponentId: string | null;
  previewMode: boolean;
  history: PageConfig[];
  historyIndex: number;
  maxHistorySize: number;
}

function generateId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createComponentFromType(type: string): ComponentConfig {
  const schema = getComponentSchema(type);
  const props: Record<string, any> = {};
  if (schema?.properties) {
    for (const p of schema.properties) {
      if (p.defaultValue !== undefined) {
        props[p.key] = p.defaultValue;
      }
    }
  }
  return {
    id: generateId(),
    type,
    props,
  };
}

function findComponentInList(list: ComponentConfig[], id: string): ComponentConfig | null {
  for (const c of list) {
    if (c.id === id) return c;
    if (c.children) {
      const found = findComponentInList(c.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findParentAndIndex(list: ComponentConfig[], id: string): { parent: ComponentConfig; index: number } | null {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return null;
    if (list[i].children) {
      const idx = list[i].children!.findIndex((c) => c.id === id);
      if (idx >= 0) return { parent: list[i], index: idx };
      const result = findParentAndIndex(list[i].children!, id);
      if (result) return result;
    }
  }
  return null;
}

function removeFromTree(list: ComponentConfig[], id: string): boolean {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list.splice(i, 1);
      return true;
    }
    if (list[i].children && removeFromTree(list[i].children!, id)) return true;
  }
  return false;
}

function deepCloneComponent(c: ComponentConfig): ComponentConfig {
  return {
    ...c,
    id: c.type === '__root__' ? c.id : generateId(),
    props: { ...c.props },
    children: c.children?.map(deepCloneComponent),
    events: c.events ? { ...c.events } : undefined,
    content: c.content,
    style: c.style ? { ...c.style } : undefined,
    class: c.class,
  };
}

function flattenComponents(list: ComponentConfig[], result: ComponentConfig[] = []): ComponentConfig[] {
  for (const c of list) {
    if (c.type !== '__root__') result.push(c);
    if (c.children) flattenComponents(c.children, result);
  }
  return result;
}

function ensureRoot(store: { rootComponent: ComponentConfig | null }): ComponentConfig {
  if (!store.rootComponent || store.rootComponent.type !== '__root__') {
    return {
      id: 'root',
      type: '__root__',
      props: {},
      children: [],
    };
  }
  return store.rootComponent;
}

export const useLowcodeStore = defineStore('lowcode', {
  state: (): EditorState => ({
    rootComponent: null,
    selectedComponentId: null,
    previewMode: false,
    history: [],
    historyIndex: -1,
    maxHistorySize: 50,
  }),

  getters: {
    rootChildren: (state): ComponentConfig[] => {
      if (!state.rootComponent || state.rootComponent.type !== '__root__') return [];
      return state.rootComponent.children || [];
    },

    selectedComponent: (state): ComponentConfig | null => {
      if (!state.selectedComponentId || !state.rootComponent) return null;
      return findComponentInList(state.rootComponent.children || [], state.selectedComponentId);
    },

    flatComponents: (state): ComponentConfig[] => {
      if (!state.rootComponent) return [];
      return flattenComponents(state.rootComponent.children || []);
    },

    canUndo: (state): boolean => state.historyIndex > 0,
    canRedo: (state): boolean => state.historyIndex < state.history.length - 1,
  },

  actions: {
    getComponentById(id: string): ComponentConfig | null {
      if (!this.rootComponent) return null;
      return findComponentInList(this.rootComponent.children || [], id);
    },

    addComponent(componentOrType: ComponentConfig | string, opts?: { parentId?: string; position?: InsertPosition; siblingId?: string }) {
      const component: ComponentConfig = typeof componentOrType === 'string' ? createComponentFromType(componentOrType) : componentOrType;
      const root = ensureRoot(this);
      if (!this.rootComponent) {
        this.rootComponent = root;
      }
      const children = root.children || [];
      if (!root.children) root.children = children;
      if (opts?.parentId) {
        const parent = findComponentInList(children, opts.parentId);
        if (parent && CONTAINER_COMPONENTS.includes(parent.type)) {
          const parentChildren = parent.children || [];
          if (!parent.children) parent.children = parentChildren;
          parentChildren.push(component);
        } else {
          children.push(component);
        }
      } else {
        children.push(component);
      }
      this.saveHistory();
    },

    removeComponent(componentId: string) {
      if (!this.rootComponent?.children) return;
      removeFromTree(this.rootComponent.children, componentId);
      if (this.selectedComponentId === componentId) this.selectedComponentId = null;
      this.saveHistory();
    },

    updateComponentProps(componentId: string, props: Record<string, any>) {
      const component = this.getComponentById(componentId);
      if (component) {
        Object.assign(component.props, props);
        this.saveHistory();
      }
    },

    updateComponentContent(componentId: string, content: string) {
      console.log('updateComponentContent', componentId, content);
      const component = this.getComponentById(componentId);
      if (component) {
        component.content = content;
        this.saveHistory();
      }
    },

    updateComponentStyle(componentId: string, style: Record<string, string>) {
      const component = this.getComponentById(componentId);
      if (component) {
        if (!component.style) component.style = {};
        Object.assign(component.style, style);
        this.saveHistory();
      }
    },

    selectComponent(componentId: string | null) {
      this.selectedComponentId = componentId;
    },

    duplicateComponent(componentId: string) {
      const component = this.getComponentById(componentId);
      if (!component) return;
      const duplicated = deepCloneComponent(component);
      if (!this.rootComponent?.children) return;

      const parentInfo = findParentAndIndex(this.rootComponent.children, componentId);
      if (parentInfo) {
        const { parent, index } = parentInfo;
        const list = parent.children || [];
        if (!parent.children) parent.children = list;
        list.splice(index + 1, 0, duplicated);
      } else {
        const idx = this.rootComponent.children.findIndex((c) => c.id === componentId);
        if (idx >= 0) {
          this.rootComponent.children.splice(idx + 1, 0, duplicated);
        } else {
          this.rootComponent.children.push(duplicated);
        }
      }
      this.saveHistory();
    },

    togglePreview() {
      this.previewMode = !this.previewMode;
    },

    saveHistory() {
      const config: PageConfig = {
        version: '1.0.0',
        page: { title: '页面标题', layout: 'container' },
        components: (this.rootComponent?.children || []).map(deepCloneComponent),
      };
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(config);
      if (this.history.length > this.maxHistorySize) this.history.shift();
      else this.historyIndex++;
    },

    undo() {
      if (!this.canUndo) return;
      this.historyIndex--;
      const prev = this.history[this.historyIndex];
      this.rootComponent = {
        id: 'root',
        type: '__root__',
        props: {},
        children: prev.components.map(deepCloneComponent),
      };
      this.selectedComponentId = null;
    },

    redo() {
      if (!this.canRedo) return;
      this.historyIndex++;
      const next = this.history[this.historyIndex];
      this.rootComponent = {
        id: 'root',
        type: '__root__',
        props: {},
        children: next.components.map(deepCloneComponent),
      };
      this.selectedComponentId = null;
    },

    clear() {
      this.rootComponent = null;
      this.selectedComponentId = null;
      this.history = [];
      this.historyIndex = -1;
    },

    loadConfig(config: PageConfig) {
      this.rootComponent = {
        id: 'root',
        type: '__root__',
        props: {},
        children: config.components.map(deepCloneComponent),
      };
      this.selectedComponentId = null;
      this.saveHistory();
    },

    exportConfig(): PageConfig {
      return {
        version: '1.0.0',
        page: { title: '页面标题', layout: 'container' },
        components: (this.rootComponent?.children || []).map(deepCloneComponent),
      };
    },
  },
});
