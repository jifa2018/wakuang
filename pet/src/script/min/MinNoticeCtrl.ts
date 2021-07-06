import { CustomDefine } from "../../custom/CustomDefine";
import { ui } from "../../ui/layaMaxUI";
import { UserData } from "../user/UserData";

/**
 * 挖矿中奖通知  消息队列显示
 * 2021-06-10 andy
 */
export default class MinNoticeCtrl {
    private ui: ui.min.MinNoticeUI;
    private arrData: Array<MinNoticeData>;

    private static _ins: MinNoticeCtrl;
    public static get ins(): MinNoticeCtrl {
        if (!this._ins)
            MinNoticeCtrl._ins = new MinNoticeCtrl();
        return this._ins;
    }
    constructor() {
        if (MinNoticeCtrl._ins != null)
            throw new Error("MinNoticeCtrl is single!");
        this.ui = new ui.min.MinNoticeUI();
        this.ui.visible = false;
        LayerManager.ins.addChild(this.ui, LayerName.ui_effect);
        this.arrData = [];
    }
    /**
     * 设置挖矿通知位置
     * @param x 
     * @param y 
     * @param parent 
     */
    public resetNoticePos(x: number, y: number, parent: Laya.Sprite = null): void {
        if (parent) {
            parent.addChild(this.ui);
        } else {
            LayerManager.ins.addChild(this.ui, LayerName.ui_effect);
        }
        this.ui.x = x;
        this.ui.y = y;
    }
    /**
     * 增加挖矿消息到队列
     * @param data MinNoticeData
     */
    public addNotice(data: MinNoticeData): void {
        if (data) {
            this.arrData.push(data);
        }
        this.checkNotice();
    }

    private checkNotice(): void {
        if (!this.ui.visible) {
            let notice: MinNoticeData = this.arrData.shift();
            this.setNotice(notice);
            if (UserData.ins.isMining) {
                //更换遮罩宽度
                this.ui.spContent.width = 988;
                this.ui.spMask.graphics.clear();
                this.ui.spMask.graphics.drawRect(0, 0, this.ui.spContent.width, 70, "#000000");
                //设置矿洞LED屏显示位置
                this.resetNoticePos(68.5, 466);
            } else {
                //买票界面
                this.ui.spContent.width = 800;
                this.ui.spMask.graphics.clear();
                this.ui.spMask.graphics.drawRect(0, 0, this.ui.spContent.width, 70, "#000000");
                this.resetNoticePos(161.5, 731);
            }
        }
    }
    private setNotice(data: MinNoticeData): void {
        if (!data) return;
        EventManager.ins.event(CustomDefine.EVENT_MIN_NOTICE, true);
        this.ui.imgHead.skin = data.head;
        this.ui.txtUserName.text = data.userName;
        this.ui.txtItemName.text = data.desc;

        this.ui.spContent.x = this.ui.spContent.width;
        this.ui.visible = true;
        //玩家名字动态长度，物品名字贴着玩家名字
        this.ui.txtItemName.x = this.ui.txtUserName.x + this.ui.txtUserName.displayWidth + 10;

        let toX: number = this.ui.txtItemName.x + this.ui.txtItemName.displayWidth + 10;
        Laya.Tween.to(this.ui.spContent, { x: -toX }, toX * 5, null, Laya.Handler.create(this, () => {
            Laya.Tween.clearAll(this.ui.spContent);
            this.ui.visible = false;
            EventManager.ins.event(CustomDefine.EVENT_MIN_NOTICE, false);
            this.checkNotice();
        }, null, false))
    }
}

/*
* 挖矿中奖通知 2021-06-10 andy
*/
export class MinNoticeData {
    /** 用户ID */
    public userId: string;
    /** 用户名字 */
    public userName: string;
    /** 用户头像 */
    public head: string;
    /** 实物ID */
    public itemId: string;
    /** 实物描述 */
    public itemName:string;
    /** 实物道具图片 */
    public icon:string;
    /** 凸币数量 */
    public gold: number;

    /** 中奖实物或金币 */
    public desc: string;

    constructor(userName:string,head:string,itemName:string,icon:string,gold:number){
        this.userName = userName;
        this.head = head;
        this.itemName = itemName;
        this.icon = icon;
        this.gold = gold;

        this.desc = "挖到 " + (this.gold > 0 ? this.gold + "凸币" : this.itemName);

    }

}