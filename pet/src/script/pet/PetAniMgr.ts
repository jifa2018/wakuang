



/**
 * 行为管理
 */

import { MinScene } from "../min/MinScene";
import { PETBEHAVIOURTYPE } from "./BehaviourMgr";

const TIMEOFFSET: number = 0.1; //延迟时间
export class PetAniMgr {

    public curAni: Laya.Animator;
    curAniName: string = null;
    private static _ins: PetAniMgr;
    isAlways: boolean;
    callBack: Laya.Handler;
    public static get ins(): PetAniMgr {
        if (!this._ins)
            PetAniMgr._ins = new PetAniMgr();
        return this._ins;
    }

    constructor() {

    }


    /**
     * 
     * @param ani      //动画器 
     * @param aniName  //动画名字
     * @param isAlways //是否一直播放
     * @param Handler  //动画完成回调
     */
    play(ani: Laya.Animator, aniName: PETBEHAVIOURTYPE, isAlways: boolean = true, callBack?: Laya.Handler) {
        this.curAni = ani;
        this.curAniName = aniName;
        this.isAlways = isAlways;
        this.callBack = callBack;
        this.curAni.speed = 1;
        this.curAni.play(aniName, 0, 0);
        let onceAni = false;
        if (isAlways) return
        Laya.timer.clear(this, this.playTime);
        Laya.timer.frameLoop(1, this, this.playTime);
    }

    playTime() {
        if (this.curAni.getControllerLayer().getCurrentPlayState().normalizedTime > 0.98) {
            this.stop();
        }
    }

    //结束
    stop() {

        Laya.timer.clear(this, this.playTime);
        if (this.callBack) {
            this.callBack.run()
        }
        // if (this.curAni) {
        //     this.curAni.speed = 0;
        // }
    }

}

