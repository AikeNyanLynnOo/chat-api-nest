import { registerDecorator, ValidationOptions } from 'class-validator';

export const ContainsUppercase = (validationOptions?: ValidationOptions) => {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'containsUppercase',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /[A-Z]/.test(value);
        },
      },
    });
  };
};

export const ContainsLowercase = (validationOptions?: ValidationOptions) => {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'containsLowercase',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /[a-z]/.test(value);
        },
      },
    });
  };
};

export const ContainsSpecialCharacter = (
  validationOptions?: ValidationOptions,
) => {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'containsSpecialCharacter',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /[@$!%*?&]/.test(value);
        },
      },
    });
  };
};
