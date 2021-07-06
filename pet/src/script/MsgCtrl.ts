import { ui } from "../ui/layaMaxUI";
import { HttpManager } from "../manager/HttpManager";
import { UserCtrl } from "./user/UserCtrl";
import { GameCtrl } from "./GameCtrl";

/*
* 2021-06-08 andy
提示信息控制
*/
export class MsgCtrl {
	/** 提示信息标识 */
    public title:string="";
    /** 提示信息内容 */
    public desc:string="";
    /** 回调函数 */
    public callBack:Function=null;
    /** 回调参数 */
    public callBackData:any=null;

	private ui:ui.MsgUI;

	private static _ins: MsgCtrl;
	public static get ins(): MsgCtrl {
		if (!this._ins)
		MsgCtrl._ins = new MsgCtrl();
		return this._ins;
	}
	constructor() {
		if (MsgCtrl._ins != null)
			throw new Error("MsgCtrl is single!");
		this.ui=new ui.MsgUI();
		LayerManager.ins.addChild(this.ui,LayerName.top);
		this.ui.visible = false;
		this.ui.spBg.graphics.clear();

		let x:number = (Define.DeviceW -Define.canvasWidth) >> 1;
		this.ui.spBg.graphics.drawRect(x,0,Define.canvasWidth,Define.DeviceH,"#000000");
	}


	public init(): void {
		this.ui.btnConfirm.on(Laya.Event.CLICK,this,this.confirm);
	}

	
	public showMsg(desc:string,btnWord:string="确定",callBack:Function=null,callBackData:any=null):void{
		this.desc = desc;
		this.callBack = callBack;
		this.callBackData = callBackData;

		this.ui.btnConfirm.label = btnWord;
		this.ui.txtDesc.text = desc;
		this.ui.visible = true;
	}

	private confirm():void{
		if(this.callBack){
			this.callBack(this.callBackData);
			this.callBackData=null;
			this.callBack=null;
		}
		this.ui.visible =false;
	}

}