import { GoldContent } from "./GoldContent";
import { ImageNotice } from "./ImageNotice";
import { ImageTextNotice } from "./ImageTextNotice";
import { BaseNotice, NOTICETYPE, PLAYBEFOREANITYPE, RUNTYPE } from "./BaseNotice";
import { NoticeContent } from "./NoticeContnet";
import { TextNotice } from "./TextNotice";
import { VidioNotice } from "./VidioNotice";
import { PublicNoticeData } from "./PublicNoticeData";
import { CustomDefine } from "../../custom/CustomDefine";
import { MinCtrl } from "../min/MinCtrl";

/**广告行为管理器 */
export class PublicNoticeMgr {
    static _ins: PublicNoticeMgr = null;
    noticeQueue: Array<BaseNotice> = [];
    //当前行为是否正在进行
    behaviorIsStop: boolean = false;
    //当前队列索引
    curQueueIndex: number = 0;
    //动画周期
    aniCycle: boolean = false;
    //当前行动者
    curBaseNotice: BaseNotice = null;
    //缓动
    private _TWEEN: Tween;
    private _TIMER: void;
    //父级的UI
    _parentUI: any;
    //oData 电子屏的数据
    oData: any = [];
    //焦点判断
    isFocus: boolean = true;
    //记录队列的数量
    queueChildNumber: number = 0;
    constructor() {
        EventManager.ins.on(CustomDefine.EVENT_CLOSELED, this, this.closeLED)
        EventManager.ins.on(CustomDefine.EVENT_OPENLED, this, this.openLED)
        EventManager.ins.on(CustomDefine.EVENT_FOUCE, this, this.onFouce);
    }

    onFouce(b: any) {
        if (!b.data) {
            this.closeLED();
        } else {
            Laya.timer.once(50, this, () => {
                if (!this._parentUI && PublicNoticeMgr.ins().oData.length <= 0) return
                console.log("onFouce开启openLED")
                this.openLED();
            })
        }

    }

    static ins() {
        if (!this._ins) {
            this._ins = new PublicNoticeMgr();
        }
        return this._ins
    }

    /**
     * 进入
     * @param parent 
     */
    onInto(parent: Laya.Sprite, data: any) {
        this.onDestory();
        this.clearAllQueue();
        this.queueChildNumber = 0;

        this._parentUI = parent;
        this.oData = data;
        let newArr: Array<any> = [];
        let goldContent: GoldContent = new GoldContent();
        goldContent.onInto({}, parent)
        this.addNoticeQueue(goldContent)
        this.queueChildNumber += 1;
        if (data && data.length > 0) {
            data.forEach(element => {
                newArr.push(element)
            });
        }
        //debug
        // newArr.length = 0
        //debug
        if (newArr.length <= 0) {

        } else {
            newArr.forEach((e, i) => {
                let publicNoticeData = new PublicNoticeData()
                publicNoticeData.onInit(e);
                this.onCreateBaseNoticeItem(publicNoticeData, parent);

            });
        }
        Laya.timer.loop(200, this, this.isReady);



    }

    /**队列是否准备开始 */
    isReady() {
        if (this.queueChildNumber >= this.noticeQueue.length) {
            Laya.timer.clear(this, this.isReady);
            this.behaviorStart();
        }
    }

    //实例化item
    onCreateBaseNoticeItem(e, parent) {
        if (!parent && this._parentUI) {
            parent = this._parentUI;
        }
        let _baseNotice = null;
        if (e.type == NOTICETYPE.video) {
            _baseNotice = new VidioNotice()//Laya.Pool.getItemByClass("VidioNotice", VidioNotice);
        } else if (e.type == NOTICETYPE.image) {
            _baseNotice = new ImageNotice()//Laya.Pool.getItemByClass("ImageNotice", ImageNotice);
        } else if (e.type == NOTICETYPE.imageText) {
            _baseNotice = new ImageTextNotice()//Laya.Pool.getItemByClass("ImageTextNotice", ImageTextNotice);
        } else if (e.type == NOTICETYPE.text) {
            _baseNotice = new TextNotice()//Laya.Pool.getItemByClass("TextNotice", TextNotice);
        } else if (e.type == NOTICETYPE.noticeContnet) {
            _baseNotice = new NoticeContent()//Laya.Pool.getItemByClass("NoticeContent", NoticeContent);
        } else if (e.type == NOTICETYPE.goldContent) {
            _baseNotice = new GoldContent()//Laya.Pool.getItemByClass("GoldContent", GoldContent);
        }

        // if (e.type == NOTICETYPE.video) {
        //     _baseNotice = Laya.Pool.getItemByClass("VidioNotice", VidioNotice);
        // } else if (e.type == NOTICETYPE.image) {
        //     _baseNotice = Laya.Pool.getItemByClass("ImageNotice", ImageNotice);
        // } else if (e.type == NOTICETYPE.imageText) {
        //     _baseNotice = Laya.Pool.getItemByClass("ImageTextNotice", ImageTextNotice);
        // } else if (e.type == NOTICETYPE.text) {
        //     _baseNotice = Laya.Pool.getItemByClass("TextNotice", TextNotice);
        // } else if (e.type == NOTICETYPE.noticeContnet) {
        //     _baseNotice = Laya.Pool.getItemByClass("NoticeContent", NoticeContent);
        // } else if (e.type == NOTICETYPE.goldContent) {
        //     _baseNotice = Laya.Pool.getItemByClass("GoldContent", GoldContent);
        // }

        if (!_baseNotice) return
        _baseNotice.onInto(e, parent, () => {
            this.queueChildNumber += 1;
        });
        if (_baseNotice.temporary) {
            this.halfwayAddNoticeQueue(this.curQueueIndex, _baseNotice)
        } else {
            this.addNoticeQueue(_baseNotice)
        }
    }

    clearAllQueue() {
        if (this._TWEEN) {
            Laya.Tween.clear(this._TWEEN);
        }
        Laya.timer.clear(this, this.behaviorTween);
        // this.curQueueIndex = 0;
        this.noticeQueue.splice(0, this.noticeQueue.length);
        this.noticeQueue.length = 0;

        // EventManager.ins.event(CustomDefine.)

    }

    onDestory() {
        if (this.curBaseNotice) {
            this.behaviorStop();
        }
        this.noticeQueue.forEach((e, i) => {
            if (e) {
                e.reset();
                e.onDestory();
                // Laya.Pool.recoverByClass(e);
            }
        })
    }


    /**路径 */
    getInitPosByParent(parent: Laya.Sprite, n: RUNTYPE, _BaseNotice: BaseNotice) {
        let _init = {};
        let _end = {};
        let nAlpha = 1;
        let _stop = { x: 0, y: 0 }
        let _bWidth = _BaseNotice.UI.width >= parent.width ? _BaseNotice.UI.width : parent.width
        let _bHeight = _BaseNotice.UI.height >= parent.height ? _BaseNotice.UI.height : parent.height
        switch (n) {
            case RUNTYPE.gradually:
                _init["x"] = _BaseNotice.UI.x;
                _init["y"] = _BaseNotice.UI.y;
                _end["x"] = _BaseNotice.UI.x;
                _end["y"] = _BaseNotice.UI.y;
                nAlpha = 0
                break;
            case RUNTYPE.lower:
                _init["x"] = _BaseNotice.UI.x;
                _init["y"] = _bHeight;
                _end["x"] = _BaseNotice.UI.x;
                _end["y"] = -_bHeight;
                _stop["x"] = _BaseNotice.UI.x;
                _stop["y"] = 0;
                break;
            case RUNTYPE.right:
                _init["x"] = _bWidth;
                _init["y"] = _BaseNotice.UI.y;
                _end["x"] = -_bWidth;
                _end["y"] = _BaseNotice.UI.y;
                _stop["x"] = 0;
                _stop["y"] = _BaseNotice.UI.y;
                break;
            case RUNTYPE.noticeRight:
                _init["x"] = 0;
                _init["y"] = _BaseNotice.UI.y;
                _end["x"] = -_bWidth;
                _end["y"] = _BaseNotice.UI.y;
                _stop["x"] = -_bWidth;
                _stop["y"] = _BaseNotice.UI.y;
                break;
            default:
                break;
        }
        _init["width"] = _BaseNotice.UI.width;
        _init["height"] = _BaseNotice.UI.height;
        _BaseNotice.setInitAlpha(nAlpha);
        _BaseNotice.setInitPos(_init["x"], _init["y"]);
        _BaseNotice.setEndtPos(_end["x"], _end["y"]);
        _BaseNotice.setStopPos(_stop.x, _stop.y);
        _BaseNotice.setWH(_init["width"], _init["height"]);
    }



    //末尾插入
    addNoticeQueue(notice: BaseNotice) {
        this.noticeQueue.push(notice);
        console.log("===================addNoticeQueue=============================", this.noticeQueue)
    }

    //插入下一条
    halfwayAddNoticeQueue(index: number, notice: BaseNotice) {
        this.noticeQueue.splice(index, 0, notice);
        console.log("===================halfwayAddNoticeQueue=============================", this.noticeQueue, index)
    }

    //删除
    deleteNoticeQueueItem(index: number) {
        this.noticeQueue.splice(index, 1);
        console.log("===================deleteNoticeQueueItem=============================", this.noticeQueue)
    }

    //获取
    getNoticeQueueItem() {
        if (this.noticeQueue.length <= 0) return
        let _notice: BaseNotice = this.noticeQueue[this.curQueueIndex];
        this.curQueueIndex++;
        if (!_notice) {
            this.curQueueIndex = 0;
            return this.getNoticeQueueItem();
        }
        return _notice
    }

    //行为开始
    behaviorStart() {
        let _notice: BaseNotice = this.getNoticeQueueItem();
        if (!_notice) {
            this.behaviorIsStop = true;
            return
        }
        this.behaviorIsStop = false;
        this.curBaseNotice = _notice;
        this.aniCycle = false;
        _notice.onStart();
        // console.log("行为开始=============================", _notice)
    }

    //行为结束
    behaviorStop() {
        // this.curBaseNotice.onDestory();
        if (!this.curBaseNotice) return
        this.curBaseNotice.reset();
        if (this.curBaseNotice.temporary) {
            this.curBaseNotice.onDestory()
            this.deleteNoticeQueueItem(this.curQueueIndex - 1)
        }
        this.curBaseNotice = null;
        // console.log("行为结束=============================", this.curBaseNotice)
    }


    //行为方式
    behaviorTween(item: BaseNotice) {
        let _pre = {};
        switch (item.runType) {
            case RUNTYPE.gradually:
                let nAlpha = (item.UI.alpha > 0) ? 0 : 1;
                _pre = { "alpha": nAlpha }
                break;
            case RUNTYPE.lower:
                if (item.UI.y == item.initPos.y) {
                    _pre = { "x": item.stopPos.x, "y": item.stopPos.y }
                } else if (item.UI.y == item.stopPos.y) {
                    _pre = { "x": item.endPos.x, "y": item.endPos.y }
                }
                break;
            case RUNTYPE.right:
                if (item.UI.x == item.initPos.x) {
                    _pre = { "x": item.stopPos.x, "y": item.stopPos.y }
                } else if (item.UI.x == item.stopPos.x) {
                    _pre = { "x": item.endPos.x, "y": item.endPos.y }
                }
                break;
            case RUNTYPE.noticeRight:
                if (item.UI.x == item.initPos.x) {
                    _pre = { "x": item.stopPos.x, "y": item.stopPos.y }
                } else if (item.UI.x == item.stopPos.x) {
                    _pre = null
                }
                break;
            default:
                break;
        }
        this.execBehaviorTween1(item, _pre);
    }

    /* 行为动画1*/
    execBehaviorTween1(item: BaseNotice, _pre: any) {
        if (!_pre) {
            this.behaviorStop();
            this.behaviorStart();
            return
        }
        this._TWEEN = Laya.Tween.to(item.UI, _pre, item.runTime * 1000, null, Laya.Handler.create(this, this.execBehaviorTween2, [item]));
    }

    /* 行为动画2 */
    execBehaviorTween2(item: BaseNotice) {
        if (this.aniCycle) {
            this.behaviorStop();
            this.behaviorStart();
            return
        }
        this.aniCycle = true;
        Laya.timer.once(item.stopTime * 1000, this, this.behaviorTween, [item])
    }


    /**图集动画 */
    playAni(aniType: PLAYBEFOREANITYPE, callback: Function) {
        let url = ""
        switch (aniType) {
            case PLAYBEFOREANITYPE.caoxi:
                url = "res/atlas/led/xuhua.atlas"
                break;
            case PLAYBEFOREANITYPE.snowflake:
                url = "res/atlas/led/chaoxi.atlas"
                break;

            default:
                break;
        }
        let anim: Laya.Animation = new Laya.Animation();
        this._parentUI.addChild(anim);
        anim.scale(2, 2)
        anim.loadAtlas(url, Laya.Handler.create(this, this.aniPlay, [anim]));
        anim.on(Laya.Event.COMPLETE, this, () => {
            anim.destroy();
            callback();
        })
    }

    /**图集动画 */
    aniPlay(anim: Laya.Animation) {
        anim.play(0, false)
    }

    //关联者
    public _associate: any = null;
    closeLED(associate?: any) {
        if (this._associate) return
        this._associate = (associate && associate.data) ? associate.data : this._associate
        this.onDestory();
        this.clearAllQueue()
        MinCtrl.ins.hideGoldUI();
        console.log("LED关联者==========关闭=============", this._associate)
    }

    openLED(associate?: any) {
        let ass = (associate && associate.data) ? associate.data : null;
        if (this._associate && this._associate != ass) return
        this.onInto(this._parentUI, PublicNoticeMgr.ins().oData)
        MinCtrl.ins.showGoldUI();
        console.log("LED关联者===========打开============", this._associate, ass)
        this._associate = null;
    }

    /**添加宝藏视频 */
    addVidio(arr: Array<any>) {
        let _rArr = [];
        if (arr.length <= 0) return

        arr.forEach(element => {
            if (element.media && element.media != "") {
                let vBaseNotice = new BaseNotice() as VidioNotice;
                vBaseNotice.data.url = element.media;
                vBaseNotice.parent = this._parentUI;
                _rArr.unshift(vBaseNotice);
            }
        });
        return _rArr;
    }

}