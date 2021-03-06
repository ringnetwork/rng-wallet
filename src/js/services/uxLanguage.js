'use strict';

angular.module('ringnetworkApp.services').factory('uxLanguage', function languageService($log, lodash, gettextCatalog, amMoment, configService) {
    var root = {};

    root.availableLanguages = [{
        name: 'English',
        isoCode: 'en'
    }, {
        name: '中文',
        isoCode: 'zh_CN',
        useIdeograms: true
    }, {
        name: 'Bahasa Indonesia',
        isoCode: 'id_ID',
    }, {
        name: 'Türk',
        isoCode: 'tr_TR',
    }, {
        name: 'Deutsch',
        isoCode: 'de_DE',
    }, {
        name: '日本語',
        isoCode: 'ja_JP',
        useIdeograms: true,
    }];


    root.currentLanguage = null;

    root._detect = function () {
        // Auto-detect browser language
        var userLang, androidLang;

        if (navigator && navigator.userAgent && (androidLang = navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
            userLang = androidLang[1];
        } else {
            // works for iOS and Android 4.x
            userLang = navigator.userLanguage || navigator.language;
        }
        userLang = userLang ? (userLang.split('-', 1)[0] || 'en') : 'en';

        for (var i = 0; i < root.availableLanguages.length; i++) {
            var isoCode = root.availableLanguages[i].isoCode;
            if (userLang === isoCode.substr(0, 2))
                return isoCode;
        }

        return 'en';
    };

    root._set = function (lang) {
        $log.debug('Setting default language: ' + lang);
        gettextCatalog.setCurrentLanguage(lang);
        if (lang !== 'en')
            gettextCatalog.loadRemote("languages/" + lang + ".json");
        amMoment.changeLocale(lang);
        root.currentLanguage = lang;
    };

    root.getCurrentLanguage = function () {
        return root.currentLanguage;
    };

    root.getCurrentLanguageName = function () {
        return root.getName(root.currentLanguage);
    };

    root.getCurrentLanguageInfo = function () {
        return lodash.find(root.availableLanguages, {
            'isoCode': root.currentLanguage
        });
    };

    root.getLanguages = function () {
        return root.availableLanguages;
    };

    root.init = function () {
        root._set(root._detect());
    };

    root.update = function () {
        var userLang = configService.getSync().wallet.settings.defaultLanguage;

        if (!userLang) {
            userLang = root._detect();
        }

        if (userLang != gettextCatalog.getCurrentLanguage()) {
            root._set(userLang);
        }
        return userLang;
    };

    root.getName = function (lang) {
        return lodash.result(lodash.find(root.availableLanguages, {
            'isoCode': lang
        }), 'name');
    };

    return root;
});
