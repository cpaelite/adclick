(function () {
  'use strict';

  var i18n_en = {
    ok: 'Ok',
    save: 'Save',
    warn: 'Warn',
    cancel: 'Cancel',
    operation: 'Operation',
    add: 'Add',
    edit: 'Edit',
    delete: 'Confirm Delete',
    warnDelete: 'Are you sure you want to delete this item? Note that this operation can not be undone!',
    warnClose: 'Form has unsaved changes. Do you want to proceed?',
    warnCloseTitle: 'Confirm Close',
    confirmPauseTitle: 'Confirm Pause',
    confirmPauseContent: 'Are you sure you want to pause this item?',
    picture: 'Picture',
    signin: 'Login',
    goBackHomePage: 'Home Page',
    signup: 'Sign up',
    campaign: 'Campaign',
    affiliateNetwork: 'AffiliateNetwork',
    affiliateNetworkName: 'Name',
    affiliateNetworkPostBackUrl: 'Url',
    dashBoard: 'Dashboard',
    trackCampaignName: 'Name',
    trackCampaignStatus: {
        0: 'Active',
        1: 'InActive'
    },
    offer: 'Offer',
    lander: 'Lander',
    flow: 'Flow',
    traffic: 'Traffic Source',
    trafficSourceStatus: {
      0: 'Active',
      1: 'InActive'
    },
    rule: 'Rule',
    fromDate: 'From',
    toDate: 'To',
    profile:'Profile',
    referralProgram:'Referral Program',
    subscriptions:'Subscriptions',
    domain:'Domain',
    setUp:'SetUp',
    userManagement:'User Management',
    botBlacklist:'Bot Blacklist',
    invoices:'Invoice',
    eventLog:'Event Log',
    affiliate: 'Affiliate Network',
    addFlowPath: 'Add new path',
    addFlowRule: 'Add new rule',
    dashboardColumn: {
      visits: 'Visits',
      clicks: 'Clicks',
      conversions: 'Conversions',
      revenue: 'Revenue',
      cost: 'Cost',
      profit: 'Profit',
      impressions: 'Impressions'
    },
    conversionUpload: 'Conversion Upload',
    changeCountryConfirm: 'Changing country will remove landers and offers within paths. Are your sure?',
    restore: 'Restore',
    warnRestore: 'Are you sure you want to restore this item? ',
    filterType: 'FilterType',
    import: 'Import'
  };
  var i18n_zh = {
    ok: '确定',
    saving: '保存中',
    save: '保存',
    cancel: '取消',
    add: '添加',
    edit: '编辑',
    delete: '删除所选信息',
    warnDelete: '您确定要删除？请注意，此操作无法撤销！',
    warnClose: 'Form has unsaved changes. Do you want to proceed?',
    warnCloseTitle: 'Confirm Close',
    signup: '注册',
    signin: '登录',
    goBackHomePage: '返回首页'
  };

  angular.module('app')
    .config(['$translateProvider', function ($translateProvider) {
      $translateProvider
        .translations('en', i18n_en)
        .translations('zh', i18n_zh);

      // Tell the module what language to use by default
      $translateProvider.preferredLanguage('en');

      // Enable escaping of HTML
      $translateProvider.useSanitizeValueStrategy('escape');
    }]);
})();
