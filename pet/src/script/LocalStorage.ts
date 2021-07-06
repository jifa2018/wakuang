
export enum LOCKSTORAGEKEY {
    haveGold = "haveGold",                  //拥有的金币
    haveTreasure = "haveTreasure",          //拥有的宝藏
}

export class LocalStorage {

    constructor() {

    }

    static setItem(name: string, str: string) {
        Laya.LocalStorage.setItem(name, str)
    }

    static setJSON(name: string, param: any) {
        let _JSON = JSON.stringify(param)
        Laya.LocalStorage.setItem(name, _JSON);
    }

    static getItem(name: string) {
        return Laya.LocalStorage.getItem(name)
    }

    static getJSON(name: string) {
        let strJSON = Laya.LocalStorage.getJSON(name);
        return JSON.parse(strJSON)
    }

    static clearItem(name: string) {
        Laya.LocalStorage.removeItem(name);
    }

    static clearAll() {
        Laya.LocalStorage.clear();
    }


}