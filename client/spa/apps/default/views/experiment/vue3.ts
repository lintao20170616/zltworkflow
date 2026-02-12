/**
 * Vue3 响应式原理（简化版）
 *
 * Vue 3 与 Vue 2 的主要区别：
 * 1. 使用 Proxy 替代 Object.defineProperty
 *    - Proxy 可以拦截更多操作（get、set、has、deleteProperty、ownKeys 等）
 *    - 不需要遍历对象属性，性能更好
 *    - 可以监听数组的变化（push、pop、shift 等）
 *
 * 2. 依赖存储结构
 *    - Vue 2: 每个 key 一个 Dep 实例（通过闭包）
 *    - Vue 3: WeakMap(target) -> Map(key) -> Set(effects)
 *    - 使用 WeakMap 避免内存泄漏
 *
 * 3. 依赖收集方式
 *    - Vue 2: Watcher 类，通过 Dep.target 收集
 *    - Vue 3: ReactiveEffect 类，通过 activeEffect 收集
 *
 * 4. 优势
 *    - 支持数组索引和 length 的响应式
 *    - 支持动态添加/删除属性
 *    - 性能更好（懒代理、按需收集）
 */

type EffectFn = () => any;

interface EffectOptions {
  lazy?: boolean;
  scheduler?: (effect: ReactiveEffect) => void;
}

/**
 * ReactiveEffect 类（类似 Vue 2 的 Watcher）
 *
 * 作用：
 * 1. 封装副作用函数（effect）
 * 2. 记录依赖的 deps（用于清理）
 * 3. 支持调度器（scheduler）用于控制执行时机
 */
class ReactiveEffect {
  fn: EffectFn;
  deps: Set<Set<ReactiveEffect>>;
  active: boolean;
  scheduler?: (effect: ReactiveEffect) => void;

  constructor(fn: EffectFn, options?: EffectOptions) {
    this.fn = fn;
    this.deps = new Set();
    this.active = true;
    this.scheduler = options?.scheduler;
  }

  run() {
    if (!this.active) {
      return this.fn();
    }

    // activeEffect 是全局变量，用于追踪当前正在执行的 effect，这是 Vue 3 响应式系统的核心机制
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    activeEffect = this;
    const result = this.fn();

    activeEffect = null;
    return result;
  }

  stop() {
    if (this.active) {
      this.active = false;
      this.deps.forEach((dep) => {
        dep.delete(this);
      });
      this.deps.clear();
    }
  }
}

/**
 * activeEffect：当前正在执行的 effect（类似 Vue 2 的 Dep.target）
 * 用于在 getter 中知道是哪个 effect 在访问数据
 */
let activeEffect: ReactiveEffect | null = null;

/**
 * targetMap：依赖存储结构
 * WeakMap(target) -> Map(key) -> Set(effects)
 *
 * 为什么使用 WeakMap？
 * - 当 target 对象被垃圾回收时，WeakMap 中的键值对也会自动删除
 * - 避免内存泄漏
 */
const targetMap = new WeakMap<object, Map<string | symbol, Set<ReactiveEffect>>>();

/**
 * track：依赖收集（类似 Vue 2 的 getter 中的 dep.addSub）
 *
 * 作用：
 * 1. 将当前 activeEffect 添加到 target[key] 的依赖集合中
 * 2. 同时将依赖集合添加到 effect.deps 中（用于清理）
 */
function track(target: object, key: string | symbol) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }

  if (!deps.has(activeEffect)) {
    deps.add(activeEffect);
    activeEffect.deps.add(deps);
  }
}

/**
 * trigger：触发更新（类似 Vue 2 的 dep.notify）
 *
 * 作用：
 * 1. 找到 target[key] 的所有依赖 effect
 * 2. 执行 effect（如果有 scheduler 则执行 scheduler，否则执行 run）
 */
function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const deps = depsMap.get(key);
  if (!deps) return;

  const effectsToRun = new Set<ReactiveEffect>();
  deps.forEach((effect) => {
    if (effect !== activeEffect) {
      effectsToRun.add(effect);
    }
  });

  effectsToRun.forEach((effect) => {
    if (effect.scheduler) {
      effect.scheduler(effect);
    } else {
      effect.run();
    }
  });
}

/**
 * reactiveMap：缓存已代理的对象，避免重复代理
 */
const reactiveMap = new WeakMap<object, object>();

/**
 * reactive：创建响应式对象（核心 API）
 *
 * 实现：
 * 1. 使用 Proxy 拦截对象的操作
 * 2. get 时调用 track 收集依赖
 * 3. set 时调用 trigger 触发更新
 * 4. 嵌套对象递归代理
 */
function reactive<T extends object>(target: T): T {
  const existingProxy = reactiveMap.get(target);
  if (existingProxy) {
    return existingProxy as T;
  }

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      track(target, key);
      const result = Reflect.get(target, key, receiver);
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    },
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    ownKeys(target) {
      track(target, 'ITERATE_KEY');
      return Reflect.ownKeys(target);
    },
    deleteProperty(target, key) {
      const hadKey = Reflect.has(target, key);
      const result = Reflect.deleteProperty(target, key);
      if (hadKey) {
        trigger(target, key);
        trigger(target, 'ITERATE_KEY');
      }
      return result;
    },
  });

  reactiveMap.set(target, proxy);
  return proxy as T;
}

/**
 * effect：创建副作用函数（类似 Vue 2 的 Watcher）
 *
 * 作用：
 * 1. 创建 ReactiveEffect 实例
 * 2. 执行 effect（除非 lazy: true）
 * 3. 返回 runner 函数（可以手动执行）
 */
function effect(fn: EffectFn, options?: EffectOptions) {
  const _effect = new ReactiveEffect(fn, options);
  if (!options?.lazy) {
    _effect.run();
  }
  const runner = _effect.run.bind(_effect);
  (runner as any).effect = _effect;
  return runner;
}

/**
 * ref：创建响应式引用
 *
 * 实现：
 * - 将值包装在对象的 value 属性中
 * - 使用 reactive 创建响应式对象
 */
function ref<T>(value: T) {
  const refObject = {
    value,
  };
  return reactive(refObject);
}

/**
 * computed：创建计算属性
 *
 * 实现：
 * 1. 使用 ReactiveEffect 执行 getter
 * 2. 使用 dirty 标志实现懒计算
 * 3. 依赖变化时通过 scheduler 标记 dirty
 */
function computed<T>(getter: () => T) {
  let value: T;
  let dirty = true;
  const computedRef: { value: T } = {} as { value: T };

  const _effect = new ReactiveEffect(getter, {
    scheduler() {
      console.log('computed scheduler: 依赖变化，标记 dirty', computedRef);
      if (!dirty) {
        dirty = true;
        trigger(computedRef, 'value');
      }
    },
  });

  Object.defineProperty(computedRef, 'value', {
    get() {
      track(computedRef, 'value');
      if (dirty) {
        console.log('computed getter: 重新计算', computedRef);
        value = _effect.run();
        dirty = false;
      } else {
        console.log('computed getter: 使用缓存值', value);
      }
      return value;
    },
  });

  return computedRef;
}

class Vue3 {
  data: Record<string, any>;

  constructor(data: Record<string, any>) {
    this.data = reactive(data);
  }

  /**
   * watch：监听数据变化
   *
   * 实现：
   * 1. 使用 effect 收集依赖
   * 2. 通过 scheduler 控制回调执行时机
   * 3. 返回停止监听的函数
   */
  watch<T>(source: () => T, callback: (newVal: T, oldVal: T) => void, options?: { immediate?: boolean }) {
    let oldValue: T;
    const getter = source;

    const _effect = new ReactiveEffect(getter, {
      scheduler() {
        const newValue = getter();
        callback(newValue, oldValue);
        oldValue = newValue;
      },
    });

    if (options?.immediate) {
      oldValue = getter();
      callback(oldValue, undefined as any);
    } else {
      oldValue = getter();
    }

    return () => {
      _effect.stop();
    };
  }
}

export { Vue3, reactive, effect, ref, computed };
