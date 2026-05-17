export function debounce(delay: number = 300): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const timeoutKey = Symbol();

    const original = descriptor.value;

    descriptor.value = function (...args: any) {
      // @ts-ignore
      clearTimeout(this[timeoutKey]);
      // @ts-ignore
      this[timeoutKey] = setTimeout(() => original.apply(this, args), delay);
    };

    return descriptor;
  };
}
