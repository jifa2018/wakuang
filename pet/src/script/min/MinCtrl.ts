import { CustomDefine, TYPETOOL } from "../../custom/CustomDefine";
import { CustomWindow } from "../../custom/ui/CustomWindow";
import { HttpManager, HttpMethod, HttpName } from "../../manager/HttpManager";
import { AppCtrl } from "../AppCtrl";
import { GameCtrl } from "../GameCtrl";
import { LoadingCtrl } from "../LoadingCtrl";
import { LocalStorage, LOCKSTORAGEKEY } from "../LocalStorage";
import { PETBEHAVIOURTYPE } from "../pet/BehaviourMgr";
import { PublicNoticeMgr } from "../publicNotice/PublicNoticeMgr";
import { GMUI } from "./GMUI";
import { MinData } from "./MinData";
import { MinDoorUI } from "./MinDoorUI";
import { MinScene } from "./MinScene";
import MinUI from "./MinView";

const CROWDSICONNUMBE = 3; //固定人群显示头像的个数

export class MinCtrl {
    private static _ins: MinCtrl;
    minData: MinData;
    public nextGetTreasure: any = null;//即将得到的宝藏

    public static get ins(): MinCtrl {
        if (!this._ins)
            MinCtrl._ins = new MinCtrl();
        return this._ins;
    }
    view: MinUI;

    private arrCrowdsIcon = [];

    constructor() {
        this.minData = MinData.ins;
        // EventManager.ins.on(CustomDefine.EVENT_CHANGTILI, this, this.setLabour);

        //测试
        Laya.stage.on(Laya.Event.KEY_UP, this, this._onKeyDown);
    }

    Init() {
        this.InitLabour();
    }


    onBack() {
    }

    openBag() {
    }

    private TILITIPTEXT = "您的体力耗空了，明日再来哦~"
    /**开始挖矿 */
    startMining() {
        if (MinScene.ins.isSendError) {
            return;
        }
        //没体力
        if (this.minData.getnState() == 3) {
            UIManager.ins.closeWindow(CustomWindow.minRank);
            UIManager.ins.closeWindow(CustomWindow.minRecord);
            let _text = (this.view.ui.tip2.getChildByName("content") as Laya.Label).text;
            if (_text == this.TILITIPTEXT) return
            EventManager.ins.event(CustomDefine.EVENT_CLOSELED)
            this.view.ui.tip2.visible = true;
            (this.view.ui.tip2.getChildByName("content") as Laya.Label).text = this.TILITIPTEXT;

            return
            //结束    0：没进入矿洞，1：正常， 2：矿洞结束， 3：没体力，4：挖空
        } else if (this.minData.getnState() == 2 || this.minData.getnState() == 4 || this.minData.getnState() == 0) {
            UIManager.ins.closeWindow(CustomWindow.minRank);
            UIManager.ins.closeWindow(CustomWindow.minRecord);
            if (this.view.bagContentChild) {
                (this.view.curSelectGood.getChildByName("img_jb") as Laya.Image).visible = false;
                this.view.bagContentChild.removeSelf();
                this.view.bagContentChild.destroy();
            }
            EventManager.ins.event(CustomDefine.EVENT_CLOSELED)
            this.view.ui.tip2.visible = true;
            (this.view.ui.tip2.getChildByName("content") as Laya.Label).text = "当前矿洞资源正在重生，更大宝藏等你发掘，明日请早哦！"
            return
        } else if (this.minData.getnState() == 5) {
            this.onMinMaintain();
            return
        }
        this.onMinRequest(MinScene.ins.curPetIns.speed * 1000);
        MinScene.ins.curPetIns.setBehaviourState(PETBEHAVIOURTYPE.mining)
    }

    /**矿洞修护中 */
    onMinMaintain() {
        AppCtrl.ins.loadMaintain();
    }

    /**10s特殊情况调用数据请求后续操作 */
    onExecRequsetInErr(n: number) {
        this.onMinRequest(n);
    }

    /**网络服务错误的情况 */
    // onNetWorkError() {
    //     Laya.timer.loop(10000, this, this.exentNetWorkError)
    // }

    // exentNetWorkError() {
    //     console.log("网络服务错误的情况 ，开启10s 请求服务。获取之后的行为")
    //     HttpManager.ins.sendMsg(HttpName.MINBEHAVIOUR, null, HttpMethod.POST, this.onComplete);
    // }

    /**
     * 切换工具
     */
    selectHoe() {
        if (MinScene.ins.curToolType == TYPETOOL.lv_1) {
            EventManager.ins.event(CustomDefine.EVENT_CHANGETOOL, { typeTool: TYPETOOL.lv_0 });
        } else {
            EventManager.ins.event(CustomDefine.EVENT_CHANGETOOL, { typeTool: TYPETOOL.lv_1 });
        }

    }

    //设置体力
    InitLabour() {
        // this.view.ui.p_bar.value = this.minData.getnExpended() / this.minData.getLabour();
    }

    //设置人群信息
    setCrowdsInfo() {
        let nCount = this.minData.getMinCrowd().crowdsCount ? this.minData.getMinCrowd().crowdsCount : 0;
        let arrCrowds = this.minData.getMinCrowd().crowdsIcon ? this.minData.getMinCrowd().crowdsIcon : [];
        this.view.ui.crowdsCount.text = nCount.toString() + "人";
        this.setCrowdsIcon(arrCrowds);
    }

    //更新数据
    upDate() {
        HttpManager.ins.sendMsg(HttpName.MININFO, null, HttpMethod.GET, this.onComplete);
    }

    //更新本地存储
    upDateStorage() {

        //背包凸币
        let money = parseFloat(LocalStorage.getItem(LOCKSTORAGEKEY.haveGold));
        if (Number.isNaN(money)) {
            money = 0
        }
        let strNumber = parseFloat(this.minData.getnReward().toString());
        let _m = Math.floor(strNumber * 100) / 100
        LocalStorage.setItem(LOCKSTORAGEKEY.haveGold, _m.toString())

        //背包宝藏
        let strTreasure = LocalStorage.getJSON(LOCKSTORAGEKEY.haveTreasure);
        let _json = {}
        if (strTreasure) {
            _json = strTreasure;
        }
        let ownTreasure_infos = this.minData.getownTreasure_infos();
        ownTreasure_infos.forEach(element => {
            if (element.user_id == HttpManager.ins.uid) {
                _json[element.id] = true;
                console.log("发现获取了宝藏id" + element.id);
            }
        });
        let strJSON = JSON.stringify(_json);

        LocalStorage.setJSON(LOCKSTORAGEKEY.haveTreasure, strJSON);
    }

    //挖矿请求
    onMinRequest(time) {
        Laya.timer.once(time, this, () => {
            HttpManager.ins.sendMsg(HttpName.MINBEHAVIOUR, null, HttpMethod.POST, this.onComplete);
        })
    }


    onComplete(msg: string, method: string, e) {
        // MinCtrl.ins.requesState = false
        if (e.code == -1) {
            console.error("服务器返回:", e.msg);
            return;
        }
        MinScene.ins.isSendError = false;
        // console.log("http挖矿信息------------成功！" + JSON.stringify(e));
        switch (msg) {
            case HttpName.MININFO:
                break;
            case HttpName.MINBEHAVIOUR:
                break;
            default:
                break;
        }

        //如果矿洞状态不正常的时候不更新数据，return
        if (e.data.status == 0 || e.data.status == 2 || e.data.status == 4) {
            MinData.ins.upDate(e);
            MinCtrl.ins.minResult(e)
            return;
        } else if (e.data.status == 5) {
            MinCtrl.ins.onMinMaintain();
        }
        MinData.ins.upDate(e);
        MinCtrl.ins.setViewInfo();
        MinCtrl.ins.minResult(e)
        EventManager.ins.event(CustomDefine.EVENT_UPDATENOTICE);
    }

    /*** 挖矿的结果*/
    minResult(e: any) {

        let _result: PETBEHAVIOURTYPE = PETBEHAVIOURTYPE.huxi;
        let money = parseFloat(LocalStorage.getItem(LOCKSTORAGEKEY.haveGold));
        if (Number.isNaN(money)) {
            money = 0
        }
        if (MinCtrl.ins.isNewTreasure()) {
            console.log("本地没有该宝藏，=================承认获取")
            _result = PETBEHAVIOURTYPE.goodCG;
        } else if (MinData.ins.getnReward() > money) {
            _result = PETBEHAVIOURTYPE.chenggong;
        } else {
            _result = PETBEHAVIOURTYPE.shibai;
        }

        //控制下,如果没有体力，呼吸状态
        if (e.data.status == 3) {
            this.onExecRequsetInErr(5000);
            if (MinScene.ins.curPetIns) {
                MinScene.ins.curPetIns.setBehaviourState(PETBEHAVIOURTYPE.huxi);
            }
            return
        } else if (e.data.status == 5) {
            MinCtrl.ins.onMinMaintain();
        }

        if (MinScene.ins.curPetIns) {
            MinScene.ins.curPetIns.stopPlayAni();
            MinScene.ins.curPetIns.setBehaviourState(_result);
        }

    }

    setViewInfo() {
        this.setMinCion();
        this.setLabour();
        this.setCrowdsInfo();
        this.bagList();
    }

    /**背包列表 */
    bagList() {
        this.view.ui.list_bag.array = this.ExtendGetOwnTreasureInfos();
    }

    ExtendGetOwnTreasureInfos() {
        let arr = [];
        this.minData.getownTreasure_infos().forEach(element => {
            arr.push(element);
        });
        let money = parseFloat(LocalStorage.getItem(LOCKSTORAGEKEY.haveGold));
        if (Number.isNaN(money)) {
            money = 0
        }
        //2021-06-29 andy 产品说背包 不显示凸币两字
        arr.unshift({ avatar: "game/img_gold.png", desc: money + "" })
        while (arr.length < 5) {
            arr.push({});
        }
        return arr;
    }

    setMinCion() {
        let html = "<p><span style='color:#FDC001'>今日矿币总量<span>&nbsp;</span></span><span>" + this.minData.getzMinCion() + " / " + this.minData.getsMinCion() + "</span></p>";
        if (!this.view.ui.minNumber.style) return
        this.view.ui.minNumber.style.fontSize = 20;
        this.view.ui.minNumber.style.color = "#fff"
        this.view.ui.minNumber.style.wordWrap = false;
        this.view.ui.minNumber.innerHTML = html
    }

    //刷新礼物的列表
    refreshList() {
        this.view.itemTreasuryScene.refresh(this.minData.getoTreasure_infos());
    }

    //创建人群的显示头像
    setCrowdsIcon(arr: Array<any>) {
        if (!arr || arr.length < 1) return

        if (this.arrCrowdsIcon.length != arr.length) {
            this.view.ui.img_bg_crowd.removeChildren(2, this.view.ui.img_bg_crowd.numChildren)
            this.arrCrowdsIcon = [];
        }else{
            return
        }

        let _img = this.view.ui.img_bg_crowd.getChildByName("img_crowdIcon") as Laya.Image;
        for (let index = 0; index < arr.length; index++) {
            const ele = arr[index];
            let rAvatar = GameCtrl.ins.onCompressImg(ele.avatar,_img.width);
            let img = new Laya.Image(rAvatar);
            if (this.arrCrowdsIcon.indexOf(ele.id) == -1 || this.arrCrowdsIcon.length < CROWDSICONNUMBE) {
                this.arrCrowdsIcon.push(ele.id);
            } else {
                continue;
            }
            img.width = _img.width;
            img.height = _img.height;
            img.x = (img.width * index) + (13 * index)
            img.y = -1;
            let img_bg = new Laya.Image("mining/img_icon_yuan.png");
            img_bg.width = 63
            img_bg.height = 63
            img_bg.x = -1.5
            img_bg.y = -1
            img.addChild(img_bg)
            this.view.ui.img_bg_crowd.addChild(img);

            // this.view.ui.img_bg_crowd.addChild(img);

            let _sp = new Laya.Sprite();
            _sp.graphics.drawCircle(29.5, 29.5, 29.5, "#00ffff");
            img.mask = _sp;
        }
    }

    /**
     * 改变体力值
     * @param n 
     */
    setLabour() {
        let n = this.minData.getRemainingPower() / this.minData.getLabour();
        let nLabour: number = Math.floor(n * 100) / 100
        if (isNaN(nLabour)) {
            nLabour = 0;
        }
        this.view.proBar.onChangeStrength(nLabour);
        if (MinScene.ins.curPetIns) {
            MinScene.ins.curPetIns.setSpeed(nLabour * 100)
        }
    }

    //包的变化
    TweenToBag() {
        Laya.Tween.clearAll(this);
        Laya.Tween.to(this.view.ui.kuangbao,
            {
                scaleX: 1.2,
                scaleY: 1.2,
            }, 600, null, Laya.Handler.create(this, this.onTweenToBagComplete))
    }

    onTweenToBagComplete() {
        Laya.Tween.to(this.view.ui.kuangbao,
            {
                scaleX: 1,
                scaleY: 1,
            }, 500, null)
    }

    /**
    * 判断是否有获取宝藏
    */
    isNewTreasure() {
        this.nextGetTreasure = null;
        let strTreasure = LocalStorage.getJSON(LOCKSTORAGEKEY.haveTreasure);
        let _json = {}
        if (strTreasure) {
            _json = strTreasure;
        }

        // console.log("判断是否有获取宝藏=============", JSON.stringify(_json));

        let _is: boolean = false;
        MinData.ins.getownTreasure_infos().forEach((item, index) => {
            if (item.user_id == HttpManager.ins.uid) {
                if (_json[item.id] != true) {
                    this.nextGetTreasure = item;
                }
            }
        })
        this.upDateStorage();
        return this.nextGetTreasure
    }


    private gmui: GMUI
    /**
     * ======================================================
     */
    _onKeyDown(e: Laya.Event) {
        if (this.gmui && e.keyCode == 96) {
            LocalStorage.clearAll();
        }
    }

    /**返回入口 */
    backDoor() {
        EventManager.ins.event(CustomDefine.EVENT_CLOSELED)
        if (this.view.ui) {
            this.view.ui.tip2.visible = false;
        }
        //如果是体力值没有了，关掉UI就可以了
        if (this.minData.getnState() == 3) {
            EventManager.ins.event(CustomDefine.EVENT_OPENLED)
            return
        }
        this.minData.clearData();
        MinScene.ins.onDestory();
        // UIManager.ins.closeWindow(CustomWindow.min);
        // UIManager.ins.getWindow(CustomWindow.min).onDestory();

        LoadingCtrl.ins.enterGame();
    }

    hideGoldUI() {
        if (!this.view || !this.view._goldsTop) return
        this.view._goldsTop.visible = false;
    }

    showGoldUI() {
        if (!this.view || !this.view._goldsTop) return
        this.view._goldsTop.visible = true;
    }
}

