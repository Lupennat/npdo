import {
  LengthType,
  LengthTypeBindingOptions,
  LengthValidPrimitive,
} from '../types/type-bindings';
import BaseTypedBinding from './base-typed-binding';

export default class LengthTypedBinding extends BaseTypedBinding {
  constructor(
    public type: LengthType,
    public value: LengthValidPrimitive,
    public options?: LengthTypeBindingOptions,
  ) {
    super(type, value, options);
  }
}