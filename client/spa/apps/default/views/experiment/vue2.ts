/**
 * Vue2 响应式原理
 * 1. 通过 Object.defineProperty 实现响应式
 * 2. 通过 Dep 实现依赖收集
 * 3. 通过 Watcher 实现更新视图
 */

class Vue2 {
  data: Record<string, any>;
  constructor(data: Record<string, any>) {
    this.data = data;
    this.observe(data);
  }
  /**
   * 观察对象
   * @param obj 对象
   * @returns
   */
  observe(obj: Record<string, any>) {
    if (typeof obj !== 'object') return;
    Object.keys(obj).forEach((key) => {
      this.defineReactive(obj, key, obj[key]);
    });
  }
  /**
   * 定义响应式属性
   * @param obj 对象
   * @param key 属性名
   * @param value 属性值
   */
  defineReactive(obj: Record<string, any>, key: string, value: any) {
    this.observe(value);
    /**
     * 关键点：每个 key 都有自己的 dep 实例
     * - 每次调用 defineReactive 都会创建一个新的 Dep 实例
     * - 这个 dep 通过闭包被 getter 和 setter 共享
     * - 当这个 key 被访问时，Watcher 会被添加到这个 dep.subs 中
     * - 当这个 key 的值变化时，会通知这个 dep.subs 中的所有 Watcher
     *
     * 示例：
     * data = { name: 'Tom', age: 18 }
     * - name 属性有自己的 dep1，管理监听 name 的所有 Watcher
     * - age 属性有自己的 dep2，管理监听 age 的所有 Watcher
     * - 修改 name 只会通知 dep1.subs 中的 Watcher，不会影响 dep2
     */
    const dep = new Dep();
    const observeFn = (val: any) => this.observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        /**
         * 当访问属性时：
         * 1. 如果 Dep.target 存在（说明有 Watcher 正在收集依赖）
         * 2. 将当前的 Watcher（Dep.target）添加到这个属性的 Dep.subs 中
         * 3. 同时将 dep 添加到 Watcher.deps 中（用于 Watcher 销毁时清理）
         * 4. 这样就建立了"属性 -> Watcher"和"Watcher -> dep"的双向依赖关系
         */
        if (Dep.target) {
          dep.addSub(Dep.target);
          Dep.target.addDep(dep);
        }
        return value;
      },
      set(newVal) {
        if (value === newVal) return;
        value = newVal;
        observeFn(value);
        dep.notify();
      },
    });
  }
}
/**
 * Dep 类
 * 1. 收集 Watcher
 * 2. 通知 Watcher 更新
 */
interface DepInstance {
  subs: Watcher[];
  addSub(sub: Watcher): void;
  removeSub(sub: Watcher): void;
  notify(): void;
}
class Dep implements DepInstance {
  /**
   * Dep.target 的来源和作用：
   *
   * 1. 来源：
   *    - Dep.target 是 Dep 类的静态属性（static）
   *    - 静态属性属于类本身，不属于实例
   *    - 可以通过 Dep.target 直接访问，不需要创建 Dep 实例
   *    - 所有 Dep 实例共享同一个 Dep.target
   *
   * 2. 作用：
   *    - 全局唯一标识当前正在收集依赖的 Watcher
   *    - 在 getter 中通过 Dep.target 知道是哪个 Watcher 在访问数据
   *    - 建立数据属性和 Watcher 之间的依赖关系
   *
   * 3. 为什么需要静态属性？
   *    - getter 函数是闭包，无法直接知道是谁在访问数据
   *    - 通过静态属性 Dep.target，getter 可以知道当前访问数据的 Watcher
   *    - 这样就能将 Watcher 添加到当前属性的 dep.subs 中
   *
   * 4. Watcher 如何访问 Dep.target？
   *    - Watcher 类在 Dep 类之后定义，可以访问 Dep 类
   *    - 通过 Dep.target 直接访问静态属性（不需要实例化）
   *    - 例如：Dep.target = this（设置当前 Watcher）
   */
  static target: Watcher | null = null;
  subs: Watcher[];
  constructor() {
    this.subs = [];
  }
  addSub(sub: Watcher): void {
    /**
     * 添加 Watcher 到订阅列表
     *
     * 问题：同一个 key 可能被多次访问，导致同一个 Watcher 被多次添加
     * 解决：添加前检查是否已存在，避免重复添加
     *
     * 示例场景：
     * - 模板中多次使用同一个属性：{{ name }} {{ name }}
     * - 计算属性中多次访问同一个属性
     * - Watcher.update() 中重新收集依赖时
     */
    if (!this.subs.includes(sub)) {
      this.subs.push(sub);
    }
  }
  removeSub(sub: Watcher): void {
    /**
     * 从订阅列表中移除 Watcher
     *
     * 用途：
     * - Watcher 销毁时，从所有订阅的 dep.subs 中移除自己
     * - 避免内存泄漏（Watcher 被销毁后仍在 dep.subs 中）
     */
    const index = this.subs.indexOf(sub);
    if (index > -1) {
      this.subs.splice(index, 1);
    }
  }
  notify() {
    /**
     * 通知所有订阅的 Watcher 更新
     *
     * 注意：
     * - update 之后不应该清除 dep.subs 中的 Watcher
     * - Watcher 还需要继续监听这个 key 的变化
     * - 只有在 Watcher 销毁时才应该从 dep.subs 中移除
     *
     * 清理时机：
     * - Watcher.teardown() 被调用时，Watcher 会从所有订阅的 dep 中移除自己
     */
    this.subs.forEach((sub) => {
      if (sub.active) {
        sub.update();
      }
    });
  }
}
/**
 * Watcher 类
 * 1. 收集 Dep
 * 2. 当数据变化时，通知 Dep 更新
 * 3. 当 Dep 通知 Watcher 更新时，更新视图
 */
class Watcher {
  vm: Vue2;
  key: string;
  cb: (newVal: any, oldVal: any) => void;
  value: any;
  active: boolean;
  deps: Dep[];
  constructor(vm: Vue2, key: string, cb: (newVal: any, oldVal: any) => void) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;
    this.active = true;
    this.deps = [];
    this.value = this.get();
  }
  get() {
    /**
     * Watcher.get() 中的 Dep 来源说明：
     *
     * 1. Dep 是什么？
     *    - Dep 是一个类，定义在同一个文件中（第82行）
     *    - Dep.target 是 Dep 类的静态属性（第94行：static target）
     *    - 静态属性属于类本身，不属于实例，可以直接通过类名访问
     *
     * 2. 为什么 Watcher 能访问 Dep？
     *    - Dep 类在文件顶部定义，Watcher 类在 Dep 类之后定义
     *    - 由于 JavaScript/TypeScript 的类提升机制，Watcher 可以访问 Dep
     *    - 通过 Dep.target 访问静态属性，不需要创建 Dep 实例
     *
     * 3. Dep.target 的作用：
     *    - 全局唯一标识当前正在收集依赖的 Watcher
     *    - 作为 Watcher 和 key 的 dep 之间的桥梁
     *    - 在 getter 中通过 Dep.target 知道是哪个 Watcher 在访问数据
     *
     * 4. 执行流程：
     *    步骤1: 设置 Dep.target = this（标识当前 Watcher）
     *    步骤2: 访问 vm.data[key]（触发 getter）
     *    步骤3: getter 中检查 Dep.target，将 Watcher 添加到 dep.subs
     *    步骤4: 清空 Dep.target = null（避免污染）
     */
    Dep.target = this; // ⬅️ 访问 Dep 类的静态属性
    const value = this.vm.data[this.key]; // ⬅️ 触发 getter，getter 中会使用 Dep.target
    Dep.target = null; // ⬅️ 清空静态属性
    return value;
  }
  addDep(dep: Dep): void {
    /**
     * 将 dep 添加到 Watcher 的依赖列表中
     *
     * 用途：
     * - 记录 Watcher 订阅了哪些 dep
     * - Watcher 销毁时，可以从所有订阅的 dep 中移除自己
     */
    if (!this.deps.includes(dep)) {
      this.deps.push(dep);
    }
  }
  update() {
    /**
     * Watcher 更新方法
     *
     * 注意：
     * - update 之后不应该清除 dep.subs 中的 Watcher
     * - Watcher 还需要继续监听这个 key 的变化
     * - 如果清除，下次数据变化时就不会通知这个 Watcher 了
     *
     * 清理时机：
     * - 只有在 Watcher 销毁时（teardown）才应该从 dep.subs 中移除
     */
    if (!this.active) return;
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }
  teardown() {
    /**
     * Watcher 销毁方法
     *
     * 用途：
     * - 组件销毁时调用，清理 Watcher 的所有依赖关系
     * - 从所有订阅的 dep.subs 中移除自己，避免内存泄漏
     *
     * 调用时机：
     * - 组件销毁时
     * - watch 被取消时
     * - computed 属性不再使用时
     */
    if (!this.active) return;
    this.active = false;
    this.deps.forEach((dep) => {
      dep.removeSub(this);
    });
    this.deps = [];
  }
}
export { Vue2, Watcher };
