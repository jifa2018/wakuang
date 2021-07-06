import { CustomDefine } from "../../custom/CustomDefine";

export enum PETBEHAVIOURTYPE {
    mining = "wakuang",          // 挖矿
    huxi = "huxi",               // 呼吸
    shibai = "shibai",           // 失败
    chenggong = "chenggong",     // 成功
    goodCG = "goodCG"            //宝藏成功
}

/**
 * 行为管理
 */
export class BehaviourMgr {

    //当前的行为类型
    curBehaviourType: PETBEHAVIOURTYPE = null;
    constructor() {

    }

    //设置行为
    setBehaviour(t: PETBEHAVIOURTYPE) {
        this.curBehaviourType = t;
        // console.log("当前的行为", this.curBehaviourType)
        EventManager.ins.event(CustomDefine.EVENT_BEHAVIOUR, t);
    }

    //清除行为
    clearBehaviour() {
        this.curBehaviourType = null;
    }

    //获取当前行为
    getBehaviour(): PETBEHAVIOURTYPE {
        return this.curBehaviourType
    }



}