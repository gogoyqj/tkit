/**
 * @description lodash 扩展
 */
import _ from 'lodash';

export default {
  ..._,
  pascalCase: _.flow(_.camelCase, _.upperFirst) as (s: string) => string,
  upperSnakeCase: _.flow(_.snakeCase, _.toUpper) as (s: string) => string
};
