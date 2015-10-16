/// <reference path='../interface/teambition.d.ts' />
module teambition {
  'use strict';

  export interface ICutString {
    (str: string, length: number, suffix: string): string;
  }


  let priorityStr = (priority: number = 0): string => {
    let map: string[] = ['普通', '紧急', '非常紧急'];
    return map[priority];
  };

  angular.module('teambition')
  .filter('formatDate',
  // @ngInject
  (
    Moment: moment.MomentStatic
  ) => {
    return (date: string, format: string): string => {
      let _date: number = new Date(date).valueOf();
      if (_date) {
        let differ: number = Date.now() - _date;
        if (format && format === 'calendar') {
          return Moment(_date).calendar();
        }else if (format) {
          return Moment(_date).format(format);
        }
        if (Moment(_date).isSame(_date, 'year')) {
          return Moment(_date).format('YYYY-MM-DD');
        }
        if (differ > 86400000) {
          return Moment(_date).calendar();
        }
        return Moment(_date).fromNow();
      }else {
        return '';
      }
    };
  })
  .filter('priorityStr', () => {
    return priorityStr;
  })
  .filter('cutString', () => {
    return <ICutString>(str: string, len: number, suffix: string) => {
      if (typeof(str) !== 'string') {
        return '';
      }
      let index = 0;
      let count = 0;
      let result = '';
      while (count < len && index < str.length) {
        let chr = str.charAt(index++);
        count = /[\u4e00-\u9f85]/.test(str) ? count + 2 : count + 1;
        result += chr;
      }
      result = (index < str.length - 1) ? result + suffix : result;
      return result;
    };
  });
}
