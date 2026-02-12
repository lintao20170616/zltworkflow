<template>
  <div>
    <h1>原型链继承</h1>
    <p>{{ child.name }}</p>
    <p>{{ child.age }}</p>
    <p>{{ child.colors }}</p>
  </div>
  <div>
    <h1>构造函数继承</h1>
    <p>{{ childClass.name }}</p>
    <p>{{ childClass.age }}</p>
    <p>{{ childClass.colors }}</p>
  </div>

  <div>
    <h1>Vue2 响应式原理</h1>
    {{ changestr }}
    <button @click="changeName('Jerry1')">测试1</button>
    <button @click="changeName('Jerry2')">测试2</button>
  </div>
  <div>
    <h1>Vue3 响应式原理</h1>
    <p>name: {{ vue3Name }}</p>
    <p>count: {{ vue3Count }}</p>
    <p>fullName: {{ vue3FullName }}</p>
    <button @click="changeNameVue3('Jerry1')">修改 name1</button>
    <button @click="changeNameVue3('Jerry2')">修改 name2</button>
    <button @click="incrementCount">增加 count</button>
  </div>
</template>

<script setup lang="ts">
import { ref as vueRef } from 'vue';
import { Parent, Child, type ParentInstance, type ChildInstance } from './utils';
import { Vue2, Watcher } from './vue2';
import { Vue3, effect, ref as vue3Ref } from './vue3';
/**
 * 原型链继承
 * 1.子类（Child）的原型指向父类（Parent）的实例
 * 2.子的构造函数指向子类
 * 3.子类的原型链指向父类的原型链
 * 4.子类的实例可以访问父类的属性和方法
 */
Child.prototype = new (Parent as any)() as ParentInstance;
(Child.prototype as any).constructor = Child;
const child = vueRef(new (Child as any)('李四', '18') as ChildInstance);
child.value.setColors(['yellow']);
child.value.setName('张三');

/**
 * 最佳实践ES6 Class继承
 */
class ParentClass {
  name: string;
  colors: string[];
  constructor(name: string, colors: string[]) {
    this.name = name;
    this.colors = colors;
  }
  setName(name: string): void {
    this.name = name;
  }
  setColors(colors: string[]): void {
    this.colors = colors;
  }
}

class ChildClass extends ParentClass {
  age: number;
  constructor(name: string, colors: string[], age: number) {
    super(name, colors);
    this.age = age;
  }
  setAge(age: number): void {
    this.age = age;
  }
}

const childClass = vueRef(new ChildClass('张三', ['red', 'blue', 'green'], 18));
childClass.value.setAge(28);
childClass.value.setName('王五');

const vm = new Vue2({
  name: 'Tom',
  age: 25,
  cart: {
    items: [],
    total: 0,
  },
});

const changestr = vueRef('');

new Watcher(vm, 'name', (newVal: string, oldVal: string) => {
  changestr.value = `name: ${oldVal} -> ${newVal}`;
});

function changeName(name: string) {
  vm.data.name = name;
}

const vue3Obj = new Vue3({ name: 'Vue3张三' });
const vue3Name = vue3Ref('Vue3张三');
const vue3Count = vue3Ref(0);
const vue3FullName = vue3Ref('');

const vue3CountRef = vue3Ref(0);

effect(() => {
  console.log('vue3Name', vue3Name.value);
  vue3Name.value = vue3Obj.data.name;
});

effect(() => {
  console.log('vue3Count', vue3Count.value);
  vue3Count.value = vue3CountRef.value;
});

function changeNameVue3(name: string) {
  vue3Obj.data.name = name;
}

function incrementCount() {
  vue3CountRef.value++;
}
</script>
