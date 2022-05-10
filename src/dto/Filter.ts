export class Filter {
  public static TYPE_RANGE: string = 'RANGE';
  public static TYPE_VALUE: string = 'VALUE';
  public static TYPE_NOT_EQUAL: string = 'NOT_EQUAL';
  public static TYPE_NOT_EQUAL_ARRAY: string = 'NOT_EQUAL_ARRAY';
  public static TYPE_TEXT: string = 'TEXT';

  name: string;
  type: string;
  attr: string;
  complementAttr: string;

  constructor(name: string, type: string, attr?: string, complementAttr?: string) {
    this.name = name;
    this.type = type;
    this.attr = attr ?? this.name;
    this.complementAttr = complementAttr ?? '';
  }
}
