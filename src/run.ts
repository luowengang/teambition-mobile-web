/// <reference path='components/interface/teambition.d.ts' />
module teambition {
  'use strict';

  declare let webkitURL;

  export let rootZone = zone.fork({
    afterTask: () => {
      // console.log('root zone aftertask');
    }
  });

  export let $$rootScope: IRootScope;
  export let $$injector: any;

  export let URL: URL = URL || webkitURL;
  export let nobodyUrl = 'images/nobody-avator@2x.png';

  export function noop() {
    return false;
  };

  class Run {
    private $rootScope;
    private zone;
    private getParameterByName;
    private RestAPI: IRestAPI;
    private $state;
    private pending: angular.IPromise<any>;
    private $ionicLoading;
    constructor(
      app: teambition.Iapp,
      RestAPI: teambition.IRestAPI,
      $ionicPlatform: ionic.platform.IonicPlatformService,
      $ionicLoading: ionic.loading.IonicLoadingService,
      $rootScope: teambition.IRootScope,
      $state: ng.ui.IStateService,
      $ionicHistory: ionic.navigation.IonicHistoryService,
      $ionicModal: ionic.modal.IonicModalService,
      $timeout: angular.ITimeoutService,
      $location: angular.ILocationService,
      $http: angular.IHttpService,
      $injector: any,
      projectsAPI: teambition.IProjectsAPI,
      Moment: moment.MomentStatic,
      Cache: angular.ICacheFactoryService,
      getParameterByName: teambition.IGetParmByName
    ) {
      this.zone = rootZone;
      this.getParameterByName = getParameterByName;
      this.RestAPI = RestAPI;
      this.$state = $state;
      this.$ionicLoading = $ionicLoading;
      $rootScope.zone = this.zone;
      this.zone.run(() => {
        this.$rootScope = $rootScope;
        this.getUserInfo();
        $rootScope.pending = this.pending;
      });
    }

    private initRootscope(userMe: teambition.IUserMe): void {
      let $rootScope: teambition.IRootScope = this.$rootScope;
      $rootScope.global = {
        title: 'Teambition'
      };
      $rootScope.userMe = userMe;
      $$rootScope = $rootScope;
    }

    private getUserInfo(): void {
      let visible: string = this.getParameterByName(window.location.hash, 'visible');
      let self = this;
      if (!visible) {
        this.zone.hasCreated = true;
        this.pending = this.RestAPI.get({
          Type: 'users',
          Id: 'me'
        })
        .$promise
        .then((userMe: teambition.IUserMe) => {
          if (!userMe) {
            self.goHome();
          }else {
            self.initRootscope(userMe);
            let hash: string = window.location.hash;
            if (!hash) {
              self.$state.go('wechat');
            }
          }
        });
      }
    }

    private goHome(): void {
      this.$state.go('wx_login');
    }
  }

  // @ngInject
  var RunFn = function(
    app: teambition.Iapp,
    RestAPI: teambition.IRestAPI,
    $ionicPlatform: ionic.platform.IonicPlatformService,
    $ionicLoading: ionic.loading.IonicLoadingService,
    $rootScope: teambition.IRootScope,
    $state: ng.ui.IStateService,
    $ionicHistory: ionic.navigation.IonicHistoryService,
    $ionicModal: ionic.modal.IonicModalService,
    $timeout: angular.ITimeoutService,
    $location: angular.ILocationService,
    $http: angular.IHttpService,
    $injector: any,
    projectsAPI: teambition.IProjectsAPI,
    Moment: moment.MomentStatic,
    Cache: angular.ICacheFactoryService,
    getParameterByName: teambition.IGetParmByName
  ) {

    let run = new Run(
      app,
      RestAPI,
      $ionicPlatform,
      $ionicLoading,
      $rootScope,
      $state,
      $ionicHistory,
      $ionicModal,
      $timeout,
      $location,
      $http,
      $injector,
      projectsAPI,
      Moment,
      Cache,
      getParameterByName
    );

    $$injector = $injector;

    if (app.LANGUAGE === 'zh') {
      moment.locale('zh', {
        months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
        monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
        weekdays: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
        weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
        weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
        longDateFormat: {
          LT: 'Ah:mm',
          L: 'YYYY年MMMD日',
          LL: 'YYYY年MMMD日',
          LLL: 'YYYY年MMMD日LT',
          LLLL: 'YYYY年MMMD日ddddLT',
          l: 'YYYY年MMMD日',
          ll: 'YYYY年MMMD日',
          lll: 'YYYY年MMMD日 LT',
          llll: 'YYYY年MMMD日ddddLT'
        },
        relativeTime: {
          future: '%s内',
          past: '%s前',
          s: '几秒',
          m: '1分钟',
          mm: '%d分钟',
          h: '1小时',
          hh: '%d小时',
          d: '1天',
          dd: '%d天',
          M: '1个月',
          MM: '%d个月',
          y: '1年',
          yy: '%d年'
        },
        calendar: {
          sameDay: '[今天]',
          nextDay: '[明天]',
          lastDay: '[昨天]',
          lastWeek: function() {
            var prefix, startOfWeek;
            startOfWeek = moment().startOf('week');
            prefix = this.unix() < startOfWeek.unix() ? '[上]' : '';
            return prefix + 'dddd';
          },
          nextWeek: function() {
            var prefix, startOfWeek;
            startOfWeek = moment().startOf('week');
            prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[下]' : '';
            return prefix + 'dddd';
          },
          sameElse: function() {
            if (this.year() === Moment().year()) {
              return 'MMMD日';
            } else {
              return 'LL';
            }
          }
        },
        meridiem: function(hour: number, minute: number, isLower: boolean) {
          var hm;
          hm = hour * 100 + minute;
          if (hm < 100) {
            return '晚上';
          } else if (hm < 500) {
            return '凌晨';
          } else if (hm < 900) {
            return '早上';
          } else if (hm < 1130) {
            return '上午';
          } else if (hm < 1230) {
            return '中午';
          } else if (hm < 1800) {
            return '下午';
          } else {
            return '晚上';
          }
        },
        ordinal: function(num: number, period?: string) {
          switch (period) {
            case 'd':
            case 'D':
            case 'DDD':
              return num + '日';
            case 'M':
              return num + '月';
            case 'w':
            case 'W':
              return num + '周';
            default:
              return num + '';
          }
        }
      });
    } else if (app.LANGUAGE === 'ja') {
      moment.locale('ja', {
        months: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
        monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
        weekdays: '日曜日_月曜日_火曜日_水曜日_木曜日_金曜日_土曜日'.split('_'),
        weekdaysShort: '日_月_火_水_木_金_土'.split('_'),
        weekdaysMin: '日_月_火_水_木_金_土'.split('_'),
        longDateFormat: {
          LT: 'Ah:mm',
          L: 'YYYY/MM/DD',
          LL: 'YYYY年M月D日',
          LLL: 'YYYY年M月D日LT',
          LLLL: 'YYYY年M月D日LT dddd'
        },
        meridiem: function(hour: number, minute: number, isLower: boolean) {
          if (hour < 12) {
            return '午前';
          } else {
            return '午後';
          }
        },
        calendar: {
          sameDay: '[今日]',
          nextDay: '[明日]',
          nextWeek: '[来週]dddd',
          lastDay: '[昨日]',
          lastWeek: '[前週]dddd',
          sameElse: 'L'
        },
        relativeTime: {
          future: '%s後',
          past: '%s前',
          s: '数秒',
          m: '1分',
          mm: '%d分',
          h: '1時間',
          hh: '%d時間',
          d: '1日',
          dd: '%d日',
          M: '1ヶ月',
          MM: '%dヶ月',
          y: '1年',
          yy: '%d年'
        }
      });
    } else {
      moment.locale('en', {
        calendar: {
          lastDay: '[Yesterday]',
          sameDay: '[Today]',
          nextDay: '[Tomorrow]',
          lastWeek: function() {
            var prefix, startOfWeek;
            startOfWeek = moment().startOf('week');
            prefix = this.unix() < startOfWeek.unix() ? '[Last] ' : '';
            return prefix + 'dddd';
          },
          nextWeek: function() {
            var prefix, startOfWeek;
            startOfWeek = moment().startOf('week');
            prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[Next] ' : '';
            return prefix + 'dddd';
          },
          sameElse: function() {
            if (this.year() === Moment().year()) {
              return 'MMM D';
            } else {
              return 'LL';
            }
          }
        }
      });
    }

    return run;
  };

  angular.module('teambition').run(RunFn);
}
