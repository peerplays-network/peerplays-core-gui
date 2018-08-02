import assetConstants from "../chain/asset_constants";

class AssetUtils {
    
    static getFlagBooleans(mask, isBitAsset = false) {
        let booleans = {
            charge_market_fee    : false,
            white_list           : false,
            override_authority   : false,
            transfer_restricted  : false,
            disable_force_settle : false,
            global_settle        : false,
            disable_confidential : false,
            witness_fed_asset    : false,
            committee_fed_asset  : false
        }

        if (mask === "all") {
            for (let flag in booleans) {
                if (!isBitAsset && (assetConstants.uia_permission_mask.indexOf(flag) === -1)) {
                    delete booleans[flag];
                } else {
                    booleans[flag] = true;
                }
            }
            return booleans;
        }

        for (let flag in booleans) {
            if (!isBitAsset && (assetConstants.uia_permission_mask.indexOf(flag) === -1)) {
                delete booleans[flag];
            } else {
                if (mask & assetConstants.permission_flags[flag]) {
                    booleans[flag] = true;
                }
            } 
        }

        return booleans;
    }

    static getFlags(flagBooleans) {
        let keys = Object.keys(assetConstants.permission_flags);

        let flags = 0;

        keys.forEach(key => {
            if (flagBooleans[key] && key !== "global_settle") {
                flags += assetConstants.permission_flags[key];
            }
        });

        return flags;
    }

    static getPermissions(flagBooleans, isBitAsset = false) {
        let permissions = isBitAsset ? Object.keys(assetConstants.permission_flags) : assetConstants.uia_permission_mask;
        let flags = 0;
        permissions.forEach(permission => {
            if (flagBooleans[permission] && permission !== "global_settle") {
                flags += assetConstants.permission_flags[permission];
            }
        });

        if (isBitAsset) {
            flags += assetConstants.permission_flags["global_settle"];
        }

        return flags;
    }

    static parseDescription(description) {
        let parsed;

        try {
            parsed = JSON.parse(description)
        } catch (error) {
            
        }

        return parsed ? parsed : {main: description};
    }

	static getSymbol(symbol) {
		let symbolsMap = {
            'BITCOIN': 'BTC',
            'PEERPLAYS': 'PPY',
            'BITFUN': 'BTF'
		};

		return typeof symbolsMap[symbol] === 'undefined' ? symbol : symbolsMap[symbol];
	}

	static getName(symbol, name = '') {
		let shortNamesMap = {
			'BTC': 'Bitcoin',
            'PPY': 'Peerplays',
            'BTF': 'BitFun'
		};

		return typeof shortNamesMap[AssetUtils.getSymbol(symbol)] === 'undefined' ? name : shortNamesMap[AssetUtils.getSymbol(symbol)];
	}
}

export default AssetUtils;