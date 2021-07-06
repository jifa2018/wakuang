import { CustomDefine, TYPETOOL } from "../../custom/CustomDefine";
import { MinScene } from "../min/MinScene";
import { basePet } from "./basePet";
import { PetAniMgr } from "./PetAniMgr";
import { BehaviourMgr, PETBEHAVIOURTYPE } from "./BehaviourMgr";
import { HttpManager, HttpMethod, HttpName } from "../../manager/HttpManager";
import Sprite3D = Laya.Sprite3D
import Handler = Laya.Handler
import { MinCtrl } from "../min/MinCtrl";
import { UserData } from "../user/UserData";
import { AppCtrl } from "../AppCtrl";

export class Pet extends basePet {
    MANRES = Define.CDN + "3d/pet_0.lh";
    WOMANRES = Define.CDN + "3d/pet_1.lh";
    oPet: Laya.Sprite3D;
    private _ani: any;
    curToolType: TYPETOOL;//当前工具              
    behaviour: BehaviourMgr;
    speed: number = 0;//挖矿动作间隔时间
    sleep: number = 0;//中途途休息时间  
    arrSpeed: Array<number> = [8, 4, 2]
    sex: number = 0;// 0 为男 1为女
    huohua: Laya.Animation;//火花特效
    body1Name: string;
    playSoundState: boolean;
    constructor() {
        super()
        this.behaviour = new BehaviourMgr();
    }

    setSex(n: number) {
        this.sex = n;
    }
    onLoaded() {
        //debug
        // this.sex = 2
        if (this.sex == 2) {
            this.oPet = Laya.loader.getRes(this.WOMANRES);
            this.body1Name = "woman_body_1";
        } else {
            this.oPet = Laya.loader.getRes(this.MANRES);
            this.body1Name = "man_body_1";
        }
        //this.oPet.active =false;
        //消除皮肤模型
        MinScene.ins.findChild(this.oPet, this.body1Name).active = false

        // MinScene.ins.findChild(this.oPet, "man_body").active = false
        // MinScene.ins.findChild(this.oPet, "man_foot").active = false
        // MinScene.ins.findChild(this.oPet, "man_body").active = false
        // MinScene.ins.findChild(this.oPet, "man_head").active = false

        MinScene.ins.scene.addChild(this.oPet);
        this._ani = this.oPet.getComponent(Laya.Animator);
        // this.oPet.transform.position = new Laya.Vector3(-0.15, -0.8, 0);
        this.oPet.transform.position = new Laya.Vector3(0, -0.8, 0);
        MinCtrl.ins.startMining();
    }

    setSpeed(n: number) {

        if (n >= 50) {
            this.speed = this.arrSpeed[0]
            this.sleep = this.arrSpeed[2]
        } else if (n >= 20) {
            this.speed = this.arrSpeed[1]
            this.sleep = this.arrSpeed[1]
        } else {
            this.speed = this.arrSpeed[2]
            this.sleep = this.arrSpeed[1]
        }
    }


    //设置体力
    setLabour(n: number) {
        this.labour = n;
    }

    //设置行为状态
    setBehaviourState(state: PETBEHAVIOURTYPE) {
        if (this.behaviour.curBehaviourType == state) return
        this.behaviour.setBehaviour(state);
    }



    startMining() {
        this.startAni(PETBEHAVIOURTYPE.mining, true)
        this.playAni();
        this.playSoundState = false;
        Laya.timer.frameLoop(5, this, this.playSound);
    }
    private _enormalizedTime: number = 0;
    playSound() {
        if (PetAniMgr.ins.curAni && PetAniMgr.ins.curAniName == PETBEHAVIOURTYPE.mining) {
            let normalizedTime = PetAniMgr.ins.curAni.getControllerLayer().getCurrentPlayState().normalizedTime;
            // console.log("=================normalizedTime===============", normalizedTime, this._enormalizedTime)
            if ((normalizedTime - this._enormalizedTime) > 0.12 && !this.playSoundState) {

                this.playSoundState = false;

            }
            if (!this.playSoundState) {
                this.playSoundState = true;
                AppCtrl.ins.isMiningPage();
                let _s = new Base64Type("res/sound/mining.mp3", "mining");
                SoundManager.ins.playSound(_s);
            }
            if ((normalizedTime - this._enormalizedTime) >= 1) {
                this.playSoundState = false;
                this._enormalizedTime = Number(normalizedTime.toFixed(0));
                AppCtrl.ins.isMiningPage();
                let _s = new Base64Type("res/sound/drop.mp3", "drop");
                SoundManager.ins.playSound(_s);
            }
        } else {
            this._enormalizedTime = 0
            Laya.timer.clear(this, this.playSound)
        }
    }




    startSb() {
        this.startAni(PETBEHAVIOURTYPE.shibai)
    }

    startCg() {
        this.startAni(PETBEHAVIOURTYPE.chenggong)
    }

    startHx() {
        this.startAni(PETBEHAVIOURTYPE.huxi, true)
        this.stopPlayAni();
    }




    /**
     * 
     * @param n 挖矿间隔时长
     */
    startAni(name: PETBEHAVIOURTYPE, isAlways: boolean = false) {
        this._ani.speed = 1;

        // console.log("===================startAni===================",this._ani,name)

        PetAniMgr.ins.play(this._ani, name, isAlways, Laya.Handler.create(this, this.aniFinishCallBack, [name]));
    }

    //动画播完回调
    aniFinishCallBack(aniType: PETBEHAVIOURTYPE) {
        // console.log("动作播完了", aniType)
        switch (aniType) {
            case PETBEHAVIOURTYPE.mining:
                // this.behaviour.setBehaviour(MinScene.ins.minResult())
                break;
            case PETBEHAVIOURTYPE.shibai:
                this.behaviour.setBehaviour(PETBEHAVIOURTYPE.huxi)
                break;
            case PETBEHAVIOURTYPE.chenggong:
                this.behaviour.setBehaviour(PETBEHAVIOURTYPE.huxi)
                EventManager.ins.event(CustomDefine.EVENT_PETANIFINISHEVENT);
                break;
            case PETBEHAVIOURTYPE.huxi:
                console.error("————————————————————————————————当前是待机呼吸状态")
                break;
            default:
                break;
        }
    }

    changeHoe(hoeUrl: string) {
        let tool = Laya.loader.getRes(hoeUrl) as Sprite3D;
        let oldTool = MinScene.ins.findChild(this.oPet, "Object015") as Sprite3D;
        let point = MinScene.ins.findChild(this.oPet, "Tool") as Sprite3D;
        point.destroyChildren()
        if (oldTool) {
            oldTool.active = false;
        }
        let oTool = Sprite3D.instantiate(tool, point) as Laya.Sprite3D;
        oTool.transform.localPosition = point.transform.localPosition;
        oTool.transform.localRotation = point.transform.localRotation;
        oTool.transform.localScale = new Laya.Vector3(100, 100, 100)
        // console.log("oTool", oTool,)
    }

    /**
     * 
     * @param type 工具的类型 
     */
    changeTool(type: any) { }


    private HUOHUAANIURl = "res/atlas/huhua.atlas";
    /**图集动画 */
    playAni() {
        this.huohua = new Laya.Animation();
        MinCtrl.ins.view.ui.bagContent.addChild(this.huohua);
        this.huohua.zOrder = -1
        Laya.timer.once(500, this, () => {
            if(this.huohua){
                this.huohua.loadAtlas(this.HUOHUAANIURl, Laya.Handler.create(this, this.aniPlay),);
            }
            
        })
    }

    aniPlay() {
        if(!this.huohua) return
        this.huohua.pos(80, 700)
        this.huohua.play(0, true)
    }

    /**销毁火花特效 */
    stopPlayAni() {
        if (!this.huohua) return
        this.huohua.removeSelf();
        this.huohua.destroy();
        this.huohua = null;
    }

    onDestroy() {
        this.oPet.destroy();
    }


}