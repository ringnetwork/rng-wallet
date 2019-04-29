'use strict';

angular.module('ringnetworkApp.controllers').controller('sidebarController', function ($rootScope, lodash, profileService, configService, go) {
	var self = this;
	self.walletSelection = false;

	// wallet list change
	$rootScope.$on('Local/WalletListUpdated', function (event) {
		self.walletSelection = false;
		self.setWallets();
	});

	$rootScope.$on('Local/ColorUpdated', function (event) {
		self.setWallets();
	});

	$rootScope.$on('Local/AliasUpdated', function (event) {
		self.setWallets();
	});

    self.switchWallet = function (selectedWalletId, currentWalletId) {
        if (selectedWalletId == currentWalletId) return;
        self.walletSelection = false;
        profileService.setAndStoreFocus(selectedWalletId, true, function () {
        });

        self.fc = profileService.focusedClient;
        if (self.fc.observed) {
            go.observed = 1; // go.js中 表示为： 1 观察钱包
        } else {
            go.observed = 0; // go.js中： 表示为: 0 普通钱包
        }
    };


	self.toggleWalletSelection = function () {
		self.walletSelection = !self.walletSelection;
		if (!self.walletSelection) return;
		self.setWallets();
	};


	self.setWallets = function () {
		if (!profileService.profile) return;

		var config = configService.getSync();
		config.colorFor = config.colorFor || {};
		config.aliasFor = config.aliasFor || {};
		var ret = lodash.map(profileService.profile.credentials, function (c) {
			return {
				m: c.m,
				n: c.n,
				name: config.aliasFor[c.walletId] || c.walletName,
				id: c.walletId,
				color: config.colorFor[c.walletId] || '#0095ff',
				observed: c.observed  // ********** 参考是否是 观察钱包 **********
			};
		});
		self.wallets = lodash.sortBy(ret, 'name');
	};
	self.setWallets();


	self.goPreferences = function (itemID, currentID) {
		profileService.tempWalletId = currentID;
		if (itemID !== currentID) {
			profileService.setAndStoreFocus(itemID, false, function () {
			});
		}
		self.fc = profileService.focusedClient;
		if(self.fc.observed){
			go.observed = 1; // go.js中 表示为： 1 观察钱包
		}else{
			go.observed = 0; // go.js中： 表示为: 0 普通钱包
		}
		$rootScope.go('preferences');
	};
});
