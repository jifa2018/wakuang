import { CustomDefine, TYPETOOL } from "../../custom/CustomDefine";
import { CustomWindow } from "../../custom/ui/CustomWindow";
import { HttpManager, HttpMethod, HttpName } from "../../manager/HttpManager";
import { GameCtrl } from "../GameCtrl";
import { LocalStorage, LOCKSTORAGEKEY } from "../LocalStorage";
import { PETBEHAVIOURTYPE } from "../pet/BehaviourMgr";
import { Pet } from "../pet/Pet";
import { PetAniMgr } from "../pet/PetAniMgr";
import { PublicNoticeMgr } from "../publicNotice/PublicNoticeMgr";
import { UserData } from "../user/UserData";
import { MinCtrl } from "./MinCtrl";
import { MinData } from "./MinData";
import { MinTipInfo } from "./MinTipInfo";
import Sprite3D = Laya.Sprite3D
import Handler = Laya.Handler
/*** 挖矿场景*/
const MINBG = "mining/img_bg.jpg" //矿洞地图
export class MinScene {
    oGame: GameCtrl;
    scene: Laya.Scene3D;
    camera: Laya.Camera;
    private static _ins;
    bgView: Laya.Sprite;
    _ani: Laya.Animator;
    public curToolType: TYPETOOL = null; //当前工具类型
    curPetIns: Pet;
    arrRes: string[];
    gold: Laya.Sprite3D;
    CAMERA: string;
    SCENE: string;
    GOLD: string;
    DENGGUANG: string;
    MANRES: string;
    WOMANRES: string;
    private _goldAni: Laya.Animator;
    dengguang: any;
    curHttpIsError: boolean = false;
    SHADOWLIGHT: string;
    isSendError: boolean = false;//网络错误的标记
    imgShadow: Laya.Image;
    directionalLight1: Laya.DirectionLight;
    pointLight1: Laya.PointLight;
    pointLight2: Laya.PointLight;
    pointLight3: Laya.PointLight;
    directionLight: any;
    public static get ins() {
        if (!this._ins)
            this._ins = new MinScene();
        return this._ins;
    }

    constructor() {
        EventManager.ins.on(CustomDefine.EVENT_PETANIFINISHEVENT, this, this.petAniFinishUpData);
        EventManager.ins.on(CustomDefine.EVENT_PETMINOVERUPDATEEVENT, this, this.petMinFinishUpData);
        EventManager.ins.on(CustomDefine.HTTP_SEND_ERROR, this, this.sendError);
    }

    /**网络错误事件 */
    sendError(e) {
        if (e.data == HttpName.MINBEHAVIOUR) {
            this.isSendError = true;
            this.curPetIns.setBehaviourState(PETBEHAVIOURTYPE.huxi);
            MinCtrl.ins.onExecRequsetInErr(5000);
        }
    }

    init() {
        console.log("==============MinScene=init=开始执行==================")
        //this.CAMERA = Define.CDN + "3d/camera.lh";                     //摄像头
        //this.SCENE = Define.CDN + "3d/main.ls";                        //场景
        this.GOLD = Define.CDN + "3d/jinbi.lh";                        //金币
        this.MANRES = Define.CDN + "3d/pet_0.lh";
        this.WOMANRES = Define.CDN + "3d/pet_1.lh";
        //this.DENGGUANG = Define.CDN + "3d/dengguang.lh"                //灯光
        // this.SHADOWLIGHT = Define.CDN + "3d/shadowLight.lh"            //影子灯光
        this.oGame = GameCtrl.ins;
        this.oGame.init();
        this.loadSceneBackgound()
        UIManager.ins.openWindow(CustomWindow.min);
        UIManager.ins.getWindow(CustomWindow.min).onInit();
        this.showScene()
        this.oGame.camera.orthographicVerticalSize = 10;
        EventManager.ins.on(CustomDefine.EVENT_CHANGETOOL, this, this.changeTool);
        EventManager.ins.on(CustomDefine.EVENT_BEHAVIOUR, this, this.onBehaviour);

        //清理电子屏的标记，在场景初始化的时候
        PublicNoticeMgr.ins()._associate = null;

        Laya.timer.frameLoop(1, this, () => {
            if (this.curPetIns && GameCtrl.ins.camera && this.curPetIns.oPet) {
                let _r = this.findChild(this.curPetIns.oPet, "Scapula_R");

                let _position = this.worldToScreen(GameCtrl.ins.camera, _r.transform.position);
                if (this.imgShadow) {
                    this.imgShadow.x = _position.x - 100;
                }
            }
        })
    }

    //显示模型
    showScene() {
        this.arrRes = [this.GOLD, this.MANRES, this.WOMANRES,];
        Laya.loader.create(this.arrRes, Handler.create(this, this.onLoaded));
    }

    onLoaded(b: boolean) {
        if (!b) {
            console.error("资源加载失败")
        } else {
            console.log("资源加载成功", this.arrRes)
        }
        this.scene = GameCtrl.ins.scene3D;
        let camera = GameCtrl.ins.camera;
        this.curPetIns = new Pet();
        this.curPetIns.setSex(UserData.ins.sex);
        this.curPetIns.onLoaded();
        // this.curPetIns.oPet.active= false;
        LayerManager.ins.addChild(this.scene, LayerName.scene);
        this.scene.addChild(camera)
        this.gold = Laya.loader.getRes(this.GOLD);
        this.gold.active = false;
        this.gold.transform.position = new Laya.Vector3(0, -0.5, 0);
        this.scene.addChild(this.gold)
        this._goldAni = this.gold.getComponent(Laya.Animator) as Laya.Animator;
        // this.dengguang = Laya.loader.getRes(this.DENGGUANG);
        this.setLight();
        // this.scene.addChild(this.dengguang)

        // let a = JSON.stringify(this.dengguang)
        // console.log("模型已经添加到舞台。。。", this.dengguang.name);
        Laya.loader.clearRes(this.CAMERA)
        Laya.loader.clearRes(this.GOLD)
        Laya.loader.clearRes(this.MANRES)
        Laya.loader.clearRes(this.WOMANRES)
        // Laya.loader.clearRes(this.DENGGUANG)
    }

    /**灯管的调试 */
    setLight() {

        this.directionLight = this.scene.addChild(new Laya.DirectionLight()) as Laya.DirectionLight;
        this.directionLight.color = new Laya.Vector3((238 / 225), (214 / 225), (131 / 225));
        this.directionLight.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 0));
        this.directionLight.intensity = 1

        this.directionLight.transform.localPosition = new Laya.Vector3(3.025143, 2.002386, -0.9977947);
        this.directionLight.transform.localPosition = new Laya.Vector3(61.356, -62.998, -12.517);


        // var directionLight1: Laya.DirectionLight = new Laya.DirectionLight()
        // this.scene.addChild(directionLight1)
        // directionLight1.color = new Laya.Vector3((88 / 225), (30 / 225), (7 / 225));
        // directionLight1.transform.worldMatrix.setForward(new Laya.Vector3(0, -1, 0));
        // directionLight1.intensity = 2

        // directionLight.transform.localPosition = new Laya.Vector3(3.025143, 2.002386, -0.9977947);
        // directionLight.transform.localPosition = new Laya.Vector3(61.356, -62.998, -12.517);

        // this.directionalLight1 = new Laya.DirectionLight();
        // this.pointLight1 = new Laya.PointLight();
        // this.pointLight2 = new Laya.PointLight();
        // this.pointLight3 = new Laya.PointLight();
        // this.scene.addChild(this.directionalLight1)
        // this.scene.addChild(this.pointLight1)
        // this.scene.addChild(this.pointLight2)
        // this.scene.addChild(this.pointLight3)

        // this.directionalLight1.transform.localPosition = new Laya.Vector3(-0.8119819,0.1635918,-1.872633);
        // this.directionalLight1.transform.localRotation = new Laya.Quaternion(-0.8119819,0.1635918,-1.872633);
        // this.directionalLight1.transform.localScale = new Laya.Vector3(0.3761698,0.3761698,0.3761698);
        // this.directionalLight1.color = new Laya.Vector3((69/255),(99/255),(147/255))
        // this.directionalLight1.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 0));
        // this.directionalLight1.intensity = 0.9

        // this.pointLight1.transform.localPosition = new Laya.Vector3(2.997104,2.023073,-1.983674);
        // this.pointLight1.transform.localRotation = new Laya.Quaternion(61.356,-62.998,-12.517);
        // this.pointLight1.transform.localScale = new Laya.Vector3(0.4225837,0.4225837,0.4225837);
        // this.pointLight1.color = new Laya.Vector3((238/255),(214/255),(131/255))
        // this.pointLight1.intensity = 2.8
        // this.pointLight1.range = 10

        // this.pointLight2.transform.localPosition = new Laya.Vector3(-2.01243,1.028074,1.996968);
        // this.pointLight2.transform.localRotation = new Laya.Quaternion(61.356,-62.998,-12.517);
        // this.pointLight2.transform.localScale = new Laya.Vector3(0.4225837,0.4225837,0.4225837);
        // this.pointLight2.color = new Laya.Vector3((88/255),(30/255),(7/255))
        // this.pointLight2.intensity = 1.6
        // this.pointLight2.range = 10

        // this.pointLight3.transform.localPosition = new Laya.Vector3(0.5248325,0.5107422,1.003301);
        // this.pointLight3.transform.localRotation = new Laya.Quaternion(61.356,-62.998,-12.517);
        // this.pointLight3.transform.localScale = new Laya.Vector3(0.4225837,0.4225837,0.4225837);
        // this.pointLight3.color = new Laya.Vector3((238/255),(214/255),(131/255))
        // this.pointLight3.intensity = 1.1
        // this.pointLight3.range = 10


        // let directionalLight1 = this.findChild(this.dengguang, "directionalLight1") as Laya.DirectionLight;
        // let pointLight1 = this.findChild(this.dengguang, "pointLight1") as Laya.DirectionLight;
        // let pointLight2 = this.findChild(this.dengguang, "pointLight2") as Laya.DirectionLight;
        // let pointLight3 = this.findChild(this.dengguang, "pointLight3") as Laya.DirectionLight;
        // pointLight1.intensity = 1.45
        // pointLight2.intensity = 1.4
        // pointLight3.intensity = 1.65
        // directionalLight1.intensity = 10

        // directionalLight1.lightmapBakedType = 2;
        // pointLight1.lightmapBakedType = 2
        // pointLight2.lightmapBakedType = 2
        // pointLight3.lightmapBakedType = 2
        // directionalLight1.destroy()
        // pointLight1.destroy()
        // pointLight2.destroy()
        // pointLight3.destroy()
    }

    //构建场景地图
    loadSceneBackgound() {
        if (!this.bgView) {
            this.bgView = new Laya.View();
            this.bgView.name = "bgView"
            LayerManager.ins.addChild(this.bgView, LayerName.scene);
            this.bgView.width = Laya.stage.width;
            this.bgView.height = Laya.stage.height;
            let _img = new Laya.Image(MINBG);
            _img.x = -(CustomDefine.maxBgWidth - Define.DeviceW) >> 1;
            this.bgView.addChild(_img);
            //临时添加影子
            this.imgShadow = new Laya.Image("mining/img_shadow.png");
            _img.addChild(this.imgShadow);
            this.imgShadow.alpha = 0.8
            this.imgShadow.width = 450;
            this.imgShadow.height = 150;
            this.imgShadow.x = 0;
            this.imgShadow.y = 1130;

            //2021-06-23 andy 矿洞远处小人背影 上中下
            let arrPos: Array<Array<number>> = [[147, 913, 0.3, 0], [320, 920, 0.4, 0], [453, 893, 0.3, 180],
            [320, 920, 0.4, 0], [393, 925, 0.4, 180], [240, 940, 0.4, 0],
            [167, 960, 0.6, 0], [300, 947, 0.6, 0], [430, 925, 0.7, 180]];

            for (let i: number = 0; i < 9; i++) {
                let frame: BaseFrame = FrameManager.ins.getFrameBySkin("mining_frame/role" + (i < 3 ? 3 : i < 6 ? 2 : 1));//if(i>6)frame.visible=false;
                if (frame) {
                    frame.x = arrPos[i][0];
                    frame.y = arrPos[i][1];
                    frame.scale(arrPos[i][2], arrPos[i][2]);
                    frame.skewY = arrPos[i][3];
                    Laya.timer.once(200 * i, this, () => {
                        frame.playFrame(true, this.bgView);
                    })
                }

            }
        }
    }

    //行为管理器通知结果
    onBehaviour(EVENT_BEHAVIOUR: any) {
        switch (EVENT_BEHAVIOUR.data) {
            case PETBEHAVIOURTYPE.mining:
                // MinCtrl.ins.onMinRequest();
                this.curPetIns.startMining()
                break;
            case PETBEHAVIOURTYPE.shibai:
                this.curPetIns.startSb()
                break;
            case PETBEHAVIOURTYPE.huxi:
                Laya.timer.once((this.curPetIns.sleep * 1000), this, () => {
                    MinCtrl.ins.startMining()
                })
                this.curPetIns.startHx()
                break;
            case PETBEHAVIOURTYPE.chenggong:
                this.goldAni();             //金币动画
                this.curPetIns.startCg();   //人物动画
                MinCtrl.ins.TweenToBag();   //背包动画
                break;
            case PETBEHAVIOURTYPE.goodCG:
                this.curPetIns.startCg();
                let _data = MinCtrl.ins.nextGetTreasure ? MinCtrl.ins.nextGetTreasure : {}
                EventManager.ins.event(CustomDefine.EVENT_CLOSELED)
                LayerManager.ins.addChild(new MinTipInfo(_data), LayerName.top)
                break;
            default:
                break;
        }
    }

    /**
     * 播放金币的动画
     */
    goldAni() {

        function ani() {
            if (this._goldAni.getCurrentAnimatorPlayState().normalizedTime >= 1) {
                this.gold.active = false;
                Laya.timer.clear(this, ani)
            }
        }

        this.gold.active = true;
        this._goldAni.play("gold", 0, 0.1);
        Laya.timer.frameLoop(1, this, ani);
    }
    /**
     * 
     * @param type 工具的类型 
     */
    changeTool(type: any) {
        this.curPetIns.changeTool(type);
    }


    private timeing: boolean = false;
    setTimeing(b: boolean) {
        this.timeing = b;
    }






    onDestory() {
        this.curPetIns.onDestroy();
        this._goldAni.destroy();
        this.gold.destroy();
        this.directionLight.destroy();
        this.imgShadow.destroy();
        this.bgView.destroy();

        this.curPetIns = null;
        this._goldAni = null;
        this.gold = null;
        this.directionLight = null;
        this.imgShadow = null;
        this.bgView = null;
        // this.dengguang.destroy();
        // this.directionalLight1.destroy()
        // this.pointLight1.destroy()
        // this.pointLight2.destroy()
        // this.pointLight3.destroy()
        UIManager.ins.closeWindow(CustomWindow.min);
        UIManager.ins.getWindow(CustomWindow.min).onDestory();
        Laya.timer.clearAll(this);

        console.log("场景资源销毁完毕")
    }

    //动画完成更新部分
    petAniFinishUpData() {
        MinCtrl.ins.upDateStorage();
        MinCtrl.ins.bagList();
    }

    /**挖矿请求数据成功事件 */
    petMinFinishUpData() {
        PetAniMgr.ins.stop();
    }




    /**
     * 查找节点
     * @param sp 精灵
     * @param name 需要查找的节点名
     */
    findChild(sp, name) {
        if (sp.name == name)
            return sp;
        else
            return this._findChild(sp._children, name);
    }
    _findChild(spArr, name) {
        var arr: Array<any> = [];
        for (var i = 0; i < spArr.length; i++) {
            var child = spArr[i];
            if (child.name == name) {
                return child;
            }
            else if (child.numChildren) {
                arr = arr.concat(child._children);
            }
        }
        if (!arr.length)
            return null;
        return this._findChild(arr, name);
    }

    /**世界坐标转屏幕坐标 */
    worldToScreen(camera: Laya.Camera, pos: Laya.Vector3): Laya.Vector2 {
        var outPos: Laya.Vector4 = new Laya.Vector4();
        camera.viewport.project(pos, camera.projectionViewMatrix, outPos);
        return new Laya.Vector2(outPos.x / Laya.stage.clientScaleX, outPos.y / Laya.stage.clientScaleY);
    }
}