class ClassExtendMixin {
  private superclass: any;

  constructor(superclass: any) {
    this.superclass = superclass;
  }

  with(...otherClassesMixins: any[]) {
    return otherClassesMixins.reduce((extendedClass, classMixin) => classMixin(extendedClass), this.superclass);
  }
}

export default (superclass: any) => new ClassExtendMixin(superclass);
