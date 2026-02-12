interface ParentInstance {
  name: string;
  colors: string[];
  setName(name: string): void;
  setColors(colors: string[]): void;
}

function Parent(this: ParentInstance, name: string): void {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.setName = function (name: string): void {
  this.name = name;
};
// 设置父实例的颜色
Parent.prototype.setColors = function (colors: string[]): void {
  this.colors = colors;
};

interface ChildInstance extends ParentInstance {
  age: number;
  setAge(age: number): void;
}

function Child(this: ChildInstance, name: string, age: number): void {
  this.name = name;
  this.age = age;
}

Child.prototype.getAge = function (this: ChildInstance): number {
  return this.age;
};
export { Parent, Child, type ParentInstance, type ChildInstance };
