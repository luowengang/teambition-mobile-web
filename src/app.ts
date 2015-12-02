/// <reference path="components/interface/teambition.d.ts" />
/// <reference path="run.ts" />

module teambition {
  'use strict';

  export const host = 'http://ding.project.ci';

  export const app = {
    NAME: 'teambition-mobile-web',
    VERSION: 'v0.9.0',
    LANGUAGE: 'zh',
    apiHost: 'http://project.ci/api',
    strikerHost: 'https://striker.teambition.net',
    cdnHost: 'https://dn-st.teambition.net',
    wsHost: 'ws://snapper.project.bi',
    wxid: 'wx48744c9444d9824a',
    spiderHost: 'https://spider.teambition.com/api/track',
    dingApiHost: 'http://cai.project.ci:8083'
  };

  angular.module('teambition', ['ionic', 'ngResource', 'tbTemplates', 'ngFileUpload', 'et.template'])
  .constant('Moment', moment)
  .constant('Marked', marked)
  .constant('app', app);
}
